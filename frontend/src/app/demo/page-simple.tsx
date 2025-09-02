'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, CheckCircle, Code, Database, Zap } from 'lucide-react';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'requirements',
      title: 'Requirements',
      description: 'Input your business requirements',
      icon: Code,
      content: 'Create a user management system with authentication and profile management.'
    },
    {
      id: 'erd',
      title: 'ERD Generation',
      description: 'Generate entity relationship diagram',
      icon: Database,
      content: 'User entity with id, email, password, role, created_at fields.'
    },
    {
      id: 'api',
      title: 'OpenAPI Spec',
      description: 'Generate OpenAPI specification',
      icon: Code,
      content: 'Generated OpenAPI 3.0 specification with /api/users endpoints.'
    },
    {
      id: 'codegen',
      title: 'Code Generation',
      description: 'Generate boilerplate code',
      icon: Zap,
      content: 'Generated Node.js/Express backend with Prisma ORM setup.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DevSync Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Experience the power of AI-driven development
          </p>
          <Button 
            size="lg" 
            onClick={() => setCurrentStep((prev) => (prev + 1) % steps.length)}
            className="group"
          >
            <Play className="mr-2 h-5 w-5" />
            Next Step
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, index) => (
            <Card 
              key={step.id}
              className={`p-6 cursor-pointer transition-all ${
                index === currentStep 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  index <= currentStep 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <step.icon className="h-6 w-6" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {step.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep].description}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {steps[currentStep].content}
            </pre>
          </div>

          <div className="mt-6 text-center">
            <Badge variant="secondary">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
