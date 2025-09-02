import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Import configurations
import { config } from '@/config/config'
import { logger } from '@/config/logger'
import { connectDatabases } from '@/config/database'
import { setupOpenTelemetry } from '@/config/telemetry'

// Import middleware
import { errorHandler } from '@/middleware/errorHandler'
import { rateLimiter } from '@/middleware/rateLimiter'
import { authMiddleware } from '@/middleware/auth'

// Import routes
import authRoutes from '@/routes/auth'
import projectRoutes from '@/routes/projects'
import translatorRoutes from '@/routes/translator'
import connectorRoutes from '@/routes/connectors'
import monitorRoutes from '@/routes/monitor'
import webhookRoutes from '@/routes/webhooks'

// Import services
import { SocketService } from '@/services/socketService'
import { QueueService } from '@/services/queueService'

// Load environment variables
dotenv.config()

async function startServer() {
  try {
    // Setup OpenTelemetry
    if (config.telemetry.enabled) {
      setupOpenTelemetry()
    }

    // Connect to databases
    await connectDatabases()
    logger.info('Connected to all databases')

    // Create Express app
    const app = express()
    const server = createServer(app)

    // Setup Socket.IO
    const io = new SocketIOServer(server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST']
      }
    })

    // Initialize services
    const socketService = new SocketService(io)
    const queueService = new QueueService()

    // Middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }))
    app.use(compression())
    app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
    app.use(cors(config.cors))
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    app.use(rateLimiter)

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: config.nodeEnv
      })
    })

    // API routes
    app.use('/api/auth', authRoutes)
    app.use('/api/projects', authMiddleware, projectRoutes)
    app.use('/api/translator', authMiddleware, translatorRoutes)
    app.use('/api/connectors', authMiddleware, connectorRoutes)
    app.use('/api/monitor', authMiddleware, monitorRoutes)
    app.use('/api/webhooks', webhookRoutes)

    // API documentation
    if (config.nodeEnv === 'development') {
      const swaggerUi = require('swagger-ui-express')
      const swaggerSpec = require('@/config/swagger')
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    }

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      socketService.handleConnection(socket)
    })

    // Error handling middleware (must be last)
    app.use(errorHandler)

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      })
    })

    // Start server
    const PORT = config.port || 8000
    server.listen(PORT, () => {
      logger.info(`🚀 DevSync Backend Server running on port ${PORT}`)
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`)
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`)
      logger.info(`🌍 Environment: ${config.nodeEnv}`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      server.close(() => {
        logger.info('Process terminated')
        process.exit(0)
      })
    })

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()
