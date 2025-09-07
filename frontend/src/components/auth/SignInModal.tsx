'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { LoadingButton } from '@/components/ui/loading';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSignInSuccess: (user: any) => void;
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp, onSignInSuccess }: SignInModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await signIn(formData.email, formData.password);

      if (success) {
        showToast('Signed in successfully!', 'success');
        onSignInSuccess({ email: formData.email }); // Pass user data
        onClose();
        
        // Reset form
        setFormData({ email: '', password: '' });
      } else {
        showToast('Sign in failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign In">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Don't have an account? Sign up
          </button>
          <button
            type="button"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Forgot password?
          </button>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
