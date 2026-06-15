import { NextRequest, NextResponse } from 'next/server'
import { analyzeMatch } from '@/lib/aiAnalysis'
import { ProcessedMatch } from '@/lib/types'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const { match, recentMatches } = body as {
      match: ProcessedMatch
      recentMatches: ProcessedMatch[]
    }

    if (!match) {
      return NextResponse.json({ error: '매치 데이터가 없습니다.' }, { status: 400 })
    }

    const result = await analyzeMatch(match, recentMatches || [])
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[analyze API error]', err.message)
    return NextResponse.json(
      { error: 'AI 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
