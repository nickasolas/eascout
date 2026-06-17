import { fmtValue, gapColor } from '../utils'
import { X } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#6c63ff', '#22c55e', '#f59e0b']
const ATTRS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic']
const LABELS = { pace: 'PAC', shooting: 'SHO', passing: 'PAS', dribbling: 'DRI', defending: 'DEF', physic: 'PHY' }

export default function ComparePanel({ players, onRemove, onClose }) {
  if (!players.length) return null

  const radarData = ATTRS.map(attr => ({
    attr: LABELS[attr],
    ...Object.fromEntries(players.map(p => [p.name, p[attr]]))
  }))

  const rows = [
    { label: 'Overall', key: 'overall' },
    { label: 'Potential', key: 'potential' },
    { label: 'Gap', key: 'gap', fmt: v => `+${v}` },
    { label: 'Age', key: 'age' },
    { label: 'PAC', key: 'pace' },
    { label: 'SHO', key: 'shooting' },
    { label: 'PAS', key: 'passing' },
    { label: 'DRI', key: 'dribbling' },
    { label: 'DEF', key: 'defending' },
    { label: 'PHY', key: 'physic' },
    { label: 'Finishing', key: 'finishing' },
    { label: 'Shot Power', key: 'shotPower' },
    { label: 'Sprint Speed', key: 'sprintSpeed' },
    { label: 'Value', key: 'value', fmt: fmtValue },
  ]

  function best(key) {
    const vals = players.map(p => p[key])
    return Math.max(...vals)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 16px', overflowY: 'auto'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border-hover)',
        borderRadius: 16, width: '100%', maxWidth: 760, padding: 24
      }} onClick={e => e.stopPropagation()}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Compare players</span>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 6, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `140px repeat(${players.length}, 1fr)`, gap: 0, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ background: 'var(--surface2)', padding: '12px 14px', borderRight: '1px solid var(--border)' }} />
          {players.map((p, i) => (
            <div key={p.id} style={{ padding: '12px 14px', background: 'var(--surface2)', borderRight: i < players.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div>
                <div style={{ fontWeight: 500, color: COLORS[i] }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{p.club}</div>
              </div>
              <button onClick={() => onRemove(p)} style={{ color: 'var(--text-dim)', flexShrink: 0 }}><X size={13} /></button>
            </div>
          ))}

          {rows.map(({ label, key, fmt }, ri) => (
            <>
              <div key={`l-${key}`} style={{ padding: '8px 14px', fontSize: 12, color: 'var(--text-muted)', borderRight: '1px solid var(--border)', borderTop: '1px solid var(--border)', background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>{label}</div>
              {players.map((p, i) => {
                const val = p[key]
                const display = fmt ? fmt(val) : val
                const isBest = typeof val === 'number' && val === best(key)
                return (
                  <div key={`${key}-${p.id}`} style={{
                    padding: '8px 14px', fontSize: 13, fontWeight: isBest ? 600 : 400,
                    color: isBest ? '#22c55e' : 'var(--text)',
                    borderRight: i < players.length - 1 ? '1px solid var(--border)' : 'none',
                    borderTop: '1px solid var(--border)',
                    background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                  }}>
                    {display}
                  </div>
                )
              })}
            </>
          ))}
        </div>

        <div style={{ marginTop: 28, height: 260 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Attribute radar</div>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="attr" tick={{ fill: '#7b82a0', fontSize: 11 }} />
              {players.map((p, i) => (
                <Radar key={p.id} name={p.name} dataKey={p.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
              ))}
              <Legend wrapperStyle={{ fontSize: 12, color: '#7b82a0' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}
