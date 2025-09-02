import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Monitoring Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'monitoring-service',
    version: '1.0.0'
  });
};
