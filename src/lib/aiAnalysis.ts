import Anthropic from '@anthropic-ai/sdk'
import { ProcessedMatch, AnalysisResult } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// 챔피언별 장인 기준 통계 (실제 서비스에선 Riot API + DB로 관리)
const MASTER_BENCHMARKS: Record<string, {
  tier: string
  avgKda: number
  avgCsPerMin: number
  avgVision: number
  avgDamagePerMin: number
  avgKillParticipation: number
  avgControlWards: number
  avgDeaths: number
  playstyle: string
}> = {
  Ahri: {
    tier: '챌린저',
    avgKda: 4.8,
    avgCsPerMin: 7.9,
    avgVision: 28,
    avgDamagePerMin: 1050,
    avgKillParticipation: 72,
    avgControlWards: 1.8,
    avgDeaths: 2.1,
    playstyle: '6레벨 이후 공격적 로밍, 사이드 라인 압박, Q-E-W-R 콤보로 1:1 이니시',
  },
  Azir: {
    tier: '챌린저',
    avgKda: 4.2,
    avgCsPerMin: 9.8,
    avgVision: 31,
    avgDamagePerMin: 1240,
    avgKillParticipation: 68,
    avgControlWards: 2.1,
    avgDeaths: 1.8,
    playstyle: 'CS 극대화 우선, W-E 콤보 병사 소환, 15~20분 포탑 압박 후 오브젝트 확보',
  },
  Ryze: {
    tier: '챌린저',
    avgKda: 3.9,
    avgCsPerMin: 10.1,
    avgVision: 28,
    avgDamagePerMin: 1180,
    avgKillParticipation: 64,
    avgControlWards: 1.9,
    avgDeaths: 2.1,
    playstyle: '초반 CS 90+ 목표, 밴드 적극 활용, 아이템 3개 이후 팀파이트 주도',
  },
  Syndra: {
    tier: '챌린저',
    avgKda: 4.5,
    avgCsPerMin: 8.5,
    avgVision: 29,
    avgDamagePerMin: 1120,
    avgKillParticipation: 70,
    avgControlWards: 2.0,
    avgDeaths: 1.9,
    playstyle: 'E-Q 구체 CC 후 R 폭발 조합, 레인전 우세 후 로밍',
  },
  Zed: {
    tier: '챌린저',
    avgKda: 5.1,
    avgCsPerMin: 8.8,
    avgVision: 22,
    avgDamagePerMin: 1300,
    avgKillParticipation: 75,
    avgControlWards: 1.5,
    avgDeaths: 1.7,
    playstyle: '레벨 6 W-R-E-Q-AA 원콤 패턴, 아군 정글 합류 솔로킬 유도, 암살 후 즉시 귀환',
  },
  Jinx: {
    tier: '챌린저',
    avgKda: 5.2,
    avgCsPerMin: 9.2,
    avgVision: 26,
    avgDamagePerMin: 1380,
    avgKillParticipation: 78,
    avgControlWards: 1.7,
    avgDeaths: 2.0,
    playstyle: '초반 CS 집중, 킬 후 스노우볼 파워스파이크, 로켓 전환 타이밍이 핵심',
  },
  Caitlyn: {
    tier: '챌린저',
    avgKda: 4.8,
    avgCsPerMin: 9.5,
    avgVision: 28,
    avgDamagePerMin: 1200,
    avgKillParticipation: 70,
    avgControlWards: 2.0,
    avgDeaths: 1.8,
    playstyle: '함정-헤드샷 콤보, 긴 사거리 이점 활용 하라스, 3아이템 이후 딜 폭발',
  },
  LeeSin: {
    tier: '챌린저',
    avgKda: 4.3,
    avgCsPerMin: 5.8,
    avgVision: 35,
    avgDamagePerMin: 980,
    avgKillParticipation: 82,
    avgControlWards: 2.5,
    avgDeaths: 2.3,
    playstyle: 'Q 착지 후 갱킹, 인세크 킥으로 포지션 역전, 드래곤/바론 타이밍 주도',
  },
  Thresh: {
    tier: '챌린저',
    avgKda: 4.6,
    avgCsPerMin: 0.3,
    avgVision: 52,
    avgDamagePerMin: 420,
    avgKillParticipation: 80,
    avgControlWards: 3.2,
    avgDeaths: 1.5,
    playstyle: '랜턴 포지션 관리, Q 훅 각도 계산, 팀파이트 E 이니시 타이밍',
  },
  default: {
    tier: '챌린저',
    avgKda: 4.0,
    avgCsPerMin: 8.0,
    avgVision: 27,
    avgDamagePerMin: 1000,
    avgKillParticipation: 70,
    avgControlWards: 1.8,
    avgDeaths: 2.0,
    playstyle: '안정적인 라인전, 시야 관리, 오브젝트 중심 플레이',
  },
}

