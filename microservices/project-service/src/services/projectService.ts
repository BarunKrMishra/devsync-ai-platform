import { logger } from '../config/logger';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  teamMembers?: string[];
  settings?: Record<string, any>;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  ownerId: string;
  teamMembers?: string[];
  settings?: Record<string, any>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
  teamMembers?: string[];
  settings?: Record<string, any>;
}

export class ProjectService {
  private projects: Map<string, Project> = new Map();

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleProject: Project = {
      id: '1',
      name: 'Sample Project',
      description: 'A sample project for testing',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: 'user1',
      teamMembers: ['user1', 'user2'],
      settings: {
        notifications: true,
        autoSave: true
      }
    };
    this.projects.set(sampleProject.id, sampleProject);
  }

  async getAllProjects(): Promise<Project[]> {
    try {
      logger.info('Getting all projects');
      return Array.from(this.projects.values());
    } catch (error: any) {
      logger.error('Failed to get all projects', { error: error.message });
      throw error;
    }
  }

  async getProjectById(id: string): Promise<Project | null> {
    try {
      logger.info('Getting project by ID', { projectId: id });
      const project = this.projects.get(id);
      return project || null;
    } catch (error: any) {
      logger.error('Failed to get project by ID', { projectId: id, error: error.message });
      throw error;
    }
  }

  async createProject(request: CreateProjectRequest): Promise<Project> {
    try {
      logger.info('Creating new project', { name: request.name });
      
      const project: Project = {
        id: this.generateId(),
        name: request.name,
        description: request.description,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: request.ownerId,
        teamMembers: request.teamMembers || [],
        settings: request.settings || {}
      };

      this.projects.set(project.id, project);
      
      logger.info('Project created successfully', { projectId: project.id });
      return project;
    } catch (error: any) {
      logger.error('Failed to create project', { error: error.message });
      throw error;
    }
  }

  async updateProject(id: string, request: UpdateProjectRequest): Promise<Project | null> {
    try {
      logger.info('Updating project', { projectId: id });
      
      const existingProject = this.projects.get(id);
      if (!existingProject) {
        return null;
      }

      const updatedProject: Project = {
        ...existingProject,
        ...request,
        updatedAt: new Date()
      };

      this.projects.set(id, updatedProject);
      
      logger.info('Project updated successfully', { projectId: id });
      return updatedProject;
    } catch (error: any) {
      logger.error('Failed to update project', { projectId: id, error: error.message });
      throw error;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      logger.info('Deleting project', { projectId: id });
      
      const project = this.projects.get(id);
      if (!project) {
        return false;
      }

      this.projects.delete(id);
      
      logger.info('Project deleted successfully', { projectId: id });
      return true;
    } catch (error: any) {
      logger.error('Failed to delete project', { projectId: id, error: error.message });
      throw error;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
