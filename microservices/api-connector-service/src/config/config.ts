import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3003', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Connector specific config
  maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
  timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '100', 10),
  
  // Supported services
  supportedServices: {
    slack: {
      baseUrl: 'https://slack.com/api',
      authType: 'bearer'
    },
    jira: {
      baseUrl: 'https://your-domain.atlassian.net/rest/api/3',
      authType: 'basic'
    },
    github: {
      baseUrl: 'https://api.github.com',
      authType: 'bearer'
    },
    google: {
      baseUrl: 'https://www.googleapis.com',
      authType: 'oauth2'
    },
    stripe: {
      baseUrl: 'https://api.stripe.com/v1',
      authType: 'bearer'
    },
    twilio: {
      baseUrl: 'https://api.twilio.com/2010-04-01',
      authType: 'basic'
    },
    sendgrid: {
      baseUrl: 'https://api.sendgrid.com/v3',
      authType: 'bearer'
    },
    aws: {
      baseUrl: 'https://api.aws.amazon.com',
      authType: 'aws4'
    }
  },
  
  // Telemetry
  telemetryEnabled: process.env.TELEMETRY_ENABLED === 'true',
  jaegerAgentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
  jaegerAgentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6832', 10),
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9467', 10)
};
