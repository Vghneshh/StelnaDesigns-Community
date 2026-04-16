/**
 * In-memory rate limiter for search endpoints
 * Tracks requests per session ID with 60-second sliding window
 */

class RateLimiter {
  constructor(limit = 5, windowMs = 60 * 1000) {
    this.limit = limit           // 5 requests per window
    this.windowMs = windowMs     // 60 seconds
    this.requests = new Map()    // sessionId -> { count, firstRequestTime }
    this.cleanupInterval = null
    this.startCleanup()
  }

  /**
   * Check if session has exceeded rate limit
   * Returns true if within limit, false if exceeded
   */
  checkLimit(sessionId) {
    const now = Date.now()
    const record = this.requests.get(sessionId)

    // First request or window expired
    if (!record || now - record.firstRequestTime > this.windowMs) {
      this.requests.set(sessionId, { count: 1, firstRequestTime: now })
      return true
    }

    // Within limit
    if (record.count < this.limit) {
      record.count++
      return true
    }

    // Exceeded limit
    return false
  }

  /**
   * Log a request for a session (increments counter)
   * Used after middleware passes checkLimit()
   */
  logRequest(sessionId) {
    const now = Date.now()
    const record = this.requests.get(sessionId)

    if (!record || now - record.firstRequestTime > this.windowMs) {
      this.requests.set(sessionId, { count: 1, firstRequestTime: now })
    } else {
      record.count++
    }
  }

  /**
   * Reset rate limit for a session (called after CAPTCHA verification)
   */
  resetLimit(sessionId) {
    this.requests.delete(sessionId)
  }

  /**
   * Get current limit status for a session (for debugging)
   */
  getStatus(sessionId) {
    const record = this.requests.get(sessionId)
    if (!record) {
      return { remaining: this.limit, resetTime: null }
    }

    const now = Date.now()
    const elapsed = now - record.firstRequestTime
    const remaining = Math.max(0, this.limit - record.count)
    const resetTime = new Date(record.firstRequestTime + this.windowMs)

    return {
      count: record.count,
      remaining,
      resetTime,
      windowExpired: elapsed > this.windowMs
    }
  }

  /**
   * Cleanup expired records periodically (every 2 minutes)
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      let cleaned = 0

      for (const [sessionId, record] of this.requests.entries()) {
        if (now - record.firstRequestTime > this.windowMs) {
          this.requests.delete(sessionId)
          cleaned++
        }
      }

      if (cleaned > 0) {
        console.log(`[RateLimiter] Cleaned up ${cleaned} expired records`)
      }
    }, 2 * 60 * 1000) // 2 minutes
  }

  /**
   * Stop cleanup interval (call on server shutdown)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

module.exports = new RateLimiter(5, 120 * 1000) // 5 requests per 120 seconds (2 minutes)
