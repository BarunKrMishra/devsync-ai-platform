import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API Connector Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'api-connector-service',
    version: '1.0.0'
  });
};
