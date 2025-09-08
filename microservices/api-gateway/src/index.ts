import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from './config/config';
import { logger } from './config/logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint for debugging
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'API Gateway is working!',
    timestamp: new Date().toISOString(),
    services: {
      auth: AUTH_SERVICE_URL,
      aiTranslator: AI_TRANSLATOR_SERVICE_URL,
      apiConnector: API_CONNECTOR_SERVICE_URL,
      codegen: CODEGEN_SERVICE_URL,
      project: PROJECT_SERVICE_URL,
      notification: NOTIFICATION_SERVICE_URL,
      storage: STORAGE_SERVICE_URL,
      monitoring: MONITORING_SERVICE_URL
    }
  });
});

// Service URLs from environment variables
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const AI_TRANSLATOR_SERVICE_URL = process.env.AI_TRANSLATOR_SERVICE_URL || 'http://ai-translator-service:3002';
const API_CONNECTOR_SERVICE_URL = process.env.API_CONNECTOR_SERVICE_URL || 'http://api-connector-service:3003';
const CODEGEN_SERVICE_URL = process.env.CODEGEN_SERVICE_URL || 'http://codegen-service:3004';
const PROJECT_SERVICE_URL = process.env.PROJECT_SERVICE_URL || 'http://project-service:3005';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3006';
const STORAGE_SERVICE_URL = process.env.STORAGE_SERVICE_URL || 'http://storage-service:3007';
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL || 'http://monitoring-service:3008';

// Proxy configuration
const proxyOptions = {
  target: '',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error for ${req.url}:`, err);
    res.status(500).json({
      success: false,
      error: 'Service temporarily unavailable'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Proxying ${req.method} ${req.url} to ${proxyReq.getHeader('host')}${proxyReq.path}`);
  }
};

// API Routes - Auth Service
app.use('/auth', createProxyMiddleware({
  ...proxyOptions,
  target: AUTH_SERVICE_URL,
}));

// API Routes - AI Translator Service
app.use('/translate', createProxyMiddleware({
  ...proxyOptions,
  target: AI_TRANSLATOR_SERVICE_URL,
}));

// API Routes - API Connector Service
app.use('/connectors', createProxyMiddleware({
  ...proxyOptions,
  target: API_CONNECTOR_SERVICE_URL,
}));

// API Routes - Codegen Service
app.use('/codegen', createProxyMiddleware({
  ...proxyOptions,
  target: CODEGEN_SERVICE_URL,
}));

// API Routes - Project Service
app.use('/projects', createProxyMiddleware({
  ...proxyOptions,
  target: PROJECT_SERVICE_URL,
}));

// API Routes - Notification Service
app.use('/notifications', createProxyMiddleware({
  ...proxyOptions,
  target: NOTIFICATION_SERVICE_URL,
}));

// API Routes - Storage Service
app.use('/storage', createProxyMiddleware({
  ...proxyOptions,
  target: STORAGE_SERVICE_URL,
}));

// API Routes - Monitoring Service
app.use('/monitoring', createProxyMiddleware({
  ...proxyOptions,
  target: MONITORING_SERVICE_URL,
}));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'DevSync API Gateway',
    version: '1.0.0',
    status: 'running',
    services: {
      auth: AUTH_SERVICE_URL,
      aiTranslator: AI_TRANSLATOR_SERVICE_URL,
      apiConnector: API_CONNECTOR_SERVICE_URL,
      codegen: CODEGEN_SERVICE_URL,
      project: PROJECT_SERVICE_URL,
      notification: NOTIFICATION_SERVICE_URL,
      storage: STORAGE_SERVICE_URL,
      monitoring: MONITORING_SERVICE_URL
    }
  });
});

// Start server
app.listen(config.port, () => {
  logger.info(`API Gateway running on port ${config.port}`);
  console.log(`🚀 API Gateway started on port ${config.port}`);
  console.log(`📡 Proxying auth requests to: ${AUTH_SERVICE_URL}`);
  console.log(`🌐 Health check available at: http://localhost:${config.port}/health`);
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
