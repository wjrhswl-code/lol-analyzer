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

  if (!process.env.RIOT_API_KEY) {
    return NextResponse.json({ error: 'RIOT_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해주세요.' }, { status: 500 })
  }

  try {
    // 1. 소환사 프로필
    const summoner = await getSummonerByRiotId(gameName, tagLine, region)

    // 2. 랭크 정보
    const rankedData = await getRankedInfo(summoner.id, region)
    const soloRank = rankedData.find(r => r.queueType === 'RANKED_SOLO_5x5')
    const flexRank = rankedData.find(r => r.queueType === 'RANKED_FLEX_SR')

    // 3. 최근 매치 ID
    const matchIds = await getMatchIds(summoner.puuid, region, 20, queue)

    // 4. 매치 상세 (최대 20개, 병렬)
    const matchDataList = await Promise.allSettled(
      matchIds.map(id => getMatch(id, region))
    )
    const matches = matchDataList
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => processMatch(r.value, summoner.puuid))
      .filter(Boolean) as any[]

    // 5. 챔피언 숙련도
    const masteryData = await getChampionMastery(summoner.puuid, region, 5)

    // 6. 통계 계산
    const overallStats = calcAverageStats(matches)

    // 챔피언별 통계
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
      return NextResponse.json({ error: '소환사를 찾을 수 없습니다. 소환사명과 태그를 확인해주세요.' }, { status: 404 })
    }
    if (status === 403) {
      return NextResponse.json({ error: 'API 키가 만료되었거나 유효하지 않습니다.' }, { status: 403 })
    }
    if (status === 429) {
      return NextResponse.json({ error: 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 })
    }
    return NextResponse.json({ error: '데이터를 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
