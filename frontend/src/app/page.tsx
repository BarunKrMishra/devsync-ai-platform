'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'checking';
  responseTime?: number;
  port: number;
}

export default function Home() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'API Gateway', url: '/api/health', status: 'checking', port: 3000 },
    { name: 'Auth Service', url: '/api/auth/health', status: 'checking', port: 3001 },
    { name: 'AI Translator', url: '/api/ai-translator/health', status: 'checking', port: 3002 },
    { name: 'API Connector', url: '/api/connector/health', status: 'checking', port: 3003 },
    { name: 'Code Generation', url: '/api/codegen/health', status: 'checking', port: 3004 },
    { name: 'Project Service', url: '/api/projects/health', status: 'checking', port: 3005 },
    { name: 'Notification Service', url: '/api/notifications/health', status: 'checking', port: 3006 },
    { name: 'Storage Service', url: '/api/storage/health', status: 'checking', port: 3007 },
    { name: 'Monitoring Service', url: '/api/monitoring/health', status: 'checking', port: 3008 },
  ]);

  const [overallStatus, setOverallStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const testService = async (service: ServiceStatus) => {
    const startTime = Date.now();
    try {
      const response = await fetch(service.url);
      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      if (data.status === 'healthy') {
        setServices(prev => prev.map(s => 
          s.name === service.name 
            ? { ...s, status: 'healthy' as const, responseTime }
            : s
        ));
        return true;
      } else {
        setServices(prev => prev.map(s => 
          s.name === service.name 
            ? { ...s, status: 'unhealthy' as const, responseTime }
            : s
        ));
        return false;
      }
    } catch (error) {
      setServices(prev => prev.map(s => 
        s.name === service.name 
          ? { ...s, status: 'unhealthy' as const, responseTime: Date.now() - startTime }
          : s
      ));
      return false;
    }
  };

  const testAllServices = async () => {
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' as const })));
    setOverallStatus('checking');
    
    const results = await Promise.all(services.map(service => testService(service)));
    
    // Check overall status
    const healthyCount = results.filter(result => result).length;
    setOverallStatus(healthyCount === services.length ? 'healthy' : 'unhealthy');
    setLastChecked(new Date());
  };

  useEffect(() => {
    testAllServices();
    // Auto-refresh every 30 seconds
    const interval = setInterval(testAllServices, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200';
      case 'unhealthy': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'unhealthy': return '❌';
      default: return '⏳';
    }
  };

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const totalCount = services.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 DevSync AI Platform
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Microservices Architecture - Development Server
          </p>
          
          <div className="inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold mb-6 bg-white shadow-md">
            <span className="mr-2">
              {overallStatus === 'healthy' ? '🟢' : overallStatus === 'unhealthy' ? '🔴' : '🟡'}
            </span>
            Overall Status: {overallStatus.toUpperCase()}
            <span className="ml-4 text-sm text-gray-500">
              ({healthyCount}/{totalCount} services healthy)
            </span>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              onClick={testAllServices}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 Refresh All Services
            </Button>
            {lastChecked && (
              <div className="text-sm text-gray-500 flex items-center">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)} {service.status}
                  </span>
                </div>
                <CardDescription>
                  Port: {service.port} • {service.url}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {service.responseTime && (
                  <p className="text-sm text-gray-600 mb-4">
                    Response Time: <span className="font-mono">{service.responseTime}ms</span>
                  </p>
                )}
                
                <Button
                  onClick={() => testService(service)}
                  variant="outline"
                  className="w-full"
                  disabled={service.status === 'checking'}
                >
                  {service.status === 'checking' ? 'Testing...' : 'Test Service'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">🔗 Quick Links</CardTitle>
            <CardDescription>
              Access monitoring and observability tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="http://localhost:3010"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors block"
              >
                📊 Grafana Dashboard
              </a>
              <a
                href="http://localhost:9090"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors block"
              >
                📈 Prometheus Metrics
              </a>
              <a
                href="http://localhost:16686"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors block"
              >
                🔍 Jaeger Tracing
              </a>
            </div>
          </CardContent>
        </Card>

        {/* API Testing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🧪 API Testing</CardTitle>
            <CardDescription>
              Test the API endpoints directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => window.open('/api/health', '_blank')}
                  variant="outline"
                  className="justify-start"
                >
                  GET /api/health
                </Button>
                <Button
                  onClick={() => window.open('/api/projects', '_blank')}
                  variant="outline"
                  className="justify-start"
                >
                  GET /api/projects
                </Button>
                <Button
                  onClick={() => window.open('/api/auth/health', '_blank')}
                  variant="outline"
                  className="justify-start"
                >
                  GET /api/auth/health
                </Button>
                <Button
                  onClick={() => window.open('/api/ai-translator/health', '_blank')}
                  variant="outline"
                  className="justify-start"
                >
                  GET /api/ai-translator/health
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
