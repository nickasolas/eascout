import { useState } from 'react'
import { fmtValue, gapColor } from '../utils'
import { X } from 'lucide-react'
import TeamLogo from './TeamLogo'

const POSITION_GROUPS = {
  'GK': ['GK'],
  'Defenders': ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  'Midfielders': ['CDM', 'CM', 'CAM', 'LM', 'RM'],
  'Attackers': ['LW', 'RW', 'CF', 'ST'],
}

function statColor(v) {
  if (v >= 85) return '#22c55e'
  if (v >= 78) return '#6c63ff'
  if (v >= 70) return '#f59e0b'
  return 'var(--text-muted)'
}

const XI_POSITIONS = {
  '4-3-3': [
    { pos: 'GK',  x: 50, y: 92 },
    { pos: 'RB',  x: 82, y: 75 }, { pos: 'CB', x: 62, y: 75 }, { pos: 'CB', x: 38, y: 75 }, { pos: 'LB', x: 18, y: 75 },
    { pos: 'CM',  x: 72, y: 52 }, { pos: 'CM', x: 50, y: 52 }, { pos: 'CM', x: 28, y: 52 },
    { pos: 'RW',  x: 82, y: 25 }, { pos: 'ST', x: 50, y: 18 }, { pos: 'LW', x: 18, y: 25 },
  ],
  '4-4-2': [
    { pos: 'GK',  x: 50, y: 92 },
    { pos: 'RB',  x: 82, y: 75 }, { pos: 'CB', x: 62, y: 75 }, { pos: 'CB', x: 38, y: 75 }, { pos: 'LB', x: 18, y: 75 },
    { pos: 'RM',  x: 82, y: 52 }, { pos: 'CM', x: 62, y: 52 }, { pos: 'CM', x: 38, y: 52 }, { pos: 'LM', x: 18, y: 52 },
    { pos: 'ST',  x: 65, y: 20 }, { pos: 'ST', x: 35, y: 20 },
  ],
  '4-2-3-1': [
    { pos: 'GK',  x: 50, y: 92 },
    { pos: 'RB',  x: 82, y: 75 }, { pos: 'CB', x: 62, y: 75 }, { pos: 'CB', x: 38, y: 75 }, { pos: 'LB', x: 18, y: 75 },
    { pos: 'CDM', x: 65, y: 57 }, { pos: 'CDM', x: 35, y: 57 },
    { pos: 'RM',  x: 82, y: 35 }, { pos: 'CAM', x: 50, y: 35 }, { pos: 'LM', x: 18, y: 35 },
    { pos: 'ST',  x: 50, y: 14 },
  ],
}

function BestXI({ players }) {
  const [formation, setFormation] = useState('4-3-3')
  const slots = XI_POSITIONS[formation]

  const byPos = {}
  players.forEach(p => {
    if (!byPos[p.pos]) byPos[p.pos] = []
    byPos[p.pos].push(p)
  })
  const used = new Set()

  const assigned = slots.map(slot => {
    const candidates = (byPos[slot.pos] || []).filter(p => !used.has(p.name))
    const pick = candidates[0] || null
    if (pick) used.add(pick.name)
    return { ...slot, player: pick }
  })

  const avgXI = assigned.filter(s => s.player).reduce((s, a) => s + a.player.overall, 0) / assigned.filter(s => s.player).length

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 4 }}>Formation</span>
        {Object.keys(XI_POSITIONS).map(f => (
          <button key={f} onClick={() => setFormation(f)} style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
            background: formation === f ? 'var(--accent)' : 'var(--surface2)',
            color: formation === f ? '#fff' : 'var(--text-muted)',
            border: `1px solid ${formation === f ? 'var(--accent)' : 'var(--border)'}`,
          }}>{f}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-dim)' }}>
          Avg OVR: <strong style={{ color: '#6c63ff' }}>{avgXI.toFixed(1)}</strong>
        </span>
      </div>

      <div style={{ position: 'relative', background: 'linear-gradient(180deg, #14532d 0%, #166534 50%, #14532d 100%)', borderRadius: 10, overflow: 'hidden', paddingBottom: '62%' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }} viewBox="0 0 100 62" preserveAspectRatio="none">
          <rect x="0" y="0" width="100" height="62" fill="none" stroke="white" strokeWidth="0.3" />
          <line x1="50" y1="0" x2="50" y2="62" stroke="white" strokeWidth="0.2" />
          <circle cx="50" cy="31" r="9" fill="none" stroke="white" strokeWidth="0.2" />
          <rect x="20" y="0" width="60" height="12" fill="none" stroke="white" strokeWidth="0.2" />
          <rect x="20" y="50" width="60" height="12" fill="none" stroke="white" strokeWidth="0.2" />
          <rect x="36" y="0" width="28" height="5" fill="none" stroke="white" strokeWidth="0.2" />
          <rect x="36" y="57" width="28" height="5" fill="none" stroke="white" strokeWidth="0.2" />
        </svg>
        {assigned.map((slot, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${slot.x}%`, top: `${slot.y}%`,
            transform: 'translate(-50%, -50%)',
            textAlign: 'center', width: 52,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', margin: '0 auto 3px',
              background: slot.player ? 'rgba(108,99,255,0.9)' : 'rgba(255,255,255,0.15)',
              border: `2px solid ${slot.player ? '#6c63ff' : 'rgba(255,255,255,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff',
            }}>
              {slot.player ? slot.player.overall : '?'}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.9)', fontWeight: 500, lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 52 }}>
              {slot.player ? slot.player.name.split(' ').pop() : slot.pos}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{slot.pos}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SquadModal({ team, onClose }) {
  const [tab, setTab] = useState('squad')
  if (!team) return null

  const groups = Object.entries(POSITION_GROUPS).map(([label, positions]) => ({
    label,
    players: team.players.filter(p => positions.includes(p.pos)),
  })).filter(g => g.players.length > 0)

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border-hover)', borderRadius: 16, width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', padding: 24 }}
        onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <TeamLogo name={team.name} teamId={team.id} size={52} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>{team.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{team.league} · {team.squadSize} players</div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 6, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Avg OVR', val: team.avgOvr, color: statColor(team.avgOvr) },
            { label: 'Top 11', val: team.top11Avg, color: statColor(team.top11Avg) },
            { label: 'Avg POT', val: team.avgPot, color: '#22c55e' },
            { label: 'Avg Age', val: team.avgAge, color: 'var(--text)' },
            { label: 'Squad Value', val: fmtValue(team.totalValue), color: 'var(--text-muted)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['squad', 'xi'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              background: tab === t ? 'var(--accent)' : 'var(--surface2)',
              color: tab === t ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${tab === t ? 'var(--accent)' : 'var(--border)'}`,
            }}>
              {t === 'squad' ? 'Full squad' : 'Best XI'}
            </button>
          ))}
        </div>

        {tab === 'xi' && <BestXI players={team.players} />}

        {tab === 'squad' && groups.map(({ label, players }) => (
          <div key={label} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {players.map(p => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 8, background: 'var(--surface2)' }}>
                  <span style={{ width: 36, fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', background: 'var(--bg)', borderRadius: 4, padding: '2px 4px' }}>{p.pos}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.age}y</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: statColor(p.overall), width: 28, textAlign: 'right' }}>{p.overall}</span>
                  <span style={{ fontSize: 12, color: '#22c55e', width: 28, textAlign: 'right' }}>{p.potential}</span>
                  <span style={{ fontSize: 11, color: gapColor(p.potential - p.overall), width: 28, textAlign: 'right' }}>+{p.potential - p.overall}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', width: 60, textAlign: 'right' }}>{fmtValue(p.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
