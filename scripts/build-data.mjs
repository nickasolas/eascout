// Merges recharge.com player data with fccareer.ai potential data,
// then regenerates src/players.json and src/teams.json.
// Run: node scripts/build-data.mjs /tmp/recharge_raw.json /tmp/fccareer_potential.json

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.join(__dirname, '../src')

const [,, rechargePath, fccareerPath] = process.argv
if (!rechargePath || !fccareerPath) {
  console.error('Usage: node scripts/build-data.mjs <recharge.json> <fccareer.json>')
  process.exit(1)
}

const players = JSON.parse(fs.readFileSync(rechargePath, 'utf8'))
const fccareer = JSON.parse(fs.readFileSync(fccareerPath, 'utf8'))

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

// Write players.json
fs.writeFileSync(path.join(SRC, 'players.json'), JSON.stringify(enriched))
console.error(`Wrote src/players.json (${enriched.length} players)`)

// Build teams.json
const clubMap = {}
enriched.forEach(p => {
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
