// Fetches potential ratings and market values from fccareer.ai for all players.
// Run: node scripts/fetch-potential.mjs > /tmp/fccareer_potential.json

import https from 'https'

const BASE = 'https://www.fccareer.ai'
const CONCURRENCY = 50

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'RSC': '1', 'User-Agent': 'Mozilla/5.0' } }, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function fetchSlugs() {
  const all = new Set()
  for (let i = 0; i <= 3; i++) {
    const xml = await httpsGet(`${BASE}/sitemaps/${i}.xml`)
    ;(xml.match(/\/players\/([a-z][a-z0-9-]+)/g) || []).forEach(s => all.add(s.slice('/players/'.length)))
  }
  return Array.from(all)
}

function parsePlayer(slug, rsc) {
  const potMatch = rsc.match(/\],(\d{2,3})," POT",""\]/)
  const ovrMatch = rsc.match(/\[(\d{2,3})," OVR"\]/)
  const valMatch = rsc.match(/· €([\d.]+)([MK])/)

  function parseAmount(num, unit) {
    const n = parseFloat(num)
    return unit === 'M' ? Math.round(n * 1000) : Math.round(n)
  }

  return {
    slug,
    potential: potMatch ? parseInt(potMatch[1]) : null,
    overall: ovrMatch ? parseInt(ovrMatch[1]) : null,
    value: valMatch ? parseAmount(valMatch[1], valMatch[2]) : 0,
  }
}

async function processBatch(slugs) {
  const results = await Promise.allSettled(
    slugs.map(async slug => {
      const rsc = await httpsGet(`${BASE}/players/${slug}`)
      return parsePlayer(slug, rsc)
    })
  )
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)
    .filter(p => p.potential !== null)
}

async function main() {
  console.error('Fetching player slugs from sitemaps...')
  const slugs = await fetchSlugs()
  console.error(`${slugs.length} slugs found`)

  const all = []
  for (let i = 0; i < slugs.length; i += CONCURRENCY) {
    const batch = slugs.slice(i, i + CONCURRENCY)
    const results = await processBatch(batch)
    all.push(...results)
    if ((i + CONCURRENCY) % 3000 < CONCURRENCY) {
      console.error(`  ${Math.min(i + CONCURRENCY, slugs.length)}/${slugs.length} processed, ${all.length} extracted`)
    }
  }

  console.error(`Done: ${all.length} players with potential data`)
  console.log(JSON.stringify(all))
}

main().catch(e => { console.error(e); process.exit(1) })
