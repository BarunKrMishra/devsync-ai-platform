import { Router } from 'express'
import { checkDatabaseHealth } from '@/config/database'
import { asyncHandler } from '@/middleware/errorHandler'
import { AuthRequest } from '@/middleware/auth'
import { logger } from '@/config/logger'

const router = Router()

/**
 * @swagger
 * /api/monitor/health:
 *   get:
 *     summary: Get system health status
 *     tags: [Monitor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System health status
 *       401:
 *         description: Unauthorized
 */
router.get('/health', asyncHandler(async (req: AuthRequest, res) => {
  const dbHealth = await checkDatabaseHealth()
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    databases: dbHealth,
    services: {
      ai: {
        openai: !!process.env.OPENAI_API_KEY,
        anthropic: !!process.env.ANTHROPIC_API_KEY
      },
      storage: {
        aws: !!process.env.AWS_ACCESS_KEY_ID
      },
      email: {
        smtp: !!process.env.SMTP_USER
      }
    }
  }

  const isHealthy = Object.values(dbHealth).every(status => status === true)
  
  res.status(isHealthy ? 200 : 503).json({
    success: true,
    data: health
  })
}))

/**
 * @swagger
 * /api/monitor/metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [Monitor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics
 *       401:
 *         description: Unauthorized
 */
router.get('/metrics', asyncHandler(async (req: AuthRequest, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    application: {
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  }

  res.json({
    success: true,
    data: metrics
  })
}))

export default router
