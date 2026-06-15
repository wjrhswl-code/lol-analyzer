'use client'

import { ProcessedMatch, AnalysisResult } from '@/lib/types'
import { getMasterBenchmark } from '@/lib/aiAnalysis'

interface Props {
  match: ProcessedMatch
  result: AnalysisResult
  onClose: () => void
}

function CompareRow({ label, mine, theirs, higherBetter = true }: {
  label: string; mine: number | string; theirs: number | string; higherBetter?: boolean
}) {
  const m = parseFloat(String(mine))
  const t = parseFloat(String(theirs))
  const better = higherBetter ? m >= t : m <= t
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 13 }}>
      <span style={{ color: '#7A90B0' }}>{label}</span>
      <span style={{ fontWeight: 700, color: better ? '#22c55e' : '#f87171' }}>{mine}</span>
    </div>
  )
}

function ProRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: 13 }}>
      <span style={{ color: '#7A90B0' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#DDD5C0' }}>{value}</span>
    </div>
  )
}

export default function AIAnalysisPanel({ match, result, onClose }: Props) {
  const benchmark = getMasterBenchmark(match.championName)
  const score = result.score ?? 50
  const scoreColor = score >= 75 ? '#22c55e' : score >= 50 ? '#C89B3C' : '#ef4444'
  const circumference = 2 * Math.PI * 38
  const dash = (score / 100) * circumference

  return (
    <div style={{
      background: '#0D1421',
      border: '1px solid rgba(200,155,60,0.3)',
      borderRadius: 16,
      padding: 24,
      marginBottom: 20,
      animation: 'fadeUp .35s ease-out',
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,.07)', marginBottom: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C89B3C', boxShadow: '0 0 8px #C89B3C', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>
            AI 분석 — {match.championName} · {match.kills}/{match.deaths}/{match.assists}
          </div>
          <div style={{ fontSize: 12, color: '#7A90B0', marginTop: 1 }}>
            {match.championName} 챌린저 장인과 비교 분석 · {benchmark.tier}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: '#7A90B0', cursor: 'pointer', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'background .2s' }}
          onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
          onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
        >✕</button>
      </div>

      {/* Score + Summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <circle
              cx="45" cy="45" r="38" fill="none"
              stroke={scoreColor} strokeWidth="6"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={circumference / 4}
              strokeLinecap="round"
              transform="rotate(-90 45 45)"
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: scoreColor }}>{score}</span>
            <span style={{ fontSize: 10, color: '#3A4A60', fontWeight: 700, letterSpacing: '.05em' }}>점</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, color: '#7A90B0', lineHeight: 1.7 }}>{result.summary}</p>
          {result.mvpMoment && (
            <div style={{ marginTop: 8, background: 'rgba(200,155,60,.1)', border: '1px solid rgba(200,155,60,.2)', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: '#C89B3C' }}>
              ⭐ {result.mvpMoment}
            </div>
          )}
          <div style={{ fontSize: 12, color: '#3A4A60', marginTop: 8, fontStyle: 'italic' }}>{result.comparisonSummary}</div>
        </div>
      </div>

      {/* Compare Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#111B2E', borderRadius: 10, padding: 14 }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, color: '#3A4A60', letterSpacing: '.06em', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,.05)' }}>내 스탯</h4>
          <CompareRow label="KDA" mine={match.kda.toFixed(2)} theirs={benchmark.avgKda} />
          <CompareRow label="CS / 분" mine={match.csPerMin} theirs={benchmark.avgCsPerMin} />
          <CompareRow label="시야 점수" mine={match.visionScore} theirs={benchmark.avgVision} />
          <CompareRow label="분당 딜량" mine={match.damageDealtPerMin} theirs={benchmark.avgDamagePerMin} />
          <CompareRow label="킬 관여율" mine={`${match.killParticipation}%`} theirs={`${benchmark.avgKillParticipation}%`} />
          <CompareRow label="제어 와드" mine={match.controlWards} theirs={benchmark.avgControlWards} />
          <CompareRow label="데스" mine={match.deaths} theirs={benchmark.avgDeaths} higherBetter={false} />
        </div>
        <div style={{ background: '#111B2E', borderRadius: 10, padding: 14 }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, color: '#3A4A60', letterSpacing: '.06em', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,.05)' }}>챌린저 장인 평균</h4>
          <ProRow label="KDA" value={benchmark.avgKda} />
          <ProRow label="CS / 분" value={benchmark.avgCsPerMin} />
          <ProRow label="시야 점수" value={benchmark.avgVision} />
          <ProRow label="분당 딜량" value={benchmark.avgDamagePerMin} />
          <ProRow label="킬 관여율" value={`${benchmark.avgKillParticipation}%`} />
          <ProRow label="제어 와드" value={benchmark.avgControlWards} />
          <ProRow label="평균 데스" value={benchmark.avgDeaths} />
        </div>
      </div>

      {/* Good Points */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#22c55e', marginBottom: 8 }}>✅ 잘한 점</div>
        {result.goodPoints?.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.6, marginBottom: 6, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', color: '#86efac' }}>
            <div style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: 'rgba(34,197,94,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, marginTop: 1 }}>✓</div>
            <span>{t}</span>
          </div>
        ))}
      </div>

      {/* Bad Points */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#ef4444', marginBottom: 8 }}>⚠️ 부족한 점</div>
        {result.badPoints?.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.6, marginBottom: 6, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#fca5a5' }}>
            <div style={{ flexShrink: 0, width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, marginTop: 1 }}>!</div>
            <span>{t}</span>
          </div>
        ))}
      </div>

      {/* Tier Tips */}
      <div style={{ background: 'rgba(200,155,60,.06)', border: '1px solid rgba(200,155,60,.2)', borderRadius: 10, padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#C89B3C', marginBottom: 10, letterSpacing: '.04em' }}>🚀 티어 향상 조언</div>
        {result.tierTips?.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#7A90B0', lineHeight: 1.6, padding: '5px 0', borderBottom: i < (result.tierTips?.length ?? 0) - 1 ? '1px solid rgba(200,155,60,.1)' : 'none' }}>
            <span style={{ color: '#C89B3C', fontWeight: 900, flexShrink: 0, marginTop: 1 }}>→</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
