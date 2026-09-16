import { useState, useMemo } from 'react'
import { fmtValue, gapColor, sortPlayers } from '../utils'
import { flag, abbr } from '../flags'
import TeamLogo from './TeamLogo'
import { ChevronUp, ChevronDown, Star } from 'lucide-react'

const PAGE_SIZE = 100

const COLS = [
  { key: 'name',        label: 'Player',   w: 150 },
  { key: 'primaryPos',  label: 'Pos',      w: 46  },
  { key: 'age',         label: 'Age',      w: 44  },
  { key: 'nationality', label: 'Nation',   w: 110 },
  { key: 'club',        label: 'Club',     w: 140 },
  { key: 'overall',     label: 'OVR',      w: 50  },
  { key: 'potential',   label: 'POT',      w: 50  },
  { key: 'gap',         label: 'Gap',      w: 56  },
  { key: 'pace',        label: 'PAC',      w: 44  },
  { key: 'shooting',    label: 'SHO',      w: 44  },
  { key: 'passing',     label: 'PAS',      w: 44  },
  { key: 'dribbling',   label: 'DRI',      w: 44  },
  { key: 'defending',   label: 'DEF',      w: 44  },
  { key: 'physic',      label: 'PHY',      w: 44  },
  { key: 'value',       label: 'Value',    w: 78  },
]

const thBase = {
  padding: '0 10px', textAlign: 'left', fontSize: 11,
  color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em',
  whiteSpace: 'nowrap', userSelect: 'none', cursor: 'pointer',
  height: 36, display: 'inline-flex', alignItems: 'center', gap: 3,
}

function statColor(val) {
  if (val >= 80) return '#22c55e'
  if (val >= 70) return '#6c63ff'
  if (val >= 60) return '#f59e0b'
  return 'var(--text-muted)'
}

export default function PlayerTable({ players, onSelect, compareList, onToggleCompare }) {
  const [sortCol, setSortCol] = useState('overall')
  const [sortDir, setSortDir] = useState(-1)
  const [page, setPage] = useState(0)

  function handleSort(key) {
    if (sortCol === key) setSortDir(d => d * -1)
    else { setSortCol(key); setSortDir(-1) }
    setPage(0)
  }

  const sorted = useMemo(() => sortPlayers(players, sortCol, sortDir), [players, sortCol, sortDir])
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const visible = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', flex: 1 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 900 }}>
          <colgroup>
            <col style={{ width: 36 }} />
            {COLS.map(c => <col key={c.key} style={{ width: c.w }} />)}
          </colgroup>
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ width: 36 }} />
              {COLS.map(c => (
                <th key={c.key} style={{ padding: 0 }} onClick={() => handleSort(c.key)}>
                  <span style={thBase}>
                    {c.label}
                    {sortCol === c.key
                      ? (sortDir === -1 ? <ChevronDown size={11} /> : <ChevronUp size={11} />)
                      : <ChevronDown size={11} style={{ opacity: 0.2 }} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={COLS.length + 1} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>No players match these filters</td></tr>
            )}
            {visible.map((p, i) => {
              const inCompare = compareList.some(c => c.id === p.id)
              return (
                <tr key={p.id}
                  onClick={() => onSelect(p)}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: i % 2 !== 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
                >
                  <td style={{ textAlign: 'center', padding: '0 4px' }} onClick={e => { e.stopPropagation(); onToggleCompare(p) }}>
                    <Star size={12} style={{ color: inCompare ? '#6c63ff' : 'var(--text-dim)', fill: inCompare ? '#6c63ff' : 'none', verticalAlign: 'middle' }} />
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>{p.name}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{p.primaryPos}</td>
                  <td style={{ padding: '8px 10px', fontSize: 13 }}>{p.age}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }} title={p.nationality}>
                    <span style={{ marginRight: 5 }}>{flag(p.nationality)}</span>{abbr(p.nationality)}
                  </td>
                  <td style={{ padding: '8px 10px' }} title={p.club}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      <TeamLogo name={p.club} teamId={p.clubId} size={18} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.club}</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontWeight: 600 }}>{p.overall}</td>
                  <td style={{ padding: '8px 10px', fontSize: 13, fontWeight: 600, color: p.potential >= 80 ? '#22c55e' : p.potential >= 70 ? '#f59e0b' : '#7b82a0' }}>{p.potential}</td>
                  <td style={{ padding: '8px 10px', fontSize: 12 }}>
                    <span style={{ background: `${gapColor(p.gap)}22`, color: gapColor(p.gap), padding: '1px 6px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                      +{p.gap}
                    </span>
                  </td>
                  {['pace','shooting','passing','dribbling','defending','physic'].map(k => (
                    <td key={k} style={{ padding: '8px 10px', fontSize: 12, color: statColor(p[k]) }}>{p[k]}</td>
                  ))}
                  <td style={{ padding: '8px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{fmtValue(p.value)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
        <span>{sorted.length.toLocaleString()} players · showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)}</span>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', color: page === 0 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: page === 0 ? 'default' : 'pointer' }}>
              ‹ Prev
            </button>
            <span style={{ padding: '0 8px' }}>Page {page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', color: page === totalPages - 1 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: page === totalPages - 1 ? 'default' : 'pointer' }}>
              Next ›
            </button>
          </div>
        )}
        <span>Click row to view · ☆ to compare</span>
      </div>
    </div>
  )
}
