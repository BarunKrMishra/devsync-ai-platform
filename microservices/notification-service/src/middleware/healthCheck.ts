import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Notification Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'notification-service',
    version: '1.0.0'
  });
};
