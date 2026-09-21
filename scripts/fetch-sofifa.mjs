// Fetches all men's players from sofifa.com to get accurate club/team/overall/potential/value.
// Run: node scripts/fetch-sofifa.mjs > /tmp/sofifa_players.json

import https from 'https'

const BASE = 'https://sofifa.com/players?type=all&col=oa&sort=desc&gender=0'
const DELAY_MS = 800 // be polite

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function fetchPage(offset) {
  return new Promise((resolve, reject) => {
    const url = `${BASE}&offset=${offset}`
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    }, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
    req.on('error', reject)
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function parsePlayers(html) {
  const players = []
  // Split by <tr> boundaries (each player is one <tr>)
  const rows = html.split('<tr')
  for (const row of rows) {
    // Player ID: from /player/123456/ href
    const idMatch = row.match(/href="\/player\/(\d+)\//)
    if (!idMatch) continue
    const id = parseInt(idMatch[1])
    // Team: from /team/123/teamname/ href
    const teamMatch = row.match(/href="\/team\/(\d+)\/[^"]*">([^<]+)</)
    const teamId = teamMatch ? parseInt(teamMatch[1]) : null
    const teamName = teamMatch ? teamMatch[2].trim() : null
    // Overall: <em title="91"> in data-col="oa" cell
    const ovrMatch = row.match(/data-col="oa"[^>]*><em title="(\d+)"/)
    const overall = ovrMatch ? parseInt(ovrMatch[1]) : 0
    // Potential: <em title="93"> in data-col="pt" cell
    const potMatch = row.match(/data-col="pt"[^>]*><em title="(\d+)"/)
    const potential = potMatch ? parseInt(potMatch[1]) : 0
    // Value: €14M or €38K in a <td> cell
    const valMatch = row.match(/€([\d.]+)([MK])\b/)
    let value = 0
    if (valMatch) {
      value = valMatch[2] === 'M' ? Math.round(parseFloat(valMatch[1]) * 1000)
            : Math.round(parseFloat(valMatch[1]))
    }
    if (id && overall) players.push({ id, teamId, teamName, overall, potential, value })
  }
  return players
}

async function main() {
  const all = []
  let offset = 0
  let empty = 0

  console.error('Starting SoFIFA scrape (men\'s players)...')

  while (empty < 2) {
    await sleep(DELAY_MS)
    let html
    try {
      html = await fetchPage(offset)
    } catch(e) {
      console.error(`  offset ${offset} error: ${e.message}, retrying in 3s...`)
      await sleep(3000)
      try { html = await fetchPage(offset) } catch(e2) {
        console.error(`  offset ${offset} failed twice, skipping`)
        offset += 60
        continue
      }
    }

    const players = parsePlayers(html)
    if (players.length === 0) {
      empty++
      console.error(`  offset ${offset}: 0 players (empty count: ${empty})`)
    } else {
      empty = 0
      all.push(...players)
      if (offset % 3000 < 60) {
        console.error(`  offset ${offset}: ${players.length} players (total: ${all.length})`)
      }
    }

    // Check if there's a next page
    if (!html.includes(`offset=${offset + 60}`)) break
    offset += 60
  }

  console.error(`Done: ${all.length} players from sofifa.com`)
  console.log(JSON.stringify(all))
}

main().catch(e => { console.error(e); process.exit(1) })
