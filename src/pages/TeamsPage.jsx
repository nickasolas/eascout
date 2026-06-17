import { useState, useMemo } from 'react'
import teams from '../teams.json'
import TeamsTable from '../components/TeamsTable'
import SquadModal from '../components/SquadModal'
import TeamLogo from '../components/TeamLogo'
import { fmtValue } from '../utils'
import { Search, RotateCcw } from 'lucide-react'

const ALL_LEAGUES = [...new Set(teams.map(t => t.league).filter(Boolean))].sort()

export default function TeamsPage() {
  const [search, setSearch] = useState('')
  const [league, setLeague] = useState('')
  const [view, setView] = useState('table')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return teams.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) && !t.league.toLowerCase().includes(q)) return false
      if (league && t.league !== league) return false
      return true
    })
  }, [search, league])

  const leagueGroups = useMemo(() => {
    const groups = {}
    filtered.forEach(t => {
      if (!groups[t.league]) groups[t.league] = []
      groups[t.league].push(t)
    })
    return Object.entries(groups)
      .map(([name, clubList]) => ({
        name,
        clubs: clubList.sort((a, b) => b.avgOvr - a.avgOvr),
        avgOvr: Math.round(clubList.reduce((s, c) => s + c.avgOvr, 0) / clubList.length * 10) / 10,
        totalValue: clubList.reduce((s, c) => s + c.totalValue, 0),
      }))
      .sort((a, b) => b.avgOvr - a.avgOvr)
  }, [filtered])

  const totalValue = filtered.reduce((s, t) => s + t.totalValue, 0)
  const avgOvr = filtered.length ? Math.round(filtered.reduce((s, t) => s + t.avgOvr, 0) / filtered.length * 10) / 10 : 0

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search club or league…" style={{ width: '100%', paddingLeft: 28 }} />
        </div>
        <select value={league} onChange={e => setLeague(e.target.value)} style={{ flex: '1 1 180px' }}>
          <option value="">All leagues</option>
          {ALL_LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        {(search || league) && (
          <button onClick={() => { setSearch(''); setLeague('') }} style={{ padding: '7px 12px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {['table', 'leagues'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: view === v ? 'var(--accent)' : 'var(--surface)',
              color: view === v ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
            }}>
              {v === 'table' ? 'All clubs' : 'By league'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Clubs', val: filtered.length.toLocaleString() },
          { label: 'Leagues', val: leagueGroups.length },
          { label: 'Avg OVR', val: avgOvr || '—' },
          { label: 'Total value', val: fmtValue(totalValue) },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>

      {view === 'table' && (
        <TeamsTable teams={filtered} onSelect={setSelected} />
      )}

      {view === 'leagues' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {leagueGroups.map(({ name, clubs, avgOvr: lAvg, totalValue: lVal }) => (
            <div key={name} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{name}</span>
                <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>{clubs.length} clubs</span>
                  <span>Avg OVR <strong style={{ color: '#6c63ff' }}>{lAvg}</strong></span>
                  <span>{fmtValue(lVal)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {clubs.map((club, i) => (
                  <div key={club.name}
                    onClick={() => setSelected(club)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', cursor: 'pointer', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: i % 2 !== 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 !== 0 ? 'rgba(255,255,255,0.015)' : 'transparent'}
                  >
                    <span style={{ width: 20, fontSize: 11, color: 'var(--text-dim)', textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                    <TeamLogo name={club.name} teamId={club.id} size={22} />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{club.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{club.squadSize} players</span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <div style={{ width: 80, height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${((club.avgOvr - 55) / 35) * 100}%`, height: '100%', background: '#6c63ff', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#6c63ff', width: 32, textAlign: 'right' }}>{club.avgOvr}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', width: 70, textAlign: 'right' }}>{fmtValue(club.totalValue)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <SquadModal team={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
