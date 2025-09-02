import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3006', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Email configuration
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  
  // Slack configuration
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    botToken: process.env.SLACK_BOT_TOKEN || ''
  },
  
  // Telemetry
  telemetryEnabled: process.env.TELEMETRY_ENABLED === 'true',
  jaegerAgentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
  jaegerAgentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6832', 10),
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9470', 10)
};
