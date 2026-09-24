import { fmtValue, gapColor } from '../utils'
import { flag } from '../flags'
import TeamLogo from './TeamLogo'
import StatBar from './StatBar'
import PlayerPhoto from './PlayerPhoto'
import { X, Star } from 'lucide-react'

const RADAR_STATS = [
  { key: 'pace', label: 'PAC' },
  { key: 'shooting', label: 'SHO' },
  { key: 'passing', label: 'PAS' },
  { key: 'dribbling', label: 'DRI' },
  { key: 'defending', label: 'DEF' },
  { key: 'physic', label: 'PHY' },
]

function Radar({ player }) {
  const cx = 100, cy = 100, r = 75
  const n = RADAR_STATS.length
  const points = RADAR_STATS.map((s, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const val = player[s.key] / 100
    return {
      x: cx + Math.cos(angle) * r * val,
      y: cy + Math.sin(angle) * r * val,
      lx: cx + Math.cos(angle) * (r + 18),
      ly: cy + Math.sin(angle) * (r + 18),
      label: s.label,
      val: player[s.key],
    }
  })

  const polygon = points.map(p => `${p.x},${p.y}`).join(' ')

  const gridLevels = [0.25, 0.5, 0.75, 1]
  const gridLines = gridLevels.map(lvl =>
    RADAR_STATS.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      return `${cx + Math.cos(angle) * r * lvl},${cy + Math.sin(angle) * r * lvl}`
    }).join(' ')
  )

  return (
    <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 220 }}>
      {gridLines.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {RADAR_STATS.map((_, i) => {
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle) * r} y2={cy + Math.sin(angle) * r} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      })}
      <polygon points={polygon} fill="rgba(108,99,255,0.25)" stroke="#6c63ff" strokeWidth="1.5" />
      {points.map((p, i) => (
        <g key={i}>
          <text x={p.lx} y={p.ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#7b82a0">{p.label}</text>
        </g>
      ))}
    </svg>
  )
}

export default function PlayerCard({ player, onClose, onCompare, inCompare }) {
  if (!player) return null

  const gap = player.gap
  const gColor = gapColor(gap)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border-hover)',
        borderRadius: 12, width: '100%', maxWidth: 640,
        maxHeight: '90vh', overflowY: 'auto', padding: 24,
        boxShadow: '0 0 60px rgba(0,61,255,0.2), 0 0 120px rgba(0,0,0,0.8)',
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <PlayerPhoto id={player.id} name={player.name} size={80} radius={12} />
            <div>
              <div className="broadcast-title" style={{ fontSize: 24, lineHeight: 1.1 }}>{player.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span>{flag(player.nationality)} {player.nationality}</span>
                <span style={{ color: 'var(--text-dim)' }}>·</span>
                <TeamLogo name={player.club} teamId={player.clubId} size={16} />
                <span>{player.club}</span>
                <span style={{ color: 'var(--text-dim)' }}>·</span>
                <span>{player.league}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onCompare(player)} style={{
              padding: '6px 12px', borderRadius: 5, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              background: inCompare ? 'var(--grad-accent)' : 'var(--surface2)',
              color: inCompare ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${inCompare ? 'transparent' : 'var(--border-hover)'}`,
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              <Star size={12} /> {inCompare ? 'In compare' : 'Compare'}
            </button>
            <button onClick={onClose} style={{ color: 'var(--text-dim)', padding: 6, borderRadius: 5, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'OVR', val: player.overall, color: '#fff' },
            { label: 'POT', val: player.potential, color: 'var(--green)' },
            { label: 'Gap', val: `+${gap}`, color: gColor },
            { label: 'Value', val: fmtValue(player.value), color: 'var(--electric)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 5 }}>{label}</div>
              <div className="broadcast-title" style={{ fontSize: 22, lineHeight: 1, color }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Attributes</div>
            <StatBar label="Pace" value={player.pace} short="PAC" />
            <StatBar label="Shooting" value={player.shooting} short="SHO" />
            <StatBar label="Passing" value={player.passing} short="PAS" />
            <StatBar label="Dribbling" value={player.dribbling} short="DRI" />
            <StatBar label="Defending" value={player.defending} short="DEF" />
            <StatBar label="Physicality" value={player.physic} short="PHY" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Radar</div>
            <Radar player={player} />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Attacking detail</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { label: 'Finishing', val: player.finishing },
              { label: 'Shot power', val: player.shotPower },
              { label: 'Long shots', val: player.longShots },
              { label: 'Sprint speed', val: player.sprintSpeed },
              { label: 'Acceleration', val: player.acceleration },
              { label: 'Positioning', val: player.positioning },
              { label: 'Heading', val: player.headingAcc },
              { label: 'Volleys', val: player.volleys },
              { label: 'Composure', val: player.composure },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 3 }}>{label}</div>
                <div className="broadcast-title" style={{ fontSize: 16, lineHeight: 1, color: val >= 80 ? 'var(--electric)' : val >= 70 ? 'var(--text)' : 'var(--text-muted)' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Age', val: player.age },
            { label: 'Foot', val: player.foot },
            { label: 'Weak foot', val: '★'.repeat(player.weakFoot) },
            { label: 'Skill moves', val: '★'.repeat(player.skillMoves) },
            { label: 'Work rate', val: player.workRate },
            { label: 'Wage', val: fmtValue(player.wage) + '/wk' },
            { label: 'Real face', val: player.realFace ? 'Yes' : 'No', highlight: player.realFace },
          ].map(({ label, val, highlight }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{label}</div>
              <div style={{ fontSize: 13, color: highlight ? '#22c55e' : 'var(--text-muted)', marginTop: 2 }}>{val}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
