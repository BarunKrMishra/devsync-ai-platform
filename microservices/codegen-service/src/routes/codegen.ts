import { Router, Request, Response } from 'express';
import { CodeGenerationService, CodeGenerationRequest } from '../services/codegenService';
import logger from '../config/logger';

const router = Router();
const codegenService = new CodeGenerationService();

// Generate code
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const request: CodeGenerationRequest = req.body;
    
    // Validate required fields
    if (!request.framework || !request.template || !request.name) {
      return res.status(400).json({
        success: false,
        error: 'Framework, template, and name are required'
      });
    }

    const response = await codegenService.generateCode(request);
    
    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.json(response);
  } catch (error: any) {
    logger.error('Code generation failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate and download code as archive
router.post('/download', async (req: Request, res: Response) => {
  try {
    const { request, format = 'zip' }: { request: CodeGenerationRequest; format: string } = req.body;
    
    // Validate required fields
    if (!request.framework || !request.template || !request.name) {
      return res.status(400).json({
        success: false,
        error: 'Framework, template, and name are required'
      });
    }

    const archiveBuffer = await codegenService.generateAndDownload(request, format);
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${request.name}-${request.template}.zip"`);
    return res.send(archiveBuffer);
  } catch (error: any) {
    logger.error('Code download failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get supported frameworks
router.get('/frameworks', (req: Request, res: Response) => {
  try {
    const frameworks = codegenService.getSupportedFrameworks();
    
    return res.json({
      success: true,
      data: {
        frameworks,
        count: frameworks.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get supported frameworks', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get framework information
router.get('/frameworks/:framework', (req: Request, res: Response) => {
  try {
    const { framework } = req.params;
    const frameworkInfo = codegenService.getFrameworkInfo(framework);
    
    if (!frameworkInfo) {
      return res.status(404).json({
        success: false,
        error: `Framework '${framework}' not found`
      });
    }
    
    return res.json({
      success: true,
      data: {
        framework,
        info: frameworkInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get framework info', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get supported templates for a framework
router.get('/frameworks/:framework/templates', (req: Request, res: Response) => {
  try {
    const { framework } = req.params;
    const templates = codegenService.getSupportedTemplates(framework);
    
    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No templates found for framework '${framework}'`
      });
    }
    
    return res.json({
      success: true,
      data: {
        framework,
        templates,
        count: templates.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    logger.error('Failed to get templates', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch code generation
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { requests }: { requests: CodeGenerationRequest[] } = req.body;
    
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
      requests.map(request => codegenService.generateCode(request))
    );

    const results = responses.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    }));

    return res.json({
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
    logger.error('Batch code generation failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
