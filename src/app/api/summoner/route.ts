import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gameName = searchParams.get('gameName') || ''
  const tagLine = searchParams.get('tagLine') || ''
  const region = searchParams.get('region') || 'kr'
  const key = process.env.RIOT_API_KEY || ''

  const platformMap: Record<string, string> = {
    kr: 'asia', jp1: 'asia', na1: 'americas', br1: 'americas',
    la1: 'americas', la2: 'americas', euw1: 'europe', eune1: 'europe',
    tr1: 'europe', ru: 'europe', oc1: 'sea'
  }
  const queueMap: Record<number, string> = {
    420: '솔로랭크', 440: '자유랭크', 450: '칼바람', 400: '일반', 430: '일반'
  }

  const platform = platformMap[region] || 'asia'
  const h = { 'X-Riot-Token': key }

  console.log('RIOT KEY START:', key.slice(0, 10))

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: '소환사명과 태그를 입력해주세요.' }, { status: 400 })
  }
  if (!key) {
    return NextResponse.json({ error: 'API 키가 없습니다.' }, { status: 500 })
  }

  try {
    const acct = await axios.get(
      `https://${platform}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: h }
    )
    const puuid = acct.data.puuid as string

    const sum = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: h }
    )
    const summoner = { ...sum.data, gameName, tagLine }

    const ranked = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`,
      { headers: h }
    )
    const soloRank = ranked.data.find((r: any) => r.queueType === 'RANKED_SOLO_5x5') || null
    const flexRank = ranked.data.find((r: any) => r.queueType === 'RANKED_FLEX_SR') || null

    const idsRes = await axios.get(
      `https://${platform}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=20`,
      { headers: h }
    )
    const ids = idsRes.data as string[]

    const results = await Promise.allSettled(
      ids.map((id) =>
        axios.get(`https://${platform}.api.riotgames.com/lol/match/v5/matches/${id}`, { headers: h })
      )
    )

    const matches = []
    for (const r of results) {
      if (r.status !== 'fulfilled') continue
      const info = r.value.data.info
      const p = info.participants.find((x: any) => x.puuid === puuid)
      if (!p) continue
      const dur = info.gameDuration as number
      const durMin = dur / 60
      const cs = (p.totalMinionsKilled + p.neutralMinionsKilled) as number
      const kda = p.deaths === 0
        ? (p.kills + p.assists) as number
        : ((p.kills + p.assists) / p.deaths) as number
      const team = info.participants.filter((x: any) => x.teamId === p.teamId)
      const teamKills = team.reduce((s: number, x: any) => s + x.kills, 0) as number
      matches.push({
        matchId: r.value.data.metadata.matchId,
        gameCreation: info.gameCreation,
        gameDuration: dur,
        queueId: info.queueId,
        queueName: (queueMap[info.queueId as number]) || '기타',
        win: p.win,
        championName: p.championName,
        championId: p.championId,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        kda: Math.round(kda * 100) / 100,
        cs: cs,
        csPerMin: Math.round(cs / durMin * 10) / 10,
        visionScore: p.visionScore,
        controlWards: p.controlWardsPlaced,
        damageDealt: p.totalDamageDealtToChampions,
        damageDealtPerMin: Math.round((p.totalDamageDealtToChampions as number) / durMin),
        killParticipation: teamKills > 0
          ? Math.round(((p.kills + p.assists) / teamKills) * 100)
          : 0,
        items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
        doubleKills: p.doubleKills,
        tripleKills: p.tripleKills,
        quadraKills: p.quadraKills,
        pentaKills: p.pentaKills,
        lane: p.lane,
      })
    }

    const len = matches.length
    const overallStats = len === 0 ? null : {
      avgKda: Math.round(matches.reduce((s, m) => s + m.kda, 0) / len * 100) / 100,
      avgCsPerMin: Math.round(matches.reduce((s, m) => s + m.csPerMin, 0) / len * 10) / 10,
      avgVision: Math.round(matches.reduce((s, m) => s + m.visionScore, 0) / len),
      winRate: Math.round(matches.filter((m) => m.win).length / len * 100),
      games: len,
    }

    return NextResponse.json({ summoner, soloRank, flexRank, matches, overallStats })

  } catch (err: any) {
    const status = (err?.response?.status || 500) as number
    console.error('[API error]', status, err?.response?.data || err.message)
    if (status === 403) {
      return NextResponse.json({ error: 'API 키가 만료되었거나 유효하지 않습니다.' }, { status: 403 })
    }
    if (status === 404) {
      return NextResponse.json({ error: '소환사를 찾을 수 없습니다.' }, { status: 404 })
    }
    if (status === 429) {
      return NextResponse.json({ error: 'API 요청 한도 초과입니다.' }, { status: 429 })
    }
    return NextResponse.json({ error: '오류가 발생했습니다.' }, { status: 500 })
  }
}