export function getMasterBenchmark(championName: string) {
  return MASTER_BENCHMARKS[championName] || MASTER_BENCHMARKS.default
}

export async function analyzeMatch(
  match: ProcessedMatch,
  recentMatches: ProcessedMatch[],
): Promise<AnalysisResult> {
  const benchmark = getMasterBenchmark(match.championName)

  // 유사 챔피언 최근 게임 통계
  const sameChampMatches = recentMatches.filter(m => m.championName === match.championName)
  const recentAvg = sameChampMatches.length > 0 ? {
    avgKda: Math.round(sameChampMatches.reduce((s, m) => s + m.kda, 0) / sameChampMatches.length * 10) / 10,
    avgCsPerMin: Math.round(sameChampMatches.reduce((s, m) => s + m.csPerMin, 0) / sameChampMatches.length * 10) / 10,
    avgVision: Math.round(sameChampMatches.reduce((s, m) => s + m.visionScore, 0) / sameChampMatches.length),
    games: sameChampMatches.length,
    wins: sameChampMatches.filter(m => m.win).length,
  } : null

  const prompt = `
당신은 리그 오브 레전드 고수 코치입니다. 아래 전적 데이터를 분석하여 한국어로 구체적이고 실용적인 피드백을 제공하세요.

## 이번 게임 데이터
- 챔피언: ${match.championName}
- 결과: ${match.win ? '승리' : '패배'}
- KDA: ${match.kills}/${match.deaths}/${match.assists} (${match.kda})
- CS: ${match.cs}개 (${match.csPerMin}/분)
- 시야 점수: ${match.visionScore}
- 제어 와드: ${match.controlWards}개
- 분당 딜량: ${match.damageDealtPerMin}
- 킬 관여율: ${match.killParticipation}%
- 게임 시간: ${Math.floor(match.gameDuration / 60)}분
- 더블킬: ${match.doubleKills}, 트리플킬: ${match.tripleKills}, 펜타킬: ${match.pentaKills}
- 오브젝트 딜량: ${match.turretDamage}

## ${match.championName} 챌린저 장인 평균
- 평균 KDA: ${benchmark.avgKda}
- CS/분: ${benchmark.avgCsPerMin}
- 시야 점수: ${benchmark.avgVision}
- 분당 딜량: ${benchmark.avgDamagePerMin}
- 킬 관여율: ${benchmark.avgKillParticipation}%
- 제어 와드: ${benchmark.avgControlWards}개
- 장인 플레이스타일: ${benchmark.playstyle}

${recentAvg ? `## 최근 ${recentAvg.games}게임 ${match.championName} 평균
- 평균 KDA: ${recentAvg.avgKda}
- CS/분: ${recentAvg.avgCsPerMin}
- 시야 점수: ${recentAvg.avgVision}
- 승률: ${Math.round(recentAvg.wins / recentAvg.games * 100)}%` : ''}

아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만 출력하세요:

{
  "summary": "이 게임 전체 플레이에 대한 2~3문장 요약",
  "score": 1~100 사이 점수 (장인 대비 플레이 점수),
  "mvpMoment": "이 게임에서 가장 잘한 순간 1문장 (없으면 null)",
  "goodPoints": [
    "잘한 점 1 (구체적인 수치 포함)",
    "잘한 점 2",
    "잘한 점 3 (있는 경우)"
  ],
  "badPoints": [
    "부족한 점 1 (왜 문제인지 + 장인 수치와 비교)",
    "부족한 점 2",
    "부족한 점 3 (있는 경우)"
  ],
  "tierTips": [
    "티어 향상을 위한 구체적인 조언 1 (오늘 당장 실천 가능한 것)",
    "티어 향상을 위한 구체적인 조언 2",
    "티어 향상을 위한 구체적인 조언 3"
  ],
  "comparisonSummary": "장인과 비교했을 때 한 줄 총평"
}
`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean) as AnalysisResult
  } catch {
    return {
      summary: '분석 중 오류가 발생했습니다.',
      score: 50,
      goodPoints: ['데이터를 불러오는 중 오류가 발생했습니다.'],
      badPoints: [],
      tierTips: ['잠시 후 다시 시도해주세요.'],
      comparisonSummary: '분석 실패',
    }
  }
}
