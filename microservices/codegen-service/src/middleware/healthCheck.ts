import { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Code Generation Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'codegen-service',
    version: '1.0.0'
  });
};
