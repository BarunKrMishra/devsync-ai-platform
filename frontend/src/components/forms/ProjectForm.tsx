'use client';

// Project creation and editing form
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading';
import { useToast } from '@/components/ui/toast';

interface ProjectFormData {
  name: string;
  description: string;
  requirements: string;
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  title?: string;
}

export function ProjectForm({ 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  loading = false,
  title = 'Create Project'
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    requirements: initialData.requirements || '',
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});
  const { showToast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Requirements are required';
    } else if (formData.requirements.length < 20) {
      newErrors.requirements = 'Requirements must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Please fix the errors below', 'error');
      return;
    }

    try {
      await onSubmit(formData);
      showToast('Project saved successfully!', 'success');
    } catch (error) {
      showToast('Failed to save project. Please try again.', 'error');
    }
  };

  const handleChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Enter project name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe your project"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
          Requirements *
        </label>
        <textarea
          id="requirements"
          value={formData.requirements}
          onChange={(e) => handleChange('requirements', e.target.value)}
          rows={6}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.requirements ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe your project requirements in natural language..."
        />
        <p className="mt-1 text-sm text-gray-500">
          {formData.requirements.length}/20 characters minimum
        </p>
        {errors.requirements && (
          <p className="mt-1 text-sm text-red-600">{errors.requirements}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={loading}
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {title}
        </LoadingButton>
      </div>
    </form>
  );
}
