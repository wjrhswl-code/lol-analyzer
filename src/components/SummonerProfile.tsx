'use client'

import Image from 'next/image'
import { Shield, Flame, Trophy } from 'lucide-react'
import { SummonerProfile as SummonerType, RankedInfo, TIER_COLORS } from '@/lib/types'
import { profileIconUrl } from '@/lib/riotApi'

interface Props {
  summoner: SummonerType
  soloRank?: RankedInfo
  flexRank?: RankedInfo
  overallStats?: {
    avgKda: number
    avgCsPerMin: number
    avgVision: number
    winRate: number
    games: number
  } | null
}

function RankBadge({ rank }: { rank: RankedInfo }) {
  const color = TIER_COLORS[rank.tier] || '#888'
  const total = rank.wins + rank.losses
  const wr = Math.round((rank.wins / total) * 100)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}30`,
      borderRadius: 10,
      padding: '12px 16px',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
        {rank.queueType === 'RANKED_SOLO_5x5' ? '솔로 랭크' : '자유 랭크'}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color }}>{rank.tier}</span>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{rank.rank}</span>
      </div>
      <div style={{ fontSize: 13, color, marginTop: 2 }}>{rank.leaguePoints} LP</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
        {rank.wins}승 {rank.losses}패 &middot; 승률 <span style={{ color: wr >= 50 ? '#4ade80' : '#fc8181' }}>{wr}%</span>
      </div>
      {rank.hotStreak && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: '#FB923C' }}>
          <Flame style={{ width: 11, height: 11 }} /> 연승 중
        </div>
      )}
    </div>
  )
}

export default function SummonerProfile({ summoner, soloRank, flexRank, overallStats }: Props) {
  const iconUrl = profileIconUrl(summoner.profileIconId)

  return (
    <div className="card animate-in" style={{ padding: '24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
        {/* 아이콘 */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 12,
            border: '2px solid var(--gold)',
            overflow: 'hidden',
            background: 'var(--bg-surface)',
          }}>
            <Image
              src={iconUrl}
              alt="프로필 아이콘"
              width={80}
              height={80}
              style={{ objectFit: 'cover' }}
              onError={(e: any) => { e.target.style.display = 'none' }}
            />
          </div>
          <div style={{
            position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-primary)', border: '1px solid var(--gold)',
            borderRadius: 6, padding: '1px 6px', fontSize: 11, color: 'var(--gold)',
            fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            Lv.{summoner.summonerLevel}
          </div>
        </div>

        {/* 이름 & 랭크 */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            <span className="text-gold">{summoner.name}</span>
            <span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>
              #{summoner.tagLine}
            </span>
          </h1>

          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            {soloRank && <RankBadge rank={soloRank} />}
            {flexRank && <RankBadge rank={flexRank} />}
            {!soloRank && !flexRank && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', paddingTop: 8 }}>
                <Shield style={{ width: 14, height: 14, display: 'inline', marginRight: 4 }} />
                배치 미완료
              </div>
            )}
          </div>
        </div>

        {/* 최근 통계 */}
        {overallStats && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10,
            marginLeft: 'auto',
          }}>
            {[
              { label: '평균 KDA', value: overallStats.avgKda.toFixed(2) },
              { label: 'CS / 분', value: overallStats.avgCsPerMin.toFixed(1) },
              { label: '시야 점수', value: overallStats.avgVision },
              { label: `최근 ${overallStats.games}게임 승률`, value: `${overallStats.winRate}%` },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8, padding: '10px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{stat.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
