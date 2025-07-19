import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = <T = any>(options?: UseApiOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      const result = response.data;
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

// Specific API hooks
export const usePolicies = () => {
  return useApi({
    onSuccess: (data) => console.log('Policies loaded:', data.policies?.length)
  });
};

export const useClaims = () => {
  return useApi({
    onSuccess: (data) => console.log('Claims loaded:', data.claims?.length)
  });
};

export const usePayments = () => {
  return useApi({
    onSuccess: (data) => console.log('Payments loaded:', data.payments?.length)
  });
};

// Generic CRUD operations
export const useApiCrud = <T = any>(endpoint: string) => {
  const [items, setItems] = useState<T[]>([]);
  const { execute, loading, error } = useApi<{ data: T[] }>();

  const fetchAll = useCallback(() => {
    return execute(() => api.get(endpoint)).then(result => {
      setItems(result.data || result);
      return result;
    });
  }, [execute, endpoint]);

  const create = useCallback((data: Partial<T>) => {
    return execute(() => api.post(endpoint, data));
  }, [execute, endpoint]);

  const update = useCallback((id: string, data: Partial<T>) => {
    return execute(() => api.put(`${endpoint}/${id}`, data));
  }, [execute, endpoint]);

  const remove = useCallback((id: string) => {
    return execute(() => api.delete(`${endpoint}/${id}`));
  }, [execute, endpoint]);

  return {
    items,
    loading,
    error,
    fetchAll,
    create,
    update,
    remove
  };
};