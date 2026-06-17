export function fmtValue(v) {
  if (!v) return '—'
  if (v >= 1_000_000) return `€${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `€${(v / 1_000).toFixed(0)}K`
  return `€${v}`
}

export function gapColor(gap) {
  if (gap >= 15) return '#22c55e'
  if (gap >= 10) return '#f59e0b'
  return '#7b82a0'
}

export function statColor(val) {
  if (val >= 80) return '#22c55e'
  if (val >= 70) return '#6c63ff'
  if (val >= 60) return '#f59e0b'
  return '#7b82a0'
}

export const ALL_POSITIONS = [
  'GK',
  'CB', 'LB', 'RB', 'LWB', 'RWB',
  'CDM', 'CM', 'CAM', 'LM', 'RM',
  'LW', 'RW', 'CF', 'ST',
]

export function getLeagues(players) {
  return [...new Set(players.map(p => p.league).filter(Boolean))].sort()
}

export function getNationalities(players) {
  return [...new Set(players.map(p => p.nationality).filter(Boolean))].sort()
}

export const DEFAULT_FILTERS = {
  search: '',
  position: '',
  league: '',
  nationality: '',
  foot: '',
  minAge: 16,
  maxAge: 45,
  minOvr: 40,
  maxOvr: 99,
  minPot: 40,
  maxPot: 99,
  minGap: 0,
}

export function filterPlayers(players, f) {
  const q = f.search.toLowerCase()
  return players.filter(p => {
    if (q && !p.name.toLowerCase().includes(q) && !p.club.toLowerCase().includes(q) && !p.nationality.toLowerCase().includes(q)) return false
    if (f.position && p.primaryPos !== f.position) return false
    if (f.league && p.league !== f.league) return false
    if (f.nationality && p.nationality !== f.nationality) return false
    if (f.foot && p.foot !== f.foot) return false
    if (p.age < f.minAge || p.age > f.maxAge) return false
    if (p.overall < f.minOvr || p.overall > f.maxOvr) return false
    if (p.potential < f.minPot || p.potential > f.maxPot) return false
    if (p.gap < f.minGap) return false
    return true
  })
}

export function sortPlayers(players, col, dir) {
  return [...players].sort((a, b) => {
    const av = a[col], bv = b[col]
    if (typeof av === 'string') return dir * av.localeCompare(bv)
    return dir * ((av ?? 0) - (bv ?? 0))
  })
}
