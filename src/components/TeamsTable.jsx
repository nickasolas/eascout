import { useState, useMemo } from 'react'
import { fmtValue } from '../utils'
import { ChevronUp, ChevronDown } from 'lucide-react'
import TeamLogo from './TeamLogo'

const COLS = [
  { key: 'name',        label: 'Club',        w: 200 },
  { key: 'league',      label: 'League',      w: 160 },
  { key: 'squadSize',   label: 'Squad',       w: 60  },
  { key: 'avgOvr',      label: 'Avg OVR',     w: 80  },
  { key: 'top11Avg',    label: 'Top 11',      w: 72  },
  { key: 'avgPot',      label: 'Avg POT',     w: 80  },
  { key: 'avgAge',      label: 'Avg Age',     w: 72  },
  { key: 'totalValue',  label: 'Squad Value', w: 100 },
  { key: 'totalWage',   label: 'Wage/wk',     w: 90  },
]

const PAGE_SIZE = 100

function ovrColor(v) {
  if (v >= 80) return '#22c55e'
  if (v >= 75) return '#6c63ff'
  if (v >= 70) return '#f59e0b'
  return 'var(--text-muted)'
}

export default function TeamsTable({ teams, onSelect }) {
  const [sortCol, setSortCol] = useState('avgOvr')
  const [sortDir, setSortDir] = useState(-1)
  const [page, setPage] = useState(0)

  function handleSort(key) {
    if (sortCol === key) setSortDir(d => d * -1)
    else { setSortCol(key); setSortDir(-1) }
    setPage(0)
  }

  const sorted = useMemo(() => {
    return [...teams].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol]
      if (typeof av === 'string') return sortDir * av.localeCompare(bv)
      return sortDir * ((av ?? 0) - (bv ?? 0))
    })
  }, [teams, sortCol, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const visible = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 900 }}>
          <colgroup>
            {COLS.map(c => <col key={c.key} style={{ width: c.w }} />)}
          </colgroup>
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              {COLS.map(c => (
                <th key={c.key} style={{ padding: 0 }} onClick={() => handleSort(c.key)}>
                  <span style={{
                    padding: '0 10px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
                    letterSpacing: '0.04em', whiteSpace: 'nowrap', userSelect: 'none', cursor: 'pointer',
                    height: 36, display: 'inline-flex', alignItems: 'center', gap: 3,
                  }}>
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
              <tr><td colSpan={COLS.length} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)' }}>No clubs match</td></tr>
            )}
            {visible.map((t, i) => (
              <tr key={t.id || t.name}
                onClick={() => onSelect(t)}
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: i % 2 !== 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
              >
                <td style={{ padding: '9px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <TeamLogo name={t.name} teamId={t.id} size={24} />
                    <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                  </div>
                </td>
                <td style={{ padding: '9px 10px', fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.league}</td>
                <td style={{ padding: '9px 10px', fontSize: 13 }}>{t.squadSize}</td>
                <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 600, color: ovrColor(t.avgOvr) }}>{t.avgOvr}</td>
                <td style={{ padding: '9px 10px', fontSize: 13, fontWeight: 600, color: ovrColor(t.top11Avg) }}>{t.top11Avg}</td>
                <td style={{ padding: '9px 10px', fontSize: 13, color: '#22c55e' }}>{t.avgPot}</td>
                <td style={{ padding: '9px 10px', fontSize: 13, color: 'var(--text-muted)' }}>{t.avgAge}</td>
                <td style={{ padding: '9px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{fmtValue(t.totalValue)}</td>
                <td style={{ padding: '9px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{fmtValue(t.totalWage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-dim)' }}>
        <span>{sorted.length.toLocaleString()} clubs</span>
        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', color: page === 0 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: page === 0 ? 'default' : 'pointer' }}>‹ Prev</button>
            <span style={{ padding: '0 8px' }}>Page {page + 1} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', color: page === totalPages - 1 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: page === totalPages - 1 ? 'default' : 'pointer' }}>Next ›</button>
          </div>
        )}
        <span>Click a row to view squad</span>
      </div>
    </div>
  )
}
