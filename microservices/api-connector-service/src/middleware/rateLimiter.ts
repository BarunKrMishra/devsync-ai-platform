import rateLimit from 'express-rate-limit';
import { config } from '../config/config';

export const apiConnectorRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimitPerMinute,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests from this IP, please try again later.',
        statusCode: 429
      }
    });
  }
});
