'use client'

import Image from 'next/image'
import { ProcessedMatch } from '@/lib/types'
import { championIconUrl, timeAgo, formatDuration } from '@/lib/riotApi'

interface Props {
  match: ProcessedMatch
  onAnalyze: (match: ProcessedMatch) => void
  analyzing: boolean
  isActive: boolean
}

export default function MatchCard({ match, onAnalyze, analyzing, isActive }: Props) {
  const kdaColor =
    match.kda >= 4 ? '#22c55e' :
    match.kda >= 2 ? '#DDD5C0' : '#ef4444'

  const multi = match.pentaKills > 0 ? '🏆 펜타킬' :
    match.quadraKills > 0 ? '🌟 쿼드라킬' :
    match.tripleKills > 0 ? '⚡ 트리플킬' :
    match.doubleKills > 0 ? '✌️ 더블킬' : null

  return (
    <div
      style={{
        background: isActive ? '#141E30' : '#0D1421',
        border: `1px solid ${isActive ? 'rgba(200,155,60,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderLeft: `3px solid ${match.win ? '#22c55e' : '#ef4444'}`,
        borderRadius: 12,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'background .2s, border-color .2s',
        marginBottom: 8,
      }}
    >
      {/* Champion icon */}
      <div style={{
        width: 46, height: 46, borderRadius: '50%',
        overflow: 'hidden', background: '#111B2E',
        flexShrink: 0, border: '2px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>
        <Image
          src={championIconUrl(match.championName)}
          alt={match.championName}
          width={46} height={46}
          style={{ objectFit: 'cover' }}
          onError={(e: any) => { e.target.style.display = 'none'; e.target.parentNode.textContent = '⚔️' }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{match.championName}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
            background: match.win ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)',
            color: match.win ? '#4ade80' : '#f87171',
            border: `1px solid ${match.win ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.25)'}`,
          }}>{match.win ? '승리' : '패배'}</span>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
            background: 'rgba(200,155,60,.12)', color: '#C89B3C',
            border: '1px solid rgba(200,155,60,.25)',
          }}>{match.queueName}</span>
          {multi && <span style={{ fontSize: 11, color: '#C89B3C' }}>{multi}</span>}
        </div>
        <div style={{ fontSize: 12, color: '#7A90B0' }}>
          {match.kills}/{match.deaths}/{match.assists} · KDA{' '}
          <strong style={{ color: kdaColor }}>{match.kda.toFixed(2)}</strong>
          {' · '}CS {match.cs} ({match.csPerMin}/분)
          {' · '}킬관여 {match.killParticipation}%
          {' · '}시야 {match.visionScore}
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => onAnalyze(match)}
          disabled={analyzing}
          style={{
            background: isActive
              ? 'rgba(200,155,60,0.2)'
              : 'linear-gradient(135deg,#C89B3C,#A07830)',
            color: isActive ? '#C89B3C' : '#080C16',
            border: isActive ? '1px solid rgba(200,155,60,0.4)' : 'none',
            borderRadius: 7,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 800,
            cursor: analyzing ? 'not-allowed' : 'pointer',
            opacity: analyzing ? 0.5 : 1,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all .2s',
          }}
        >
          {analyzing ? <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(10,14,26,0.3)', borderTopColor: '#080C16', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> : '🤖'}
          {isActive ? '닫기' : 'AI 분석'}
        </button>
        <div style={{ textAlign: 'right', minWidth: 64 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: match.win ? '#22c55e' : '#ef4444' }}>
            {match.win ? '승리' : '패배'}
          </div>
          <div style={{ fontSize: 11, color: '#3A4A60', marginTop: 2 }}>
            {formatDuration(match.gameDuration)}
          </div>
          <div style={{ fontSize: 11, color: '#3A4A60' }}>
            {timeAgo(match.gameCreation)}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
