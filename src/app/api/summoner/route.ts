import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { Region, REGION_TO_PLATFORM, QUEUE_NAMES } from '@/lib/types'

const RIOT_KEY = () => process.env.RIOT_API_KEY || ''

function regionUrl(region: Region) { return `https://${region}.api.riotgames.com` }
function platformUrl(region: Region) { return `https://${REGION_TO_PLATFORM[region].toLowerCase()}.api.riotgames.com` }
function headers() { return { 'X-Riot-Token': RIOT_KEY() } }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gameName = searchParams.get('gameName')
  const tagLine = searchParams.get('tagLine')
  const region = (searchParams.get('region') || 'kr') as Region

  console.log('RIOT KEY START:', RIOT_KEY().slice(0, 10))

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: '소환사명과 태그를 입력해주세요.' }, { status: 400 })
  }

  if (!RIOT_KEY()) {
    return NextResponse.json({ error: 'RIOT_API_KEY가 없습니다.' }, { status: 500 })
  }

  try {
    const acctRes = await axios.get(
      `${platformUrl(region)}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: headers() }
    )
    const { puuid } = acctRes.data

    const sumRes = await axios.get(
      `${regionUrl(region)}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: headers() }
    )
    const summoner = { ...sumRes.data, gameName, tagLine }

    const rankedRes = await axios.get(
      `${regionUrl(region)}/lol/league/v4/entries/by-summoner/${summoner.id}`,
      { headers: headers() }
    )
    const soloRank = rankedRes.data.find((r: any) => r.queueType === 'RANKED_SOLO_5x5')
    const flexRank = rankedRes.data.find((r: any) => r.queueType === 'RANKED_FLEX_SR')

    const platform = REGION_TO_PLATFORM[region].toLowerCase()
    const matchIdsRes = await axios.get(
      `https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=20`,
      { headers: headers() }
    )
    const matchIds: string[] = matchIdsRes.data

    const matchResults = await Promise.allSettled(
      matchIds.map(id =>
        axios.get(`https://${platform}.api.riotgames.com/lol/match/v5/matches/${id}`, { headers: headers() })
      )
    )

    const matches = matchResults
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => {
        const info = r.value.data.info
        const p = info.participants.find((x: any) => x.puuid === puuid)
        if (!p) return null
        const dur = info.gameDuration
        const durMin = dur / 60
        const cs = p.totalMinionsKilled + p.neutralMinionsKilled
        const kda = p.deaths === 0 ? p.kills + p.assists : (p.kills + p.assists) / p.deaths
        const team = info.participants.filter((x: any) => x.teamId === p.teamId)
        const teamKills = team.reduce((s: number, x: any) => s + x.kills, 0)
        return {
          matchId: r.value.data.metadata.matchId,
          gameCreation: info.gameCreation,
          gameDuration: dur,
          queueId: info.queueId,
          queueName: QUEUE_NAMES[info.queueId] || '기타',
          win: p.win,
          championName: p.championName,
          championId: p.championId,
          kills: p.kills, deaths: p.deaths, assists: p.assists,
          kda: Math.round(kda * 100) / 100,
          cs, csPerMin: Math.round(cs / durMin * 10) / 10,
          visionScore: p.visionScore,
          controlWards: p.controlWardsPlaced,
          damageDealt: p.totalDamageDealtToChampions,
          damageDealtPerMin: Math.round(p.totalDamageDealtToChampions / durMin),
          killParticipation: teamKills > 0 ? Math.round((p.kills + p.assists) / teamKills * 100) : 0,
          items: [p.item0,p.item1,p.item2,p.item3,p.item4,p.item5,p.item6],
          doubleKills: p.doubleKills, tripleKills: p.tripleKills,