import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Simple configuration for local testing
const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'local-dev-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'local-dev-refresh-secret',
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
}

// Simple logger
const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
}

async function startServer() {
  try {
    logger.info('Starting DevSync Backend (Simple Mode)')
    logger.info('Configuration:', {
      port: config.port,
      nodeEnv: config.nodeEnv,
      frontendUrl: config.frontendUrl,
      hasOpenAI: !!config.openaiApiKey,
      hasAnthropic: !!config.anthropicApiKey,
    })

    // Create Express app
    const app = express()

    // Middleware
    app.use(helmet())
    app.use(compression())
    app.use(morgan('combined'))
    app.use(cors({
      origin: config.frontendUrl,
      credentials: true,
    }))
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true }))

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        mode: 'simple',
        services: {
          openai: !!config.openaiApiKey,
          anthropic: !!config.anthropicApiKey,
        }
      })
    })

    // API status endpoint
    app.get('/api/status', (req, res) => {
      res.json({
        message: 'DevSync API is running!',
        version: '1.0.0',
        mode: 'simple',
        features: {
          aiTranslator: !!config.openaiApiKey && !!config.anthropicApiKey,
          apiConnector: true,
          codeGeneration: !!config.openaiApiKey && !!config.anthropicApiKey,
        },
        endpoints: {
          health: '/health',
          status: '/api/status',
          demo: '/api/demo',
        }
      })
    })

    // Demo endpoint
    app.get('/api/demo', (req, res) => {
      res.json({
        message: 'DevSync Demo Endpoint',
        features: [
          'AI Requirement Translator',
          'Universal API Connector',
          'Multi-Framework Code Generation',
          'Real-time Collaboration',
          'Comprehensive Monitoring',
        ],
        workflow: [
          '1. Input natural language requirements',
          '2. AI translates to structured format',
          '3. Generate ERD and OpenAPI specs',
          '4. Create boilerplate code',
          '5. Connect to external APIs',
          '6. Deploy and monitor',
        ],
        supportedFrameworks: {
          backend: ['Node.js/Express', 'Laravel', 'Java/Spring Boot', 'Python/Django'],
          frontend: ['React', 'Vue.js', 'Angular'],
          databases: ['PostgreSQL', 'MySQL', 'MongoDB'],
        },
        supportedAPIs: [
          'Slack', 'Jira', 'GitHub', 'SendGrid', 'Twilio',
          'Stripe', 'AWS', 'Google Cloud', 'Microsoft Azure',
          'And 100+ more...'
        ]
      })
    })

    // AI Translator demo endpoint (mock)
    app.post('/api/translator/translate', (req, res) => {
      const { requirements } = req.body
      
      if (!requirements) {
        return res.status(400).json({ error: 'Requirements are required' })
      }

      // Mock response for demo
      res.json({
        success: true,
        data: {
          entities: [
            {
              name: 'User',
              attributes: [
                { name: 'id', type: 'string', required: true, description: 'Unique identifier' },
                { name: 'email', type: 'string', required: true, description: 'User email address' },
                { name: 'name', type: 'string', required: true, description: 'User full name' },
                { name: 'createdAt', type: 'datetime', required: true, description: 'Account creation date' },
              ],
              relationships: [],
              description: 'User entity for authentication and profile management'
            }
          ],
          openApiSpec: {
            openapi: '3.0.0',
            info: {
              title: 'Generated API',
              version: '1.0.0',
              description: 'API generated from requirements'
            },
            paths: {
              '/users': {
                get: {
                  summary: 'Get all users',
                  responses: {
                    '200': {
                      description: 'List of users',
                      content: {
                        'application/json': {
                          schema: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            components: {
              schemas: {
                User: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          testCases: [
            {
              name: 'Create user',
              description: 'Test user creation with valid data',
              steps: ['Send POST request to /users', 'Verify response status 201', 'Verify user data in response']
            }
          ],
          recommendations: [
            'Consider adding user roles and permissions',
            'Implement email verification',
            'Add password reset functionality'
          ]
        }
      })
    })

    // API Connector demo endpoint (mock)
    app.get('/api/connectors', (req, res) => {
      res.json({
        success: true,
        data: {
          connectors: [
            {
              id: 'slack',
              name: 'Slack',
              type: 'messaging',
              status: 'available',
              description: 'Send messages and notifications to Slack channels'
            },
            {
              id: 'jira',
              name: 'Jira',
              type: 'project-management',
              status: 'available',
              description: 'Create and manage Jira issues and projects'
            },
            {
              id: 'github',
              name: 'GitHub',
              type: 'version-control',
              status: 'available',
              description: 'Manage repositories, issues, and pull requests'
            }
          ]
        }
      })
    })

    // Code Generation demo endpoint (mock)
    app.post('/api/codegen/generate', (req, res) => {
      const { entities, framework, type } = req.body
      
      res.json({
        success: true,
        data: {
          code: `// Generated ${type} code for ${framework}
// Based on entities: ${entities?.map((e: any) => e.name).join(', ') || 'User'}

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock ${type} code generation
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
          framework,
          type,
          entities: entities || [{ name: 'User' }]
        }
      })
    })

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Error:', err)
      res.status(500).json({
        error: 'Internal server error',
        message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
      })
    })

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not found',
        message: `Route ${req.originalUrl} not found`
      })
    })

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`🚀 DevSync Backend running on port ${config.port}`)
      logger.info(`📊 Health check: http://localhost:${config.port}/health`)
      logger.info(`🔗 API status: http://localhost:${config.port}/api/status`)
      logger.info(`🎯 Demo endpoint: http://localhost:${config.port}/api/demo`)
      logger.info(`🌐 Frontend URL: ${config.frontendUrl}`)
      
      if (!config.openaiApiKey || !config.anthropicApiKey) {
        logger.warn('⚠️  AI features disabled - add OPENAI_API_KEY and ANTHROPIC_API_KEY to enable')
      }
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully')
      server.close(() => {
        logger.info('Server closed')
        process.exit(0)
      })
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully')
      server.close(() => {
        logger.info('Server closed')
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
