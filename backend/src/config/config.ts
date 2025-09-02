import dotenv from 'dotenv'

dotenv.config()

export const config = {
  // Server Configuration
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',

  // Database Configuration
  database: {
    postgres: {
      url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/devsync',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    neo4j: {
      uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
      username: process.env.NEO4J_USERNAME || 'neo4j',
      password: process.env.NEO4J_PASSWORD || 'password'
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/devsync'
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  },

  // Authentication Configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  },

  // OAuth Providers
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || ''
    }
  },

  // External Services
  services: {
    slack: {
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || ''
    },
    jira: {
      clientId: process.env.JIRA_CLIENT_ID || '',
      clientSecret: process.env.JIRA_CLIENT_SECRET || ''
    }
  },

  // AI Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4-turbo-preview'
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-sonnet-20240229'
    }
  },

  // File Storage
  storage: {
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'devsync-storage'
    }
  },

  // Email Configuration
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Monitoring & Observability
  telemetry: {
    enabled: process.env.TELEMETRY_ENABLED === 'true',
    jaeger: {
      endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
    },
    prometheus: {
      port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10)
    }
  },

  // Queue Configuration
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || ''
    },
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10)
  },

  // Security
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-long',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  },

  // Feature Flags
  features: {
    aiTranslator: process.env.FEATURE_AI_TRANSLATOR !== 'false',
    apiConnector: process.env.FEATURE_API_CONNECTOR !== 'false',
    realTimeUpdates: process.env.FEATURE_REAL_TIME_UPDATES !== 'false',
    webhooks: process.env.FEATURE_WEBHOOKS !== 'false'
  }
}

// Validation
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET'
]

if (config.nodeEnv === 'production') {
  requiredEnvVars.push(
    'DATABASE_URL',
    'NEO4J_URI',
    'MONGODB_URI',
    'REDIS_URL'
  )
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars)
  process.exit(1)
}
