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
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'DevSync Auth Service',
    version: '1.0.0',
    status: 'running'
  });
});

// Auth endpoints
app.post('/register', (req, res) => {
  res.json({
    message: 'User registration endpoint',
    status: 'ready',
    note: 'Implementation pending'
  });
});

app.post('/login', (req, res) => {
  res.json({
    message: 'User login endpoint',
    status: 'ready',
    note: 'Implementation pending'
  });
});

// Start server
app.listen(config.port, () => {
  logger.info(`Auth Service running on port ${config.port}`);
  console.log(`🔐 Auth Service started on port ${config.port}`);
});

export default app;
