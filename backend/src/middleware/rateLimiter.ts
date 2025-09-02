import rateLimit from 'express-rate-limit'
import { config } from '@/config/config'
import { logger } from '@/config/logger'

// Store for rate limiting (in production, use Redis)
const store = new Map<string, { count: number; resetTime: number }>()

// Custom store for rate limiting
const customStore = {
  increment: (key: string, windowMs: number) => {
    const now = Date.now()
    const windowStart = Math.floor(now / windowMs) * windowMs
    const windowKey = `${key}:${windowStart}`
    
    const current = store.get(windowKey) || { count: 0, resetTime: windowStart + windowMs }
    
    if (now >= current.resetTime) {
      current.count = 1
      current.resetTime = windowStart + windowMs
    } else {
      current.count++
    }
    
    store.set(windowKey, current)
    
    // Clean up old entries
    for (const [k, v] of store.entries()) {
      if (now >= v.resetTime) {
        store.delete(k)
      }
    }
    
    return {
      totalHits: current.count,
      resetTime: new Date(current.resetTime)
    }
  }
}

// Global rate limiter
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    })
    
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
    })
  }
})

// Strict rate limiter for sensitive endpoints
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    error: 'Too many attempts, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    })
    
    res.status(429).json({
      error: 'Too many attempts, please try again later.',
      retryAfter: 900
    })
  }
})

// API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return (req as any).user?.id || req.ip
  }
})

// Auth rate limiter
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    })
    
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: 900
    })
  }
})

// File upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 uploads per minute
  message: {
    error: 'Too many file uploads, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Webhook rate limiter
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // 1000 webhooks per minute
  message: {
    error: 'Webhook rate limit exceeded.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
})
