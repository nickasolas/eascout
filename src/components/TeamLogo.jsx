import { useState } from 'react'

const COLORS = ['#6c63ff','#22c55e','#f59e0b','#ef4444','#06b6d4','#ec4899','#a78bfa','#34d399']

export default function TeamLogo({ name = '', teamId, size = 32 }) {
  const [failed, setFailed] = useState(false)

  const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const color = COLORS[seed % COLORS.length]

  if (teamId && !failed) {
    return (
      <img
        src={`/logos/${teamId}.png`}
        alt={name}
        width={size}
        height={size}
        style={{ objectFit: 'contain', flexShrink: 0 }}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: `${color}22`, border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 700, color,
    }}>
      {initials}
    </div>
  )
}
