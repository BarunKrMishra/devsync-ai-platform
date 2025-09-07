// AI Translator component for converting requirements to technical specs
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingButton } from '@/components/ui/loading';
import { useMutation } from '@/hooks/useApi';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/toast';

interface TranslationResult {
  type: 'erd' | 'api' | 'code' | 'tests';
  content: string;
  metadata?: any;
}

export default function AITranslator() {
  const [requirements, setRequirements] = useState('');
  const [selectedType, setSelectedType] = useState<'erd' | 'api' | 'code' | 'tests'>('erd');
  const [results, setResults] = useState<TranslationResult[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const { showToast } = useToast();

  const translateMutation = useMutation(apiClient.translateRequirements);

  const handleTranslate = async () => {
    if (!requirements.trim()) {
      showToast('Please enter your requirements', 'warning');
      return;
    }

    setIsTranslating(true);
    try {
      const response = await translateMutation.mutate({
        requirements: requirements.trim(),
        type: selectedType
      });

      if (response.success && response.data) {
        setResults(prev => [...prev, {
          type: selectedType,
          content: response.data.content || response.data,
          metadata: response.data.metadata
        }]);
        showToast('Translation completed successfully!', 'success');
      } else {
        showToast(response.error || 'Translation failed', 'error');
      }
    } catch (error) {
      showToast('Translation failed. Please try again.', 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setRequirements('');
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard!', 'success');
  };

  const downloadResult = (content: string, type: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-${type}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('File downloaded!', 'success');
  };

  const translationTypes = [
    { id: 'erd', name: 'ERD', description: 'Entity Relationship Diagram', icon: '🗂️' },
    { id: 'api', name: 'API Spec', description: 'OpenAPI Specification', icon: '🔌' },
    { id: 'code', name: 'Code', description: 'Boilerplate Code', icon: '💻' },
    { id: 'tests', name: 'Tests', description: 'Test Cases', icon: '🧪' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Translator</h1>
          <p className="text-gray-600">Convert natural language requirements into technical specifications</p>
        </div>
        {results.length > 0 && (
          <Button variant="outline" onClick={clearResults}>
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Requirements Input
            </CardTitle>
            <CardDescription>
              Describe your project requirements in natural language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Translation Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {translationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id as any)}
                    className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="font-medium text-sm">{type.name}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Example: I need a user management system with authentication, user profiles, and role-based access control. Users should be able to register, login, update their profiles, and admins should be able to manage user roles..."
              />
              <p className="mt-1 text-sm text-gray-500">
                {requirements.length}/500 characters
              </p>
            </div>

            <LoadingButton
              loading={isTranslating}
              onClick={handleTranslate}
              disabled={!requirements.trim() || isTranslating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {isTranslating ? 'Translating...' : '🚀 Translate Requirements'}
            </LoadingButton>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-4">
          {results.length === 0 ? (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-lg font-medium mb-2">No translations yet</h3>
                <p className="text-sm">Enter your requirements and click translate to see results</p>
              </div>
            </Card>
          ) : (
            results.map((result, index) => (
              <Card key={index} className="group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {translationTypes.find(t => t.id === result.type)?.icon}
                      </span>
                      <CardTitle className="text-lg">
                        {translationTypes.find(t => t.id === result.type)?.name}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(result.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        📋 Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadResult(result.content, result.type)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        💾 Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                      {result.content}
                    </pre>
                  </div>
                  {result.metadata && (
                    <div className="mt-3 text-xs text-gray-500">
                      Generated at: {new Date().toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Example Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            Example Requirements
          </CardTitle>
          <CardDescription>
            Try these example requirements to see how the AI translator works
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'E-commerce Platform',
                requirements: 'I need an e-commerce platform with user authentication, product catalog, shopping cart, payment processing, order management, and admin dashboard. Users should be able to browse products, add to cart, checkout with Stripe, and track orders.',
                type: 'erd'
              },
              {
                title: 'CRM System',
                requirements: 'Create a customer relationship management system with contact management, lead tracking, sales pipeline, email integration, task management, and reporting dashboard. It should integrate with Slack for notifications.',
                type: 'api'
              },
              {
                title: 'Blog Platform',
                requirements: 'Build a blog platform with user authentication, post creation and editing, comment system, tag management, search functionality, and admin panel. Support for markdown formatting and image uploads.',
                type: 'code'
              }
            ].map((example, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => {
                  setRequirements(example.requirements);
                  setSelectedType(example.type as any);
                }}
              >
                <h4 className="font-medium text-gray-900 mb-2">{example.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{example.requirements}</p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Click to use this example →
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
