import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '@/config/config'
import { prisma } from '@/config/database'
import { logger } from '@/config/logger'
import { CustomError } from './errorHandler'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    organizationId?: string
  }
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req)
    
    if (!token) {
      throw new CustomError('Access token required', 401)
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as any
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        organizations: {
          select: {
            organizationId: true,
            role: true
          }
        }
      }
    })

    if (!user || !user.isActive) {
      throw new CustomError('User not found or inactive', 401)
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizations[0]?.organizationId
    }

    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401))
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401))
    } else {
      next(error)
    }
  }
}

export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req)
    
    if (token) {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as any
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          organizations: {
            select: {
              organizationId: true,
              role: true
            }
          }
        }
      })

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizations[0]?.organizationId
        }
      }
    }

    next()
  } catch (error) {
    // For optional auth, we don't throw errors, just continue without user
    next()
  }
}

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new CustomError('Authentication required', 401)
    }

    if (!roles.includes(req.user.role)) {
      throw new CustomError('Insufficient permissions', 403)
    }

    next()
  }
}

export const requireOrganization = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401)
  }

  if (!req.user.organizationId) {
    throw new CustomError('Organization membership required', 403)
  }

  next()
}

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  )

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.auth.jwtRefreshSecret,
    { expiresIn: config.auth.jwtRefreshExpiresIn }
  )

  return { accessToken, refreshToken }
}

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, config.auth.jwtRefreshSecret)
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next()
    }

    const key = `rate_limit:user:${req.user.id}:${Math.floor(Date.now() / windowMs)}`
    
    try {
      const { redisClient } = await import('@/config/database')
      const currentCount = await redisClient.incr(key)
      
      if (currentCount === 1) {
        await redisClient.expire(key, Math.ceil(windowMs / 1000))
      }

      if (currentCount > maxRequests) {
        throw new CustomError('Rate limit exceeded', 429)
      }

      res.set('X-RateLimit-Limit', maxRequests.toString())
      res.set('X-RateLimit-Remaining', Math.max(0, maxRequests - currentCount).toString())
      
      next()
    } catch (error) {
      next(error)
    }
  }
}
