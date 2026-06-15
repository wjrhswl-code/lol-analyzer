import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OP분석 — 롤 AI 전적 분석',
  description: '챔피언 장인 1위와 내 플레이를 비교하고, AI가 부족한 점과 개선 방향을 알려드립니다.',
  keywords: ['리그오브레전드', '롤 전적검색', 'AI 분석', '롤 실력향상'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  )
}
