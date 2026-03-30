const { detectFileTypes } = require('./utils')
require('dotenv').config()
const axios = require('axios')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer')
const { searchSketchfab } = require('./sketchfab')
const { searchThingiverse } = require('./thingiverse')

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

function withTimeout(promise, ms, siteName) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`${siteName} timed out after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

function buildQuery(userQuery) {
  return userQuery
}

function isCADResult(title = '', description = '', query = '') {
  return !!title
}

function extractMeta(html, sourceUrl) {
  const $ = cheerio.load(html)
  const domain = new URL(sourceUrl).hostname.replace('www.', '')

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('title').text() || null

  const description =
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') || null

  const imageUrl =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') || null

  const pageUrl =
    $('meta[property="og:url"]').attr('content') ||
    $('link[rel="canonical"]').attr('href') ||
    sourceUrl

  return {
    title: title ? title.trim().slice(0, 150) : null,
    description: description ? description.trim().slice(0, 300) : null,
    imageUrl: imageUrl || null,
    url: pageUrl,
    source: domain,
  }
}



async function searchMyMiniFactory(query) {
  const apiKey = process.env.MMF_API_KEY
  if (!apiKey) {
    console.log('[MyMiniFactory] No API key found, skipping')
    return []
  }
  try {
    const response = await axios.get('https://www.myminifactory.com/api/v2/search', {
      params: { q: query, per_page: 10 },
      headers: { 'X-API-Key': apiKey },
      timeout: 8000,
    })
    const items = response.data?.items || []
    console.log(`[MyMiniFactory] ${items.length} results for "${query}"`)
    return items
      .filter(item => item.name)
      .map(item => ({
        title: item.name,
        description: item.description ? item.description.slice(0, 300) : null,
        imageUrl: item.images?.[0]?.thumbnail?.url || null,
        url: item.url || `https://www.myminifactory.com/object/${item.id}`,
        source: 'myminifactory.com',
        fileTypes: ['STL'],
        downloads: item.download_count || 0,
      }))
      .filter(r => isCADResult(r.title, r.description, query))
  } catch (err) {
    console.log(`[MyMiniFactory error] ${err.message}`)
    return []
  }
}

// ✅ Cults3D via official GraphQL API
async function searchCults3D(query) {
  const username = process.env.CULTS3D_USERNAME
  const apiKey = process.env.CULTS3D_API_KEY
  if (!username || !apiKey) {
    console.log('[Cults3D] No credentials found, skipping')
    return []
  }
  try {
    const response = await axios.post(
      'https://cults3d.com/graphql',
      {
        query: `{
          creationsSearchBatch(query: "${query.replace(/"/g, '')}", limit: 20) {
            results {
              name(locale: EN)
              shortUrl
              illustrationImageUrl
              description(locale: EN)
              downloadsCount
              creator { nick }
            }
          }
        }`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${username}:${apiKey}`).toString('base64')}`,
        },
        timeout: 8000,
      }
    )

    const items = response.data?.data?.creationsSearchBatch?.results || []
    console.log(`[Cults3D] ${items.length} results for "${query}"`)

    return items
      .filter(item => item.name)
      .map(item => ({
        title: item.name,
        description: item.description ? item.description.slice(0, 300) : null,
        imageUrl: item.illustrationImageUrl || null,
        url: item.shortUrl,
        source: 'cults3d.com',
        fileTypes: ['STL'],
        downloads: item.downloadsCount || 0,
        author: item.creator?.nick || null,
      }))
      .filter(r => isCADResult(r.title, r.description, query))
  } catch (err) {
    console.log(`[Cults3D error] ${err.message}`)
    return []
  }
}

async function scrapePuppeteer(site, query, page) {
  try {
    const searchUrl = site.searchUrl(buildQuery(query))
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 10000 })
    await new Promise(r => setTimeout(r, 2000))

    const links = await page.evaluate((selector, domain) => {
      const els = document.querySelectorAll(selector)
      const found = []
      els.forEach((el, i) => {
        if (i >= 3) return
        let href = el.getAttribute('href')
        if (!href) return
        if (href.startsWith('/')) href = `https://${domain}${href}`
        if (href.startsWith('http')) found.push(href)
      })
      return found
    }, site.resultSelector, site.domain)

    const results = []
    for (const link of links) {
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 4000 })
        await new Promise(r => setTimeout(r, 500))
        const html = await page.content()
        const meta = extractMeta(html, link)
        if (meta.title && isCADResult(meta.title, meta.description, query)) {
          results.push(meta)
        }
      } catch (e) {
        console.log(`[SKIP page] ${link}: ${e.message}`)
      }
    }
    return results

  } catch (err) {
    console.log(`[SKIP puppeteer] ${site.name}: ${err.message}`)
    return []
  }
}

const CAD_SITES = [
  {
    name: 'CGTrader',
    domain: 'cgtrader.com',
    type: 'js',
    searchUrl: q => `https://www.cgtrader.com/search?searchQuery=${encodeURIComponent(q)}`,
    resultSelector: 'a.model-name',
  },
]

function rankResults(results, query) {
  const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2)

  const scored = results.map(result => {
    let score = 0
    const title = (result.title || '').toLowerCase()
    const desc = (result.description || '').toLowerCase()

    queryWords.forEach(word => {
      if (title.includes(word)) score += 5
      if (title.includes(query.toLowerCase())) score += 5
      if (desc.includes(word)) score += 2
    })

    if (result.imageUrl) score += 1

    const trustedSources = ['sketchfab.com', 'thingiverse.com', 'myminifactory.com', 'cults3d.com']
    if (trustedSources.includes(result.source)) score += 2

    return { ...result, score }
  })

  const exemptSources = ['thingiverse.com', 'myminifactory.com', 'cults3d.com', 'sketchfab.com'];
  return scored
    .filter(r => r.score >= 0 || exemptSources.includes(r.source))
    .sort((a, b) => b.score - a.score)
    .slice(0, 100)
}

async function scrapeAll(query) {
  console.log(`\n[SEARCH] "${query}" — scraping all sources`)
  const start = Date.now()

  const jsSites = CAD_SITES.filter(s => s.type === 'js')

  const [sketchfabResults, thingiverseResults, mmfResults, cults3dResults] = await Promise.all([
    searchSketchfab(query),
    searchThingiverse(query),
    searchMyMiniFactory(query),
    searchCults3D(query),
  ])

  let jsResults = []
  let browser
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setUserAgent(HEADERS['User-Agent'])
    await page.setDefaultTimeout(12000)

    for (const site of jsSites) {
      try {
        const results = await withTimeout(
          scrapePuppeteer(site, query, page),
          8000,
          site.name
        )
        jsResults.push(...results)
      } catch (err) {
        console.log(`[TIMEOUT] ${site.name}: ${err.message}`)
      }
    }
  } catch (err) {
    console.log(`[Browser error] ${err.message}`)
  } finally {
    if (browser) await browser.close()
  }

  const seen = new Set()
  const merged = [
    ...sketchfabResults,
    ...thingiverseResults,
    ...mmfResults,
    ...cults3dResults,
    ...jsResults,
  ].filter(r => {
    if (seen.has(r.url)) return false
    seen.add(r.url)
    return true
  })

  const results = rankResults(merged, query)
  console.log(`[DONE] ${results.length} results in ${((Date.now() - start) / 1000).toFixed(2)}s`)
  return results
}

module.exports = {
  scrapeAll,
  searchSketchfab,
  searchThingiverse,
  searchMyMiniFactory,
  searchCults3D,
  detectFileTypes,
}