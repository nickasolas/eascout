import { useState, useMemo } from 'react'
import { fmtValue, gapColor, sortPlayers } from '../utils'
import { flag, abbr } from '../flags'
import TeamLogo from './TeamLogo'
import PlayerPhoto from './PlayerPhoto'
import { ChevronDown, Star } from 'lucide-react'

const PAGE_SIZE = 50

const SORT_OPTIONS = [
  { key: 'overall', label: 'OVR' },
  { key: 'potential', label: 'POT' },
  { key: 'gap', label: 'Gap' },
  { key: 'age', label: 'Age' },
  { key: 'value', label: 'Value' },
]

export default function PlayerCardList({ players, onSelect, compareList, onToggleCompare }) {
  const [sortCol, setSortCol] = useState('overall')
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => sortPlayers(players, sortCol, -1), [players, sortCol])
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const visible = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', alignSelf: 'center', marginRight: 2 }}>Sort:</span>
        {SORT_OPTIONS.map(o => (
          <button key={o.key} onClick={() => { setSortCol(o.key); setPage(0) }} style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            background: sortCol === o.key ? 'var(--accent)' : 'var(--surface)',
            color: sortCol === o.key ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${sortCol === o.key ? 'var(--accent)' : 'var(--border)'}`,
          }}>{o.label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)', alignSelf: 'center' }}>
          {players.length.toLocaleString()} players
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            No players match these filters
          </div>
        )}
        {visible.map(p => {
          const inCompare = compareList.some(c => c.id === p.id)
          const gc = gapColor(p.gap)
          return (
            <div key={p.id} onClick={() => onSelect(p)} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <PlayerPhoto id={p.id} name={p.name} size={40} radius={10} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{p.overall}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#22c55e' }}>{p.potential}</span>
                      <span style={{ fontSize: 11, background: `${gc}22`, color: gc, padding: '1px 6px', borderRadius: 20, fontWeight: 600 }}>+{p.gap}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, background: 'var(--surface2)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: 4, fontWeight: 500 }}>{p.primaryPos}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{flag(p.nationality)} {abbr(p.nationality)}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <TeamLogo name={p.club} teamId={p.clubId} size={13} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{p.club}</span>
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>{fmtValue(p.value)}</span>
                    <button onClick={e => { e.stopPropagation(); onToggleCompare(p) }} style={{
                      padding: '2px 4px', borderRadius: 4, background: 'none', border: 'none',
                    }}>
                      <Star size={13} style={{ color: inCompare ? '#6c63ff' : 'var(--text-dim)', fill: inCompare ? '#6c63ff' : 'none' }} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-dim)' }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: page === 0 ? 'var(--text-dim)' : 'var(--text-muted)' }}>
            ‹ Prev
          </button>
          <span>Page {page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', color: page === totalPages - 1 ? 'var(--text-dim)' : 'var(--text-muted)' }}>
            Next ›
          </button>
        </div>
      )}
    </div>
  )
}
