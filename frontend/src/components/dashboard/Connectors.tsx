'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Connector {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'payment' | 'storage' | 'analytics' | 'productivity';
  status: 'active' | 'inactive' | 'configured';
  apiCalls: number;
  lastUsed: string;
  icon: string;
}

export default function Connectors() {
  const [connectors] = useState<Connector[]>([
    {
      id: '1',
      name: 'Slack',
      description: 'Send messages and notifications to Slack channels',
      category: 'communication',
      status: 'configured',
      apiCalls: 1250,
      lastUsed: '2024-01-20',
      icon: '💬'
    },
    {
      id: '2',
      name: 'Stripe',
      description: 'Process payments and manage subscriptions',
      category: 'payment',
      status: 'configured',
      apiCalls: 890,
      lastUsed: '2024-01-20',
      icon: '💳'
    },
    {
      id: '3',
      name: 'AWS S3',
      description: 'Store and retrieve files from Amazon S3',
      category: 'storage',
      status: 'active',
      apiCalls: 2100,
      lastUsed: '2024-01-19',
      icon: '☁️'
    },
    {
      id: '4',
      name: 'Google Analytics',
      description: 'Track website analytics and user behavior',
      category: 'analytics',
      status: 'configured',
      apiCalls: 450,
      lastUsed: '2024-01-18',
      icon: '📊'
    },
    {
      id: '5',
      name: 'SendGrid',
      description: 'Send transactional and marketing emails',
      category: 'communication',
      status: 'active',
      apiCalls: 3200,
      lastUsed: '2024-01-20',
      icon: '📧'
    },
    {
      id: '6',
      name: 'GitHub',
      description: 'Manage repositories and pull requests',
      category: 'productivity',
      status: 'inactive',
      apiCalls: 0,
      lastUsed: 'Never',
      icon: '🐙'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All', count: connectors.length },
    { id: 'communication', name: 'Communication', count: connectors.filter(c => c.category === 'communication').length },
    { id: 'payment', name: 'Payment', count: connectors.filter(c => c.category === 'payment').length },
    { id: 'storage', name: 'Storage', count: connectors.filter(c => c.category === 'storage').length },
    { id: 'analytics', name: 'Analytics', count: connectors.filter(c => c.category === 'analytics').length },
    { id: 'productivity', name: 'Productivity', count: connectors.filter(c => c.category === 'productivity').length }
  ];

  const filteredConnectors = selectedCategory === 'all' 
    ? connectors 
    : connectors.filter(c => c.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'configured': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'communication': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'storage': return 'bg-purple-100 text-purple-800';
      case 'analytics': return 'bg-orange-100 text-orange-800';
      case 'productivity': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Connectors</h1>
          <p className="text-gray-600">Manage integrations with external services</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Browse Marketplace
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Add Connector
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={selectedCategory === category.id ? "bg-blue-600" : ""}
          >
            {category.name} ({category.count})
          </Button>
        ))}
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConnectors.map((connector) => (
          <Card key={connector.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{connector.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{connector.name}</CardTitle>
                    <CardDescription className="text-sm">{connector.description}</CardDescription>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(connector.status)}`}>
                  {connector.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(connector.category)}`}>
                    {connector.category}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Calls</span>
                  <span className="text-sm font-medium">{connector.apiCalls.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Used</span>
                  <span className="text-sm font-medium">{connector.lastUsed}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                {connector.status === 'inactive' ? (
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Configure
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="flex-1">
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Test
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>API calls and connector usage overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {connectors.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active Connectors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {connectors.reduce((sum, c) => sum + c.apiCalls, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total API Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {connectors.filter(c => c.status === 'configured').length}
              </div>
              <div className="text-sm text-gray-600">Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {categories.length - 1}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
