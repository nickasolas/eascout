import { useState, useMemo } from 'react'
import players from './players.json'
import { filterPlayers, getLeagues, getNationalities, getClubsForLeague, DEFAULT_FILTERS, gapColor } from './utils'
import PlayerTable from './components/PlayerTable'
import PlayerCardList from './components/PlayerCardList'
import PlayerCard from './components/PlayerCard'
import ComparePanel from './components/ComparePanel'
import ScatterPlot from './components/ScatterPlot'
import Filters from './components/Filters'
import TeamsPage from './pages/TeamsPage'
import TeamLogo from './components/TeamLogo'
import { useIsMobile } from './hooks/useIsMobile'
import { GitCompare, SlidersHorizontal } from 'lucide-react'
import { flag } from './flags'
import Logo from './components/Logo'
import PlayerPhoto from './components/PlayerPhoto'

const leagues = getLeagues(players)
const nationalities = getNationalities(players)

export default function App() {
  const isMobile = useIsMobile()
  const [tab, setTab] = useState('players')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [view, setView] = useState('table')
  const [selected, setSelected] = useState(null)
  const [compareList, setCompareList] = useState([])
  const [showCompare, setShowCompare] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const clubs = useMemo(() => getClubsForLeague(players, filters.league), [filters.league])
  const filtered = useMemo(() => filterPlayers(players, filters), [filters])

  function openPlayer(p) {
    setSelected(p)
    setRecentlyViewed(prev => {
      const deduped = prev.filter(r => r.id !== p.id)
      return [p, ...deduped].slice(0, 4)
    })
  }

  function toggleCompare(p) {
    setCompareList(prev => {
      const exists = prev.find(c => c.id === p.id)
      if (exists) return prev.filter(c => c.id !== p.id)
      if (prev.length >= 3) return prev
      return [...prev, p]
    })
  }

  const recentCards = (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
      {recentlyViewed.length === 0
        ? Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => (
          <div key={i} style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Recently viewed</span>
          </div>
        ))
        : <>
          {recentlyViewed.slice(0, isMobile ? 2 : 4).map(p => (
            <button key={p.id} onClick={() => openPlayer(p)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '10px 12px', textAlign: 'left',
                cursor: 'pointer', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <PlayerPhoto id={p.id} name={p.name} size={32} radius={8} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                    <TeamLogo name={p.club} teamId={p.clubId} size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.club}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{flag(p.nationality)}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.primaryPos}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{p.overall}</span>
                <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>{p.potential}</span>
                <span style={{ fontSize: 10, background: `${gapColor(p.gap)}22`, color: gapColor(p.gap), padding: '1px 5px', borderRadius: 20, fontWeight: 600 }}>+{p.gap}</span>
              </div>
            </button>
          ))}
          {Array.from({ length: Math.max(0, (isMobile ? 2 : 4) - recentlyViewed.length) }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Recently viewed</span>
            </div>
          ))}
        </>
      }
    </div>
  )

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '16px 12px' : '24px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? 16 : 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo size={isMobile ? 36 : 44} />
          <div>
            <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: '-0.02em' }}>FCCareerScout</h1>
            {!isMobile && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>18,628 players · FC 27</p>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {[{ key: 'players', label: 'Players' }, { key: 'teams', label: 'Teams' }].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: isMobile ? '5px 14px' : '6px 20px', borderRadius: 7, fontSize: 13, fontWeight: 500,
              background: tab === key ? 'var(--accent)' : 'transparent',
              color: tab === key ? '#fff' : 'var(--text-muted)',
              border: 'none', transition: 'background 0.15s, color 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {tab === 'teams' && <TeamsPage />}

      {tab === 'players' && (
        <>
          {/* Recently viewed + toolbar */}
          {isMobile ? (
            <>
              {recentCards}
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
                <button onClick={() => setFiltersOpen(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)',
                  flex: 1,
                }}>
                  <SlidersHorizontal size={13} />
                  Filters
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }}>{filtered.length.toLocaleString()} players</span>
                </button>
                {compareList.length > 0 && (
                  <button onClick={() => setShowCompare(true)} style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <GitCompare size={13} /> {compareList.length}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ flex: 1, marginRight: 12 }}>
                {recentCards}
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {['table', 'scatter'].map(v => (
                  <button key={v} onClick={() => setView(v)} style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    background: view === v ? 'var(--accent)' : 'var(--surface)',
                    color: view === v ? '#fff' : 'var(--text-muted)',
                    border: `1px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
                {compareList.length > 0 && (
                  <button onClick={() => setShowCompare(true)} style={{
                    padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <GitCompare size={13} /> Compare ({compareList.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main content */}
          {isMobile ? (
            <>
              <Filters mobile open={filtersOpen} onClose={() => setFiltersOpen(false)}
                filters={filters} onChange={f => setFilters(f.league !== filters.league ? {...f, club: ''} : f)} onReset={() => setFilters(DEFAULT_FILTERS)}
                leagues={leagues} clubs={clubs} nationalities={nationalities} resultCount={filtered.length} />
              <PlayerCardList players={filtered} onSelect={openPlayer} compareList={compareList} onToggleCompare={toggleCompare} />
            </>
          ) : (
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <Filters filters={filters} onChange={f => setFilters(f.league !== filters.league ? {...f, club: ''} : f)} onReset={() => setFilters(DEFAULT_FILTERS)}
                leagues={leagues} clubs={clubs} nationalities={nationalities} resultCount={filtered.length} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {view === 'table'
                  ? <PlayerTable players={filtered} onSelect={openPlayer} compareList={compareList} onToggleCompare={toggleCompare} />
                  : <ScatterPlot players={filtered} onSelect={openPlayer} />}
              </div>
            </div>
          )}

          {selected && (
            <PlayerCard player={selected} onClose={() => setSelected(null)} onCompare={toggleCompare} inCompare={compareList.some(c => c.id === selected.id)} onOpen={openPlayer} />
          )}
          {showCompare && (
            <ComparePanel players={compareList} onRemove={p => { toggleCompare(p); if (compareList.length <= 1) setShowCompare(false) }} onClose={() => setShowCompare(false)} />
          )}
        </>
      )}
    </div>
  )
}
