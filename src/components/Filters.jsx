import { Search, RotateCcw, X } from 'lucide-react'
import { ALL_POSITIONS, DEFAULT_FILTERS } from '../utils'
import { flag } from '../flags'

function RangeRow({ label, minKey, maxKey, min, max, absMin, absMax, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{min} – {max}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, minWidth: 0 }}>
        <input type="range" min={absMin} max={absMax} value={min}
          onChange={e => onChange(minKey, Math.min(parseInt(e.target.value), max))}
          style={{ flex: 1, minWidth: 0, width: 0, accentColor: '#6c63ff' }} />
        <input type="range" min={absMin} max={absMax} value={max}
          onChange={e => onChange(maxKey, Math.max(parseInt(e.target.value), min))}
          style={{ flex: 1, minWidth: 0, width: 0, accentColor: '#6c63ff' }} />
      </div>
    </div>
  )
}

function FilterBody({ filters, onChange, onReset, leagues, nationalities, resultCount, onClose }) {
  function set(key, val) { onChange({ ...filters, [key]: val }) }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 500, fontSize: 13 }}>Filters</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{resultCount.toLocaleString()} players</span>
          <button onClick={onReset} title="Reset filters" style={{ color: 'var(--text-dim)', padding: 4, borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <RotateCcw size={12} />
          </button>
          {onClose && (
            <button onClick={onClose} style={{ color: 'var(--text-dim)', padding: 4, borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
        <input value={filters.search} onChange={e => set('search', e.target.value)}
          placeholder="Name, club, nation…"
          style={{ width: '100%', paddingLeft: 28, fontSize: 12 }} />
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Position</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {ALL_POSITIONS.map(pos => (
            <button key={pos} onClick={() => set('position', filters.position === pos ? '' : pos)}
              style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                background: filters.position === pos ? 'var(--accent)' : 'var(--surface2)',
                color: filters.position === pos ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${filters.position === pos ? 'var(--accent)' : 'var(--border)'}`,
              }}>
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

      <RangeRow label="Age" minKey="minAge" maxKey="maxAge" min={filters.minAge} max={filters.maxAge} absMin={16} absMax={45} onChange={set} />
      <RangeRow label="Overall" minKey="minOvr" maxKey="maxOvr" min={filters.minOvr} max={filters.maxOvr} absMin={40} absMax={99} onChange={set} />
      <RangeRow label="Potential" minKey="minPot" maxKey="maxPot" min={filters.minPot} max={filters.maxPot} absMin={40} absMax={99} onChange={set} />

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min gap</span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>+{filters.minGap}</span>
        </div>
        <input type="range" min={0} max={25} value={filters.minGap}
          onChange={e => set('minGap', parseInt(e.target.value))}
          style={{ width: '100%', display: 'block', accentColor: '#6c63ff' }} />
      </div>

      <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>League</div>
        <select value={filters.league} onChange={e => set('league', e.target.value)} style={{ width: '100%', fontSize: 12 }}>
          <option value="">All leagues</option>
          {leagues.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Nationality</div>
        <select value={filters.nationality} onChange={e => set('nationality', e.target.value)} style={{ width: '100%', fontSize: 12 }}>
          <option value="">All nations</option>
          {nationalities.map(n => <option key={n} value={n}>{flag(n)} {n}</option>)}
        </select>
      </div>

      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Preferred foot</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['', 'Right', 'Left'].map(f => (
            <button key={f} onClick={() => set('foot', f)}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 7, fontSize: 11,
                background: filters.foot === f ? 'var(--accent)' : 'var(--surface2)',
                color: filters.foot === f ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${filters.foot === f ? 'var(--accent)' : 'var(--border)'}`,
              }}>
              {f || 'Any'}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default function Filters({ filters, onChange, onReset, leagues, nationalities, resultCount, mobile, open, onClose }) {
  if (mobile) {
    if (!open) return null
    return (
      <>
        <div onClick={onClose} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
        }} />
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '85vw', maxWidth: 320,
          background: 'var(--bg)', zIndex: 201, overflowY: 'auto',
          padding: 20, boxSizing: 'border-box',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        }}>
          <FilterBody filters={filters} onChange={onChange} onReset={onReset}
            leagues={leagues} nationalities={nationalities} resultCount={resultCount}
            onClose={onClose} />
        </div>
      </>
    )
  }

  return (
    <div style={{
      width: 240, flexShrink: 0, minWidth: 0, overflow: 'hidden',
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 16, alignSelf: 'flex-start',
      position: 'sticky', top: 24, boxSizing: 'border-box'
    }}>
      <FilterBody filters={filters} onChange={onChange} onReset={onReset}
        leagues={leagues} nationalities={nationalities} resultCount={resultCount} />
    </div>
  )
}
