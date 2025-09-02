import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Storage Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'storage-service',
    version: '1.0.0'
  });
};
