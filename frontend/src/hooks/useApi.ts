// Custom hooks for API integration
import { useState, useEffect } from 'react';
import { apiClient, ApiResponse } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
    success: false,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await apiCall();
        
        if (isMounted) {
          setState({
            data: response.data || null,
            loading: false,
            error: response.error || null,
            success: response.success,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
}

export function useMutation<T, P = any>(
  apiCall: (...params: any[]) => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const mutate = async (...params: any[]) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall(...params);
      
      setState({
        data: response.data || null,
        loading: false,
        error: response.error || null,
        success: response.success,
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return { ...state, mutate };
}
