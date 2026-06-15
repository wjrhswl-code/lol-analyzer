'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Region } from '@/lib/types'

const REGIONS = [
  { value: 'kr', label: 'KR' },
  { value: 'na1', label: 'NA' },
  { value: 'euw1', label: 'EUW' },
  { value: 'eune1', label: 'EUNE' },
  { value: 'jp1', label: 'JP' },
  { value: 'br1', label: 'BR' },
]

interface NavbarProps {
  onSearch: (gameName: string, tagLine: string, region: Region) => void
  loading?: boolean
}

export default function Navbar({ onSearch, loading }: NavbarProps) {
  const [input, setInput] = useState('')
  const [region, setRegion] = useState<Region>('kr')

  function handleSearch() {
    const parts = input.trim().split('#')
    const gameName = parts[0]?.trim()
    const tagLine = parts[1]?.trim() || 'KR1'
    if (!gameName) return
    onSearch(gameName, tagLine, region)
  }

  return (
    <nav
      style={{
        background: 'rgba(10, 14, 26, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(200, 155, 60, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #C89B3C, #785A28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: '#0A0E1A',
          }}>OP</div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }} className="text-gold hide-mobile">
            OP분석
          </span>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 560 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: 16, height: 16 }} />
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="소환사명 #KR1"
              style={{ width: '100%', height: 40, paddingLeft: 38, paddingRight: 12, fontSize: 14 }}
            />
          </div>
          <select
            value={region}
            onChange={e => setRegion(e.target.value as Region)}
            style={{ height: 40, padding: '0 8px', fontSize: 13, width: 72, cursor: 'pointer' }}
          >
            {REGIONS.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="btn-gold"
            style={{ height: 40, padding: '0 18px', fontSize: 14, minWidth: 64, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {loading ? (
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(10,14,26,0.4)', borderTopColor: '#0A0E1A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : <Search style={{ width: 14, height: 14 }} />}
            검색
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </nav>
  )
}
