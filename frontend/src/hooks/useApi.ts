import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { addNotification } from '@/store/slices/uiSlice';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  successMessage?: string;
}

export const useApi = <T = any>(options?: UseApiOptions) => {
  const dispatch = useAppDispatch();
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
      
      // Show success notification if enabled
      if (options?.showSuccessNotification) {
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: options.successMessage || 'Operation completed successfully',
          duration: 5000,
        }));
      }
      
      options?.onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      
      // Show error notification if enabled
      if (options?.showErrorNotification !== false) {
        dispatch(addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
          duration: 7000,
        }));
      }
      
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [options, dispatch]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

// Specific API hooks with Redux integration
export const usePolicies = () => {
  return useApi({
    onSuccess: (data) => console.log('Policies loaded:', data.policies?.length),
    showSuccessNotification: false, // Don't show notification for data loading
  });
};

export const useClaims = () => {
  return useApi({
    onSuccess: (data) => console.log('Claims loaded:', data.claims?.length),
    showSuccessNotification: false,
  });
};

export const usePayments = () => {
  return useApi({
    onSuccess: (data) => console.log('Payments loaded:', data.payments?.length),
    showSuccessNotification: false,
  });
};

// Generic CRUD operations with Redux notifications
export const useApiCrud = <T = any>(endpoint: string, resourceName: string = 'Item') => {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<T[]>([]);
  const { execute, loading, error } = useApi<{ data: T[] }>({
    showErrorNotification: true,
  });

  const fetchAll = useCallback(() => {
    return execute(() => api.get(endpoint)).then(result => {
      setItems(result.data || result);
      return result;
    });
  }, [execute, endpoint]);

  const create = useCallback((data: Partial<T>) => {
    return execute(() => api.post(endpoint, data)).then(result => {
      dispatch(addNotification({
        type: 'success',
        title: 'Created',
        message: `${resourceName} created successfully`,
        duration: 5000,
      }));
      return result;
    });
  }, [execute, endpoint, resourceName, dispatch]);

  const update = useCallback((id: string, data: Partial<T>) => {
    return execute(() => api.put(`${endpoint}/${id}`, data)).then(result => {
      dispatch(addNotification({
        type: 'success',
        title: 'Updated',
        message: `${resourceName} updated successfully`,
        duration: 5000,
      }));
      return result;
    });
  }, [execute, endpoint, resourceName, dispatch]);

  const remove = useCallback((id: string) => {
    return execute(() => api.delete(`${endpoint}/${id}`)).then(result => {
      dispatch(addNotification({
        type: 'success',
        title: 'Deleted',
        message: `${resourceName} deleted successfully`,
        duration: 5000,
      }));
      return result;
    });
  }, [execute, endpoint, resourceName, dispatch]);

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