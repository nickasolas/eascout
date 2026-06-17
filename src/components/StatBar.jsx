import { statColor } from '../utils'

export default function StatBar({ label, value, short }) {
  const color = statColor(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ width: short ? 28 : 80, fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>
        {short || label}
      </span>
      <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ width: 26, fontSize: 12, fontWeight: 500, color, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
