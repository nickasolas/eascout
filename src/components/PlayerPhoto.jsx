import { useState } from 'react'

const AVATAR_COLORS = [
  ['#6c63ff','#3d3580'],['#22c55e','#14532d'],['#f59e0b','#78350f'],
  ['#ef4444','#7f1d1d'],['#06b6d4','#164e63'],['#ec4899','#831843'],
  ['#a78bfa','#4c1d95'],['#34d399','#064e3b'],
]

function initials(name) {
  return name.split(/[\s.]+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase()
}
function avatarColors(name) {
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

export function playerPhotoUrl(id) {
  return `https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p${id}.png`
}

export default function PlayerPhoto({ id, name, size = 80, radius = 12 }) {
  const [failed, setFailed] = useState(false)
  const [light, dark] = avatarColors(name)

  if (failed || !id) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        background: `linear-gradient(135deg, ${dark} 0%, ${light}99 100%)`,
        border: `1px solid ${light}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.34, fontWeight: 700, color: '#fff',
        letterSpacing: '-0.02em',
      }}>
        {initials(name)}
      </div>
    )
  }

  return (
    <img
      src={playerPhotoUrl(id)}
      alt={name}
      onError={() => setFailed(true)}
      style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        objectFit: 'cover', objectPosition: 'top',
        background: `linear-gradient(135deg, ${dark} 0%, ${light}44 100%)`,
      }}
    />
  )
}
