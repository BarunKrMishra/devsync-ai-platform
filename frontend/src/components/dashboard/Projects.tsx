'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [projects] = useState<Project[]>([
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
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your development projects and track progress</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          + New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
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
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
