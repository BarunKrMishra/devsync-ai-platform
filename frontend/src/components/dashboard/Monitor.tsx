'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Metric {
  name: string;
  value: number;
  change: number;
  unit: string;
  status: 'up' | 'down' | 'stable';
}

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

export default function Monitor() {
  const [metrics] = useState<Metric[]>([
    {
      name: 'API Calls',
      value: 125000,
      change: 12.5,
      unit: 'calls',
      status: 'up'
    },
    {
      name: 'Response Time',
      value: 245,
      change: -8.2,
      unit: 'ms',
      status: 'up'
    },
    {
      name: 'Error Rate',
      value: 0.8,
      change: -15.3,
      unit: '%',
      status: 'up'
    },
    {
      name: 'Active Users',
      value: 1250,
      change: 5.7,
      unit: 'users',
      status: 'up'
    }
  ]);

  const [services] = useState<ServiceHealth[]>([
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 45,
      lastCheck: '2024-01-20 14:30:00'
    },
    {
      name: 'Auth Service',
      status: 'healthy',
      uptime: 99.8,
      responseTime: 32,
      lastCheck: '2024-01-20 14:30:00'
    },
    {
      name: 'AI Translator',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 1200,
      lastCheck: '2024-01-20 14:30:00'
    },
    {
      name: 'API Connector',
      status: 'healthy',
      uptime: 99.7,
      responseTime: 78,
      lastCheck: '2024-01-20 14:30:00'
    },
    {
      name: 'Code Generation',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 156,
      lastCheck: '2024-01-20 14:30:00'
    },
    {
      name: 'Project Service',
      status: 'unhealthy',
      uptime: 95.2,
      responseTime: 0,
      lastCheck: '2024-01-20 14:25:00'
    }
  ]);

  const [timeRange, setTimeRange] = useState('24h');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeColor = (status: string) => {
    switch (status) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = (status: string) => {
    switch (status) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
      default: return '→';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time monitoring and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{metric.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-1">{metric.unit}</span>
                </div>
                <div className={`text-sm font-medium ${getChangeColor(metric.status)}`}>
                  {getChangeIcon(metric.status)} {Math.abs(metric.change)}%
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>Real-time status of all microservices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600">Last check: {service.lastCheck}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{service.uptime}%</div>
                    <div className="text-xs text-gray-500">Uptime</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {service.responseTime > 0 ? `${service.responseTime}ms` : 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">Response Time</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Response Times</CardTitle>
            <CardDescription>Average response time over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-gray-500">Chart visualization would go here</p>
                <p className="text-sm text-gray-400">Integration with Chart.js or similar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Error Rate Trends</CardTitle>
            <CardDescription>Error rate percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-500">Chart visualization would go here</p>
                <p className="text-sm text-gray-400">Integration with Chart.js or similar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>System alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Project Service Unhealthy</p>
                <p className="text-xs text-red-700">Service has been down for 5 minutes</p>
              </div>
              <span className="text-xs text-red-600">2 min ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">AI Translator High Response Time</p>
                <p className="text-xs text-yellow-700">Average response time exceeded 1000ms</p>
              </div>
              <span className="text-xs text-yellow-600">15 min ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">System Recovery</p>
                <p className="text-xs text-green-700">All services are now healthy</p>
              </div>
              <span className="text-xs text-green-600">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
