import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
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
  max: 50 // limit each IP to 50 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-connector-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'DevSync API Connector Service',
    version: '1.0.0',
    status: 'running'
  });
});

// API Connector endpoints
app.post('/connect', (req, res) => {
  res.json({
    message: 'API connection endpoint',
    status: 'ready',
    note: 'Implementation pending'
  });
});

// Start server
app.listen(config.port, () => {
  logger.info(`API Connector Service running on port ${config.port}`);
  console.log(`🔌 API Connector Service started on port ${config.port}`);
});

export default app;