import { Router, Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { logger } from '../config/logger';

const router = Router();
const projectService = new ProjectService();

// Get all projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects();
    return res.json({
      success: true,
      data: projects
    });
  } catch (error: any) {
    logger.error('Failed to get projects', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get project by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    return res.json({
      success: true,
      data: project
    });
  } catch (error: any) {
    logger.error('Failed to get project', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new project
router.post('/', async (req: Request, res: Response) => {
  try {
    const project = await projectService.createProject(req.body);
    return res.status(201).json({
      success: true,
      data: project
    });
  } catch (error: any) {
    logger.error('Failed to create project', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await projectService.updateProject(id, req.body);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    return res.json({
      success: true,
      data: project
    });
  } catch (error: any) {
    logger.error('Failed to update project', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await projectService.deleteProject(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error: any) {
    logger.error('Failed to delete project', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;