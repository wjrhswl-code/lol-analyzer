'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import SummonerProfile from '@/components/SummonerProfile'
import MatchCard from '@/components/MatchCard'
import AIAnalysisPanel from '@/components/AIAnalysisPanel'
import ChampionStats from '@/components/ChampionStats'
import { Region, ProcessedMatch, AnalysisResult } from '@/lib/types'

interface SummonerData {
  summoner: any
  soloRank: any
  flexRank: any
  matches: ProcessedMatch[]
  overallStats: any
  champStats: any[]
  masteryData: any[]
}

export default function HomePage() {
  const [view, setView] = useState<'landing' | 'main'>('landing')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<SummonerData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'matches' | 'champions'>('matches')
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [activeAnalysis, setActiveAnalysis] = useState<{ matchId: string; result: AnalysisResult } | null>(null)
  const [landingInput, setLandingInput] = useState('')

  async function search(gameName: string, tagLine: string, region: Region) {
    setLoading(true)
    setError(null)
    setActiveAnalysis(null)
    setView('main')
    try {
      const res = await fetch(
        `/api/summoner?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '데이터를 불러오지 못했습니다.')
      setData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeMatch(match: ProcessedMatch) {
    if (activeAnalysis?.matchId === match.matchId) {
      setActiveAnalysis(null)
      return
    }
    setAnalyzingId(match.matchId)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match, recentMatches: data?.matches || [] }),
      })
      const result: AnalysisResult = await res.json()
      if (!res.ok) throw new Error((result as any).error || 'AI 분석 실패')
      setActiveAnalysis({ matchId: match.matchId, result })
      setTimeout(() => {
        document.getElementById('ai-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAnalyzingId(null)
    }
  }

  function doLandingSearch() {
    const [gn, tl = 'KR1'] = landingInput.trim().split('#').map(s => s.trim())
    if (!gn) return
    search(gn, tl, 'kr')
  }

  // ── Landing ───────────────────────────────────────────────────────────────
  if (view === 'landing') {
    return (
      <div>
        <Navbar onSearch={search} loading={loading} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px 60px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(200,155,60,0.1)', border: '1px solid rgba(200,155,60,0.3)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: '#C89B3C', marginBottom: 24, letterSpacing: '.05em' }}>
            ✦ AI 전적 분석 서비스
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: 1.1, marginBottom: 16 }}>
            내 롤 플레이를<br />
            <span style={{ background: 'linear-gradient(135deg,#C89B3C,#F0E6C8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>장인과 비교</span>하다
          </h1>
          <p style={{ fontSize: 16, color: '#7A90B0', lineHeight: 1.7, maxWidth: 460, marginBottom: 40 }}>
            챔피언 장인 1위의 플레이와 내 전적을 AI가 분석해,<br />
            부족한 점과 티어 향상 방법을 구체적으로 알려드립니다.
          </p>
          <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 500, marginBottom: 60 }}>
            <input
              type="text"
              value={landingInput}
              onChange={e => setLandingInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLandingSearch()}
              placeholder="소환사명 #KR1"
              style={{ flex: 1, height: 50, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, color: '#DDD5C0', fontSize: 15, padding: '0 16px', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={doLandingSearch}
              style={{ height: 50, padding: '0 24px', background: 'linear-gradient(135deg,#C89B3C,#785A28)', color: '#080C16', fontWeight: 900, border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}
            >
              분석 시작 →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 680, width: '100%' }}>
            {[
              { icon: '⚔️', title: '장인 1위 비교', desc: '해당 챔피언 챌린저 장인의 KDA, CS, 시야 등 핵심 수치와 내 게임을 정밀 비교' },
              { icon: '🤖', title: 'Claude AI 분석', desc: 'Anthropic의 Claude AI가 플레이 패턴을 분석해 잘한 점과 개선점을 콕 집어 설명' },
              { icon: '🚀', title: '티어 향상 조언', desc: '오늘 당장 실천 가능한 3가지 구체적인 플레이 개선 방향 제시' },
            ].map(f => (
              <div key={f.title} style={{ background: '#0D1421', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: 20, textAlign: 'left' }}>
                <div style={{ fontSize: 26, marginBottom: 10 }}>{f.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: '#7A90B0', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <Navbar onSearch={search} loading={loading} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#fca5a5', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div>
            {[80, 200, 200, 200].map((h, i) => (
              <div key={i} style={{ height: h, background: 'linear-gradient(90deg,#0D1421 25%,#141E30 50%,#0D1421 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: 12, marginBottom: 12 }} />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        )}

        {data && !loading && (
          <>
            <SummonerProfile
              summoner={data.summoner}
              soloRank={data.soloRank}
              flexRank={data.flexRank}
              overallStats={data.overallStats}
            />

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.07)', marginBottom: 20, gap: 4 }}>
              {(['matches', 'champions'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 18px', fontSize: 14, fontWeight: 600,
                    color: activeTab === tab ? '#C89B3C' : '#7A90B0',
                    background: 'transparent', border: 'none',
                    borderBottom: `2px solid ${activeTab === tab ? '#C89B3C' : 'transparent'}`,
                    cursor: 'pointer', marginBottom: -1, transition: 'color .2s', fontFamily: 'inherit',
                  }}
                >
                  {tab === 'matches' ? '전적' : '챔피언별 통계'}
                </button>
              ))}
            </div>

            {activeTab === 'matches' && (
              <div>
                {/* AI Panel */}
                {activeAnalysis && (
                  <div id="ai-panel">
                    <AIAnalysisPanel
                      match={data.matches.find(m => m.matchId === activeAnalysis.matchId)!}
                      result={activeAnalysis.result}
                      onClose={() => setActiveAnalysis(null)}
                    />
                  </div>
                )}

                {/* Match list */}
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>최근 전적</div>
                {data.matches.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 48, color: '#3A4A60' }}>전적이 없습니다.</div>
                ) : (
                  data.matches.map(m => (
                    <MatchCard
                      key={m.matchId}
                      match={m}
                      onAnalyze={analyzeMatch}
                      analyzing={analyzingId === m.matchId}
                      isActive={activeAnalysis?.matchId === m.matchId}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'champions' && <ChampionStats matches={data.matches} />}
          </>
        )}
      </div>
    </div>
  )
}
