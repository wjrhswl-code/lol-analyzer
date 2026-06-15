'use client'

import Image from 'next/image'
import { ProcessedMatch } from '@/lib/types'
import { championIconUrl } from '@/lib/riotApi'

interface Props {
  matches: ProcessedMatch[]
}

export default function ChampionStats({ matches }: Props) {
  const map: Record<string, ProcessedMatch[]> = {}
  for (const m of matches) {
    if (!map[m.championName]) map[m.championName] = []
    map[m.championName].push(m)
  }

  const stats = Object.entries(map).map(([name, ms]) => {
    const wins = ms.filter(m => m.win).length
    const wr = Math.round(wins / ms.length * 100)
    const avgKda = (ms.reduce((s, m) => s + m.kda, 0) / ms.length).toFixed(2)
    const avgCs = (ms.reduce((s, m) => s + m.csPerMin, 0) / ms.length).toFixed(1)
    const avgVis = Math.round(ms.reduce((s, m) => s + m.visionScore, 0) / ms.length)
    const avgDmg = Math.round(ms.reduce((s, m) => s + m.damageDealtPerMin, 0) / ms.length)
    return { name, games: ms.length, wins, wr, avgKda, avgCs, avgVis, avgDmg }
  }).sort((a, b) => b.games - a.games)

  if (!stats.length) return <div style={{ textAlign: 'center', padding: 48, color: '#3A4A60', fontSize: 14 }}>전적이 없습니다.</div>

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, letterSpacing: '-.01em' }}>챔피언별 통계</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {stats.map(s => {
          const wrColor = s.wr >= 55 ? '#22c55e' : s.wr >= 45 ? '#DDD5C0' : '#ef4444'
          return (
            <div key={s.name} style={{ background: '#0D1421', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#111B2E', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  <Image src={championIconUrl(s.name)} alt={s.name} width={44} height={44} style={{ objectFit: 'cover' }} onError={(e: any) => { e.target.style.display = 'none'; e.target.parentNode.textContent = '⚔️' }} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#3A4A60', marginTop: 1 }}>{s.games}게임 · {s.wins}승 {s.games - s.wins}패</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, marginLeft: 'auto', color: wrColor }}>{s.wr}%</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {[
                  { label: '평균 KDA', val: s.avgKda },
                  { label: 'CS / 분', val: s.avgCs },
                  { label: '시야', val: s.avgVis },
                ].map(st => (
                  <div key={st.label} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 6, padding: 7, textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#3A4A60', fontWeight: 700, letterSpacing: '.05em', marginBottom: 2 }}>{st.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{st.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
