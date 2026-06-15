import { NextRequest, NextResponse } from 'next/server'
import { getMasterBenchmark } from '@/lib/aiAnalysis'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const champion = searchParams.get('champion')

  if (!champion) {
    return NextResponse.json({ error: '챔피언명을 입력해주세요.' }, { status: 400 })
  }

  const benchmark = getMasterBenchmark(champion)
  return NextResponse.json(benchmark)
}
