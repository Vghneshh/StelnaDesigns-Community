
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { scrapeAll, searchSketchfab, searchThingiverse, searchMyMiniFactory, searchCults3D } = require('./scraper')

const app = express()
const PORT = 5000

// Root route for Render health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Middleware
app.use(cors()); // Allow all origins for deployment and testing
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, slow down.' }
})
app.use('/api', limiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CADSearch server running' })
})

// ✅ Streaming search endpoint — sends results as each source finishes
app.get('/api/search/stream', async (req, res) => {
  const { q } = req.query
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query too short' })
  }

  const query = q.trim()

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.flushHeaders()

  const seen = new Set()

  // Send results from a source as soon as it finishes
  function send(source, results) {
    // Deduplicate across sources
    const fresh = results.filter(r => {
      if (!r.url || seen.has(r.url)) return false
      seen.add(r.url)
      return true
    })
    if (fresh.length === 0) return
    res.write(`data: ${JSON.stringify({ source, results: fresh })}\n\n`)
  }

  // Fire all sources in parallel — each sends results the moment it's done
  const sources = [
    searchSketchfab(query).then(r => send('sketchfab', r)).catch(() => {}),
    searchThingiverse(query).then(r => send('thingiverse', r)).catch(() => {}),
    searchMyMiniFactory(query).then(r => send('myminifactory', r)).catch(() => {}),
    searchCults3D(query).then(r => send('cults3d', r)).catch(() => {}),
  ]

  await Promise.allSettled(sources)

  // Signal done
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
  res.end()
})

// Original non-streaming endpoint (keep as fallback)
app.get('/api/search', async (req, res) => {
  const { q } = req.query

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: 'Query too short' })
  }

  try {
    const raw = await scrapeAll(q.trim())

    const seen = new Set()
    const results = raw.filter(r => {
      if (seen.has(r.url)) return false
      seen.add(r.url)
      return true
    })

    res.json({
      query: q.trim(),
      count: results.length,
      results,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Scraping failed' })
  }
})

app.listen(PORT, () => {
  console.log(`CADSearch server running on http://localhost:${PORT}`)
})