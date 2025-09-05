'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'active' | 'draft' | 'deprecated';
  parameters: number;
  responses: number;
  lastModified: string;
}

export default function APIs() {
  const [endpoints] = useState<APIEndpoint[]>([
    {
      id: '1',
      method: 'GET',
      path: '/api/users',
      description: 'Get all users',
      status: 'active',
      parameters: 3,
      responses: 2,
      lastModified: '2024-01-20'
    },
    {
      id: '2',
      method: 'POST',
      path: '/api/users',
      description: 'Create a new user',
      status: 'active',
      parameters: 5,
      responses: 3,
      lastModified: '2024-01-20'
    },
    {
      id: '3',
      method: 'GET',
      path: '/api/users/{id}',
      description: 'Get user by ID',
      status: 'active',
      parameters: 1,
      responses: 2,
      lastModified: '2024-01-19'
    },
    {
      id: '4',
      method: 'PUT',
      path: '/api/users/{id}',
      description: 'Update user by ID',
      status: 'draft',
      parameters: 4,
      responses: 2,
      lastModified: '2024-01-22'
    },
    {
      id: '5',
      method: 'DELETE',
      path: '/api/users/{id}',
      description: 'Delete user by ID',
      status: 'active',
      parameters: 1,
      responses: 1,
      lastModified: '2024-01-18'
    }
  ]);

  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'PATCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Endpoints</h1>
          <p className="text-gray-600">Manage your API specifications and documentation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Import OpenAPI
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            + New Endpoint
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Click on an endpoint to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEndpoint === endpoint.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedEndpoint(endpoint.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                        {endpoint.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{endpoint.parameters} parameters</span>
                      <span>{endpoint.responses} responses</span>
                      <span>Modified {endpoint.lastModified}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Endpoint Details */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Details</CardTitle>
              <CardDescription>
                {selectedEndpoint ? 'Selected endpoint' : 'Select an endpoint to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEndpoint ? (
                <div className="space-y-4">
                  {(() => {
                    const endpoint = endpoints.find(e => e.id === selectedEndpoint);
                    if (!endpoint) return null;
                    
                    return (
                      <>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                              {endpoint.method}
                            </span>
                            <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                          </div>
                          <p className="text-sm text-gray-600">{endpoint.description}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Status</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(endpoint.status)}`}>
                            {endpoint.status}
                          </span>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Parameters</h5>
                          <p className="text-sm text-gray-600">{endpoint.parameters} parameters defined</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Responses</h5>
                          <p className="text-sm text-gray-600">{endpoint.responses} response types defined</p>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Last Modified</h5>
                          <p className="text-sm text-gray-600">{endpoint.lastModified}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Test
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Click on an endpoint to view its details
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
