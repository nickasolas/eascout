// Fetches FC 27 men's player data from recharge.com S3 files.
// The URLs are decoded from the obfuscated JS on recharge.com/blog/fc-27-player-ratings.
// Run: node scripts/fetch-recharge.mjs > /tmp/recharge_raw.json

import https from 'https'

const BASE = 'https://creativegroup-blog-prd-eu-west-1-recharge-blog.s3.eu-west-1.amazonaws.com/blog/wp-content/uploads/2026/09'

async function getFileUrls() {
  // Decode URLs from the obfuscated JS on recharge.com
  return new Promise((resolve, reject) => {
    https.get('https://www.recharge.com/blog/fc-27-player-ratings', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const html = Buffer.concat(chunks).toString('utf8')
        const b64Match = html.match(/atob\("([A-Za-z0-9+/=]{100,})"\)/)
        if (!b64Match) { reject(new Error('Could not find base64 blob')); return }
        const decoded = Buffer.from(b64Match[1], 'base64').toString('utf8')
        const urls = decoded.match(/https:\/\/[^\s"']+\.txt/g) || []
        resolve(urls)
      })
    }).on('error', reject)
  })
}

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    }).on('error', reject)
  })
}

async function main() {
  let urls
  try {
    urls = await getFileUrls()
    console.error(`Found ${urls.length} file URLs from page JS`)
  } catch (e) {
    console.error(`Could not decode URLs from page (${e.message}), using hardcoded fallback`)
    urls = [
      `${BASE}/03121922/rcw-fc-top-p1-2.txt`,
      `${BASE}/03121925/rcw-fc-top-p2-2.txt`,
      `${BASE}/03121927/rcw-fc-rest-p1-2.txt`,
      `${BASE}/03121931/rcw-fc-rest-p2-2.txt`,
      `${BASE}/03121933/rcw-fc-rest-p3-2.txt`,
      `${BASE}/03121936/rcw-fc-rest-p4-2.txt`,
      `${BASE}/03121938/rcw-fc-rest-p5-2.txt`,
      `${BASE}/03121940/rcw-fc-rest-p6-2.txt`,
      `${BASE}/03121942/rcw-fc-rest-p7-2.txt`,
      `${BASE}/03121945/rcw-fc-rest-p8-2.txt`,
      `${BASE}/03121947/rcw-fc-rest-p9-2.txt`,
      `${BASE}/03121949/rcw-fc-rest-p10-1.txt`,
      `${BASE}/03121952/rcw-fc-rest-p11-1.txt`,
    ]
  }

  // Filter to player data files only (exclude movers etc.)
  const playerFiles = urls.filter(u => /rcw-fc-(top|rest)-p/.test(u))
  console.error(`Fetching ${playerFiles.length} player files...`)

  const allPlayers = [], allClubs = {}, allNations = {}

  for (let i = 0; i < playerFiles.length; i++) {
    const url = playerFiles[i]
    console.error(`  ${i + 1}/${playerFiles.length}: ${url.split('/').pop()}`)
    try {
      const raw = await fetchFile(url)
      const jsonStr = raw.includes('\n') ? raw.substring(raw.indexOf('\n') + 1) : raw
      const data = JSON.parse(jsonStr)
      allPlayers.push(...data.players)
      Object.assign(allClubs, data.clubs)
      Object.assign(allNations, data.nations)
    } catch (e) {
      console.error(`    ERROR: ${e.message}`)
    }
  }

  const men = allPlayers.filter(p => p.g === 0)
  console.error(`\nTotal: ${allPlayers.length} players, ${men.length} men`)

  const converted = men.map(p => {
    const stats = p.st || [0, 0, 0, 0, 0, 0]
    return {
      id: p.id,
      name: p.n,
      overall: p.o,
      potential: p.o,
      gap: 0,
      age: p.a,
      nationality: allNations[p.nt]?.label || 'Unknown',
      club: allClubs[p.c]?.label || 'Unknown',
      clubId: p.c,
      league: p.lg || '',
      primaryPos: p.p,
      foot: p.ft || '',
      skillMoves: p.sm || 0,
      weakFoot: p.wf || 0,
      pace: stats[0],
      shooting: stats[1],
      passing: stats[2],
      dribbling: stats[3],
      defending: stats[4],
      physic: stats[5],
      value: 0,
    }
  })

  console.log(JSON.stringify(converted))
}

main().catch(e => { console.error(e); process.exit(1) })
