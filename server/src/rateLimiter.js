// rateLimiter.js - Redis-backed rate limiter (falls back to memory in dev)
const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible')

let rateLimiter

if (process.env.REDIS_URL) {
  const Redis = require('ioredis')
  const redisClient = new Redis(process.env.REDIS_URL, {
    enableOfflineQueue: false,
    tls: { rejectUnauthorized: false } // required for Upstash
  })

  redisClient.on('error', (err) => {
    console.error('Redis error:', err.message)
  })

  rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'rl_search',
    points: 30,         // 30 searches allowed
    duration: 60 * 5,  // per 5 minutes
    blockDuration: 0,  // never hard block, just trigger CAPTCHA
  })

  console.log('✅ Redis rate limiter initialized')
} else {
  rateLimiter = new RateLimiterMemory({
    keyPrefix: 'rl_search',
    points: 30,
    duration: 60 * 5,
    blockDuration: 0,
  })

  console.log('⚠️  Using in-memory rate limiter (set REDIS_URL for persistence)')
}

module.exports = rateLimiter
