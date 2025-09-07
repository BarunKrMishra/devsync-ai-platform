'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { ConfirmModal } from '@/components/ui/modal';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { LoadingCard } from '@/components/ui/loading';
import { useApi, useMutation } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'in-progress' | 'completed';
  createdAt: string;
  lastModified: string;
  requirements: number;
  apis: number;
  connectors: number;
}

export default function Projects() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const { showToast } = useToast();

  // Fetch projects from API
  const { data: projects, loading, error, success } = useApi(() => apiClient.getProjects(), []);

  // Create project mutation
  const createProjectMutation = useMutation(apiClient.createProject);
  const updateProjectMutation = useMutation(apiClient.updateProject);
  const deleteProjectMutation = useMutation(apiClient.deleteProject);

  const handleCreateProject = async (projectData: any) => {
    const response = await createProjectMutation.mutate(projectData);
    if (response.success) {
      setShowCreateModal(false);
      // Refresh projects list
      window.location.reload(); // Simple refresh for now
    }
  };

  const handleUpdateProject = async (projectData: any) => {
    if (!editingProject) return;
    
    const response = await updateProjectMutation.mutate(editingProject.id, projectData);
    if (response.success) {
      setEditingProject(null);
      // Refresh projects list
      window.location.reload(); // Simple refresh for now
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;
    
    const response = await deleteProjectMutation.mutate(deletingProject.id);
    if (response.success) {
      setDeletingProject(null);
      // Refresh projects list
      window.location.reload(); // Simple refresh for now
    }
  };

  // Mock data for development (remove when API is ready)
  const mockProjects: Project[] = (Array.isArray(projects) ? projects : []) || [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with payment integration',
      status: 'in-progress',
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      requirements: 12,
      apis: 8,
      connectors: 5
    },
    {
      id: '2',
      name: 'CRM System',
      description: 'Customer relationship management with Slack notifications',
      status: 'completed',
      createdAt: '2024-01-10',
      lastModified: '2024-01-18',
      requirements: 15,
      apis: 12,
      connectors: 3
    },
    {
      id: '3',
      name: 'Analytics Dashboard',
      description: 'Real-time analytics with data visualization',
      status: 'draft',
      createdAt: '2024-01-22',
      lastModified: '2024-01-22',
      requirements: 6,
      apis: 4,
      connectors: 2
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage your development projects and track progress</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <LoadingCard key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage your development projects and track progress</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-2">Failed to load projects</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your development projects and track progress</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setShowCreateModal(true)}
        >
          + New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-all duration-300 transform hover:scale-105 group">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="mt-1">{project.description}</CardDescription>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Requirements</span>
                  <span className="font-medium">{project.requirements}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>APIs</span>
                  <span className="font-medium">{project.apis}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Connectors</span>
                  <span className="font-medium">{project.connectors}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Last Modified</span>
                  <span className="font-medium">{project.lastModified}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 hover:bg-green-50 hover:border-green-300 transition-colors"
                  onClick={() => setEditingProject(project)}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                  onClick={() => setDeletingProject(project)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="lg"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateModal(false)}
          loading={createProjectMutation.loading}
        />
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        size="lg"
      >
        {editingProject && (
          <ProjectForm
            initialData={editingProject}
            onSubmit={handleUpdateProject}
            onCancel={() => setEditingProject(null)}
            loading={updateProjectMutation.loading}
            title="Update Project"
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
