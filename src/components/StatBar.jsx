import { statColor } from '../utils'

export default function StatBar({ label, value, short }) {
  const color = statColor(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
      <span style={{ width: short ? 28 : 80, fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', flexShrink: 0, textAlign: 'right' }}>
        {short || label}
      </span>
      <div style={{ flex: 1, height: 4, background: 'var(--surface3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      <span className="broadcast-title" style={{ width: 28, fontSize: 14, lineHeight: 1, color, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
