import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'mysql://user:password@localhost:3306/devsync_db',
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // External APIs
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  
  // API Connector specific
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100', 10),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  supportedServices: [
    'slack', 'jira', 'github', 'google', 'stripe', 'twilio', 'sendgrid', 'aws'
  ],
  
  // Monitoring
  telemetryEnabled: process.env.TELEMETRY_ENABLED === 'true',
  jaegerAgentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
  jaegerAgentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6832', 10),
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9469', 10)
};