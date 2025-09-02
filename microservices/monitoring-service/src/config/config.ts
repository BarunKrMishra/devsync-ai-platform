import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3008', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Monitoring configuration
  monitoring: {
    checkInterval: parseInt(process.env.CHECK_INTERVAL || '30000', 10), // 30 seconds
    alertThreshold: parseInt(process.env.ALERT_THRESHOLD || '80', 10), // 80%
    services: [
      'api-gateway',
      'auth-service',
      'ai-translator-service',
      'api-connector-service',
      'codegen-service',
      'project-service',
      'notification-service',
      'storage-service'
    ]
  },
  
  // Telemetry
  telemetryEnabled: process.env.TELEMETRY_ENABLED === 'true',
  jaegerAgentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
  jaegerAgentPort: parseInt(process.env.JAEGER_AGENT_PORT || '6832', 10),
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9472', 10)
};
