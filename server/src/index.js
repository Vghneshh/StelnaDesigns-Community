
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const nodemailer = require('nodemailer')
const { scrapeAll, searchSketchfab, searchThingiverse, searchMyMiniFactory, searchCults3D } = require('./scraper')
const searchRateLimiter = require('./rateLimiter')

const app = express()
const PORT = 5000

const smtpHost = process.env.SMTP_HOST || 'smtp.zoho.in'
const smtpPort = Number(process.env.SMTP_PORT || 465)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const mailTo = process.env.MAIL_TO
const mailFrom = process.env.MAIL_FROM
const mailFromName = process.env.MAIL_FROM_NAME || 'Website Form'

const mailTransport = smtpUser && smtpPass
  ? nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })
  : null

if (mailTransport && mailTo && mailFrom) {
  console.log('✅ SMTP mail configured')
  console.log('Email will be sent to:', mailTo)
  console.log('From:', mailFrom)

  // Verify SMTP connection
  mailTransport.verify((err, success) => {
    if (err) {
      console.error('❌ SMTP VERIFICATION FAILED:', err.message || err)
    } else {
      console.log('✅ SMTP VERIFICATION PASSED - Ready to send emails')
    }
  })
}

function sanitizeValue(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatField(label, value) {
  return `<p><strong style="color: #333;">${escapeHtml(label)}:</strong> ${escapeHtml(value || '-')}</p>`
}

function buildEmailTemplate(formType, payload) {
  const name = payload.name || (payload.firstName + ' ' + payload.lastName) || 'Guest'
  const organisation = payload.organisation || payload.company || '-'

  let subject = 'New Form Submission'
  let title = 'New Form Submission'
  let fields = []

  if (formType === 'manufacture') {
    subject = `New Manufacturing Request from ${payload.organisation || 'Customer'}`
    title = 'Manufacturing Request'
    fields = [
      { label: 'Name', value: payload.name },
      { label: 'Email', value: payload.email },
      { label: 'Organisation', value: payload.organisation },
      { label: 'Role', value: payload.role },
      { label: 'File / Link', value: payload.fileOrLink },
      { label: 'Requirements', value: payload.requirements },
    ]
  } else if (formType === 'custom-design') {
    subject = `New Custom Design Request from ${payload.organisation || 'Customer'}`
    title = 'Custom Design Request'
    fields = [
      { label: 'Name', value: payload.name },
      { label: 'Email', value: payload.email },
      { label: 'Organisation', value: payload.organisation },
      { label: 'Role', value: payload.role },
      { label: 'Design Requirements', value: payload.designRequirements },
    ]
  } else if (formType === 'contact') {
    subject = `New Contact Form Submission from ${payload.company || 'Customer'}`
    title = 'Contact Inquiry'
    fields = [
      { label: 'First Name', value: payload.firstName },
      { label: 'Last Name', value: payload.lastName },
      { label: 'Email', value: payload.email },
      { label: 'Company', value: payload.company },
      { label: 'Inquiry', value: payload.inquiry },
      { label: 'Agree to Emails', value: payload.agreeToEmails ? 'Yes' : 'No' },
    ]
  }

  const fieldsHtml = fields.map(f => formatField(f.label, f.value)).join('')
  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px; }
        .header { background: #d97706; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
        .greeting { font-size: 16px; margin-bottom: 20px; }
        .fields { margin: 20px 0; border-top: 1px solid #eee; padding-top: 20px; }
        .field-section { background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 ${title}</h1>
        </div>
        <div class="content">
          <div class="greeting">
            <p>Hello <strong>Stelna Designs</strong>,</p>
            <p>You have received a new <strong>${title}</strong> from your CADSearch platform.</p>
          </div>

          <div class="field-section">
            <h3 style="margin-top: 0; color: #d97706;">📋 Submission Details</h3>
            ${fieldsHtml}
          </div>

          <div class="footer">
            <p>Submitted on: <strong>${submittedAt}</strong></p>
            <p>Visitor Email: <strong>${payload.email}</strong></p>
            <p style="color: #999;">This is an automated email from CADSearch. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Hello Stelna Designs,

You have received a new ${title} from your CADSearch platform.

--- Submission Details ---
${fields.map(f => `${f.label}: ${f.value || '-'}`).join('\n')}

Submitted on: ${submittedAt}
Visitor Email: ${payload.email}

This is an automated email from CADSearch.
  `.trim()

  return { subject, html, text }
}

// Root route for Render health check
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Middleware
app.use(cors()); // Allow all origins for deployment and testing
app.use(express.json())

// Keep API errors JSON-shaped so frontend never receives HTML error pages.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload.' })
  }
  return next(err)
})

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

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email...')
    await mailTransport.sendMail({
      from: `"CADSearch" <${mailFrom}>`,
      to: mailTo,
      subject: "Test Email from CADSearch",
      text: "If you see this, SMTP works!",
      html: "<p>If you see this, <strong>SMTP works!</strong></p>"
    })
    console.log('✅ Test email sent successfully!')
    res.json({ success: true, message: 'Test email sent to ' + mailTo })
  } catch (error) {
    console.error('❌ Test email failed:', error.code, error.message)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/forms/submit', async (req, res) => {
  console.log('📬 Form submission received:', req.body.formType)

  if (!mailTransport || !mailTo || !mailFrom) {
    console.error('❌ Mail not configured. mailTransport:', !!mailTransport, 'mailTo:', mailTo, 'mailFrom:', mailFrom)
    return res.status(500).json({
      error: 'Mail service not configured. Set SMTP_USER, SMTP_PASS, MAIL_TO and MAIL_FROM in server environment.'
    })
  }

  const formType = sanitizeValue(req.body.formType)
  const payload = req.body.payload || {}

  if (!formType || (formType !== 'manufacture' && formType !== 'contact' && formType !== 'custom-design')) {
    return res.status(400).json({ error: 'Invalid form type.' })
  }

  // Validate required fields
  let requiredFields = []

  if (formType === 'manufacture') {
    requiredFields = [payload.name, payload.email, payload.requirements]
  } else if (formType === 'contact') {
    requiredFields = [payload.firstName, payload.lastName, payload.email, payload.company, payload.inquiry]
  } else if (formType === 'custom-design') {
    requiredFields = [payload.name, payload.email, payload.designRequirements]
  }

  const missingRequired = requiredFields.some(value => !value)
  if (missingRequired) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  // Build professional email using template
  const { subject, html, text } = buildEmailTemplate(formType, payload)
  const visitorEmail = sanitizeValue(payload.email)

  try {
    console.log('📤 Sending email to:', mailTo)
    await mailTransport.sendMail({
      from: `"${mailFromName}" <${mailFrom}>`,
      to: mailTo,
      ...(visitorEmail ? { replyTo: visitorEmail } : {}),
      subject,
      text,
      html,
    })

    console.log('✅ Email sent successfully!')
    res.json({ success: true })
  } catch (error) {
    console.error('❌ SMTP send failed:', error.code, error.message)
    console.error('Full error:', error)
    res.status(500).json({ error: 'Failed to send form email.' })
  }
})

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({ error: 'Internal server error.' })
})

// Search-specific rate limiting middleware
function searchRateLimiterMiddleware(req, res, next) {
  // SessionId can come from query params (EventSource) or headers (fetch)
  const sessionId = req.query.sessionId || req.headers['x-session-id'] || req.ip || 'unknown'

  if (!searchRateLimiter.checkLimit(sessionId)) {
    searchRateLimiter.logRequest(sessionId)
    return res.status(429).json({
      error: 'Too many search requests',
      captchaRequired: true,
      message: 'You have exceeded the search limit. Please verify you\'re human.'
    })
  }

  // Request is within limit, log it and continue
  searchRateLimiter.logRequest(sessionId)
  next()
}

// ✅ Streaming search endpoint — sends results as each source finishes
app.get('/api/search/stream', searchRateLimiterMiddleware, async (req, res) => {
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
app.get('/api/search', searchRateLimiterMiddleware, async (req, res) => {
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

// CAPTCHA verification endpoint
app.post('/api/verify-captcha', async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ success: false, error: 'No CAPTCHA token provided' })
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('❌ RECAPTCHA_SECRET_KEY not configured')
    return res.status(500).json({ success: false, error: 'CAPTCHA not configured' })
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    if (data.success && data.score > 0.5) {
      res.json({ success: true })
    } else {
      res.json({ success: false, error: 'CAPTCHA verification failed' })
    }
  } catch (err) {
    console.error('CAPTCHA verification error:', err)
    res.status(500).json({ success: false, error: 'Verification failed' })
  }
})

// CAPTCHA verification + rate limit reset endpoint
app.post('/api/verify-captcha-and-reset', async (req, res) => {
  const { token, sessionId } = req.body

  if (!token) {
    return res.status(400).json({ success: false, error: 'No CAPTCHA token provided' })
  }

  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'No session ID provided' })
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  if (!secretKey) {
    console.error('❌ RECAPTCHA_SECRET_KEY not configured')
    return res.status(500).json({ success: false, error: 'CAPTCHA not configured' })
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    if (data.success && data.score > 0.5) {
      // CAPTCHA verified successfully — reset rate limit for this session
      searchRateLimiter.resetLimit(sessionId)
      console.log(`✅ CAPTCHA verified for session ${sessionId}, rate limit reset`)
      res.json({ success: true, rateLimitReset: true })
    } else {
      res.status(400).json({ success: false, error: 'CAPTCHA verification failed' })
    }
  } catch (err) {
    console.error('CAPTCHA verification error:', err)
    res.status(500).json({ success: false, error: 'Verification failed' })
  }
})

app.listen(PORT, () => {
  console.log(`CADSearch server running on http://localhost:${PORT}`)
})