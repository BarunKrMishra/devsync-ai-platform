import { Router, Request, Response } from 'express';
import { ApiConnectorService, ConnectorRequest } from '../services/apiConnectorService';
import logger from '../config/logger';

const router = Router();
const apiConnectorService = new ApiConnectorService();

// Test connection to a service
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { service, auth } = req.body;
    
    if (!service) {
      return res.status(400).json({
        success: false,
        error: 'Service name is required'
      });
    }

    const isConnected = await apiConnectorService.testConnection(service, auth);
    
    res.json({
      success: true,
      data: {
        service,
        connected: isConnected,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Test connection failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Make API request through connector
router.post('/request', async (req: Request, res: Response) => {
  try {
    const connectorRequest: ConnectorRequest = req.body;
    
    // Validate required fields
    if (!connectorRequest.service || !connectorRequest.endpoint || !connectorRequest.method) {
      return res.status(400).json({
        success: false,
        error: 'Service, endpoint, and method are required'
      });
    }

    const response = await apiConnectorService.makeRequest(connectorRequest);
    
    // Return the response with appropriate status code
    res.status(response.statusCode).json(response);
  } catch (error: any) {
    logger.error('API request failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get supported services
router.get('/services', (req: Request, res: Response) => {
  try {
    const services = apiConnectorService.getSupportedServices();
    
    res.json({
      success: true,
      data: {
        services,
        count: services.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get supported services', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get service information
router.get('/services/:service', (req: Request, res: Response) => {
  try {
    const { service } = req.params;
    const serviceInfo = apiConnectorService.getServiceInfo(service);
    
    if (!serviceInfo) {
      return res.status(404).json({
        success: false,
        error: `Service '${service}' not found`
      });
    }
    
    res.json({
      success: true,
      data: {
        service,
        info: serviceInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get service info', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch requests
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { requests }: { requests: ConnectorRequest[] } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Requests array is required and must not be empty'
      });
    }

    if (requests.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 requests allowed per batch'
      });
    }

    const responses = await Promise.allSettled(
      requests.map(request => apiConnectorService.makeRequest(request))
    );

    const results = responses.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));

    res.json({
      success: true,
      data: {
        results,
        total: requests.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Batch request failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
