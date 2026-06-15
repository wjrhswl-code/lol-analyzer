import { NextRequest, NextResponse } from 'next/server'
import {
  getSummonerByRiotId,
  getRankedInfo,
  getMatchIds,
  getMatch,
  getChampionMastery,
  processMatch,
  calcAverageStats,
} from '@/lib/riotApi'
import { Region } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gameName = searchParams.get('gameName')
  const tagLine = searchParams.get('tagLine')
  const region = (searchParams.get('region') || 'kr') as Region
  const queue = searchParams.get('queue') ? Number(searchParams.get('queue')) : undefined

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: '소환사명과 태그를 입력해주세요.' }, { status: 400 })
  }

  const RIOT_KEY = process.env.RIOT_API_KEY
  console.log('KEY CHECK:', RIOT_KEY ? 'exists:' + RIOT_KEY.slice(0, 8) : 'MISSING')

  if (!RIOT_KEY) {
    return NextResponse.json({ error: 'RIOT_API_KEY가 설정되지 않았습니다.' }, { status: 500 })
  }

  try {
    const summoner = await getSummonerByRiotId(gameName, tagLine, region)
    const rankedData = await getRankedInfo(summoner.id, region)
    const soloRank = rankedData.find((r: any) => r.queueType === 'RANKED_SOLO_5x5')
    const flexRank = rankedData.find((r: any) => r.queueType === 'RANKED_FLEX_SR')

    const matchIds = await getMatchIds(summoner.puuid, region, 20, queue)

    const matchDataList = await Promise.allSettled(
      matchIds.map((id: string) => getMatch(id, region))
    )
    const matches = matchDataList
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => processMatch(r.value, summoner.puuid))
      .filter(Boolean) as any[]

    const masteryData = await getChampionMastery(summoner.puuid, region, 5)
    const overallStats = calcAverageStats(matches)

    const champMap: Record<string, any[]> = {}
    for (const m of matches) {
      if (!champMap[m.championName]) champMap[m.championName] = []
      champMap[m.championName].push(m)
    }
    const champStats = Object.entries(champMap)
      .map(([name, ms]) => ({
        championName: name,
        games: ms.length,
        wins: ms.filter((m: any) => m.win).length,
        winRate: Math.round(ms.filter((m: any) => m.win).length / ms.length * 100),
        ...calcAverageStats(ms),
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 8)

    return NextResponse.json({
      summoner,
      soloRank,
      flexRank,
      matches,
      overallStats,
      champStats,
      masteryData,
    })
  } catch (err: any) {
    console.error('[summoner API error]', err?.response?.data || err.message)
    const status = err?.response?.status || 500
    if (status === 404) {
      return NextResponse.json({ error: '소환사를 찾을 수 없습니다.' }, { status: 404 })
    }
    if (status === 403) {
      return NextResponse.json({ error: 'API 키가 만료되었거나 유효하지 않습니다.' }, { status: 403 })
    }
    if (status === 429) {
      return NextResponse.json({ error: 'API 요청 한도를 초과했습니다.' }, { status: 429 })
    }
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}