// Merges recharge.com player data with fccareer.ai potential data,
// optionally patches club/league/value from sofifa.com data,
// then regenerates src/players.json and src/teams.json.
// Run: node scripts/build-data.mjs /tmp/recharge_raw.json /tmp/fccareer_potential.json [/tmp/sofifa_players.json]

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '../src')

const [,, rechargePath, fccareerPath, sofifaPath] = process.argv
if (!rechargePath || !fccareerPath) {
  console.error('Usage: node scripts/build-data.mjs <recharge.json> <fccareer.json> [sofifa.json]')
  process.exit(1)
}

const players = JSON.parse(fs.readFileSync(rechargePath, 'utf8'))
const fccareer = JSON.parse(fs.readFileSync(fccareerPath, 'utf8'))
const sofifaRaw = sofifaPath ? JSON.parse(fs.readFileSync(sofifaPath, 'utf8')) : []

function toSlug(name) {
  return name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-')
}

// Build prefix index
const byPrefix = {}
fccareer.forEach(p => {
  const parts = p.slug.split('-')
  for (let i = 1; i <= parts.length; i++) {
    const prefix = parts.slice(0, i).join('-')
    if (!byPrefix[prefix]) byPrefix[prefix] = []
    byPrefix[prefix].push(p)
  }
})

let matched = 0
const enriched = players.map(p => {
  const slug = toSlug(p.name)
  const candidates = byPrefix[slug] || []
  const best = candidates.find(c => c.overall === p.overall) || (candidates.length === 1 ? candidates[0] : null)
  if (best) {
    matched++
    return { ...p, potential: best.potential, gap: best.potential - p.overall, value: best.value }
  }
  return p
})

console.error(`Matched ${matched}/${players.length} players with potential data`)
console.error(`Players with gap > 0: ${enriched.filter(p => p.gap > 0).length}`)

// Apply SoFIFA corrections (club, clubId, overall, potential, value)
let sofifaPatched = 0
let final = enriched

if (sofifaRaw.length > 0) {
  // Build sofifa lookup by player id
  const sofifaById = {}
  sofifaRaw.forEach(s => { sofifaById[s.id] = s })

  // Build club→league map from recharge data (mostly accurate)
  const clubLeague = {}
  enriched.forEach(p => {
    if (p.club && p.league) clubLeague[p.club] = p.league
  })
  // Also build sofifaTeamId→league map
  const teamIdLeague = {}
  enriched.forEach(p => {
    if (p.clubId && p.league) teamIdLeague[p.clubId] = p.league
  })

  final = enriched.map(p => {
    const s = sofifaById[p.id]
    if (!s) return p
    const clubChanged = s.teamName && s.teamName !== p.club
    const league = teamIdLeague[s.teamId] || clubLeague[s.teamName] || p.league
    const updated = {
      ...p,
      overall: s.overall || p.overall,
      club: s.teamName || p.club,
      clubId: s.teamId ?? p.clubId,
      league,
      value: s.value || p.value,
    }
    // Recompute potential/gap using sofifa's potential if available
    if (s.potential && s.potential > (s.overall || p.overall)) {
      updated.potential = s.potential
      updated.gap = s.potential - updated.overall
    }
    if (clubChanged) sofifaPatched++
    return updated
  })
  console.error(`SoFIFA: patched club/league for ${sofifaPatched} players`)
}

// Derive secondary positions from stats
// Thresholds mirror EA's in-game position eligibility logic
function deriveSecondaryPositions(p) {
  const { primaryPos: pos, pace: pac, shooting: sho, passing: pas, dribbling: dri, defending: def, physic: phy } = p
  const candidates = new Set()

  // Goalkeeper — no derivation
  if (pos === 'GK') return []

  const attack  = pac >= 72 && sho >= 65 && dri >= 72
  const creative = pas >= 70 && dri >= 72
  const physical = def >= 62 && phy >= 72
  const speedy   = pac >= 78

  // Striker roles
  if (sho >= 78 && phy >= 65) candidates.add('ST')
  if (sho >= 72 && pac >= 70) candidates.add('CF')

  // Wide roles
  if (speedy && dri >= 72 && sho >= 62) { candidates.add('LW'); candidates.add('RW') }
  if (speedy && dri >= 68 && pas >= 62) { candidates.add('LM'); candidates.add('RM') }

  // Fullbacks
  if (pac >= 70 && def >= 60 && phy >= 65) { candidates.add('LB'); candidates.add('RB') }
  if (pac >= 68 && def >= 60 && phy >= 62) { candidates.add('LWB'); candidates.add('RWB') }

  // Central defensive / midfield
  if (physical && pas >= 58) candidates.add('CDM')
  if (def >= 72 && phy >= 72) candidates.add('CB')

  // Central midfield / attacking mid
  if (creative && phy >= 60) candidates.add('CM')
  if (creative && sho >= 65) candidates.add('CAM')

  // Remove primary, deduplicate, keep at most 3
  candidates.delete(pos)
  return [...candidates].slice(0, 3)
}

const withPositions = final.map(p => ({
  ...p,
  secondaryPositions: deriveSecondaryPositions(p),
}))

// Write players.json
fs.writeFileSync(path.join(SRC, 'players.json'), JSON.stringify(withPositions))
console.error(`Wrote src/players.json (${final.length} players)`)

// Build teams.json
const clubMap = {}
withPositions.forEach(p => {
  if (!p.club || p.club === 'Unknown') return
  if (!clubMap[p.clubId]) clubMap[p.clubId] = { id: String(p.clubId), name: p.club, league: p.league || '', players: [] }
  clubMap[p.clubId].players.push({ name: p.name, overall: p.overall, potential: p.potential, gap: p.gap, age: p.age, pos: p.primaryPos, value: p.value || 0, foot: p.foot })
})

const teams = Object.values(clubMap).map(club => {
  const ps = club.players
  const n = ps.length
  const avgOvr = Math.round(ps.reduce((s, p) => s + p.overall, 0) / n * 10) / 10
  const avgPot = Math.round(ps.reduce((s, p) => s + p.potential, 0) / n * 10) / 10
  const avgAge = Math.round(ps.reduce((s, p) => s + p.age, 0) / n * 10) / 10
  const totalValue = ps.reduce((s, p) => s + p.value, 0)
  const sorted = [...ps].sort((a, b) => b.overall - a.overall)
  const top11Avg = Math.round(sorted.slice(0, 11).reduce((s, p) => s + p.overall, 0) / Math.min(11, n) * 10) / 10
  return { id: club.id, name: club.name, league: club.league, squadSize: n, avgOvr, avgPot, avgAge, totalValue, top11Avg, players: sorted }
}).sort((a, b) => b.avgOvr - a.avgOvr)

fs.writeFileSync(path.join(SRC, 'teams.json'), JSON.stringify(teams))
console.error(`Wrote src/teams.json (${teams.length} clubs)`)
