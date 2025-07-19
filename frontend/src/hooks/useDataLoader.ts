import { useState, useEffect, useCallback } from 'react';

interface UseDataLoaderOptions<T> {
  initialData?: T;
  loadOnMount?: boolean;
  dependencies?: any[];
}

interface UseDataLoaderReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: (data: T | null) => void;
  reset: () => void;
}

/**
 * Reusable data loading hook that eliminates duplicate loading patterns
 */
export function useDataLoader<T>(
  loadFunction: () => Promise<T>,
  options: UseDataLoaderOptions<T> = {}
): UseDataLoaderReturn<T> {
  const { 
    initialData = null, 
    loadOnMount = true, 
    dependencies = [] 
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadFunction();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [loadFunction]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  // Load data on mount or when dependencies change
  useEffect(() => {
    if (loadOnMount) {
      loadData();
    }
  }, [loadData, loadOnMount, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: loadData,
    setData,
    reset
  };
}

/**
 * Hook for loading paginated data
 */
export function usePaginatedDataLoader<T>(
  loadFunction: (page: number, limit: number) => Promise<{ data: T[]; total: number }>,
  initialLimit: number = 10
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [allData, setAllData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);

  const { data, loading, error, refetch } = useDataLoader(
    async () => {
      const result = await loadFunction(currentPage, limit);
      return result;
    },
    { dependencies: [currentPage, limit] }
  );

  useEffect(() => {
    if (data) {
      if (currentPage === 1) {
        setAllData(data.data);
      } else {
        setAllData(prev => [...prev, ...data.data]);
      }
      setTotal(data.total);
    }
  }, [data, currentPage]);

  const loadMore = useCallback(() => {
    if (!loading && allData.length < total) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loading, allData.length, total]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    setAllData([]);
    refetch();
  }, [refetch]);

  return {
    data: allData,
    loading,
    error,
    total,
    currentPage,
    hasMore: allData.length < total,
    loadMore,
    refresh,
    setLimit
  };
}

/**
 * Hook for loading data with search and filters
 */
export function useFilteredDataLoader<T, F = Record<string, any>>(
  loadFunction: (filters: F) => Promise<T[]>,
  initialFilters: F
) {
  const [filters, setFilters] = useState<F>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, loading, error, refetch } = useDataLoader(
    async () => {
      const filterWithSearch = {
        ...filters,
        ...(searchTerm && { search: searchTerm })
      } as F;
      return await loadFunction(filterWithSearch);
    },
    { dependencies: [filters, searchTerm] }
  );

  const updateFilter = useCallback((key: keyof F, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<F>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
  }, [initialFilters]);

  return {
    data: data || [],
    loading,
    error,
    filters,
    searchTerm,
    setSearchTerm,
    updateFilter,
    updateFilters,
    resetFilters,
    refetch
  };
}

/**
 * Hook for CRUD operations with optimistic updates
 */
export function useCrudLoader<T extends { id: string | number }>(
  loadFunction: () => Promise<T[]>,
  createFunction?: (item: Omit<T, 'id'>) => Promise<T>,
  updateFunction?: (id: string | number, item: Partial<T>) => Promise<T>,
  deleteFunction?: (id: string | number) => Promise<void>
) {
  const { data, loading, error, refetch, setData } = useDataLoader(loadFunction);

  const createItem = useCallback(async (newItem: Omit<T, 'id'>) => {
    if (!createFunction) throw new Error('Create function not provided');
    
    try {
      const created = await createFunction(newItem);
      setData(prev => prev ? [...prev, created] : [created]);
      return created;
    } catch (err) {
      throw err;
    }
  }, [createFunction, setData]);

  const updateItem = useCallback(async (id: string | number, updates: Partial<T>) => {
    if (!updateFunction) throw new Error('Update function not provided');
    
    // Optimistic update
    setData(prev => 
      prev ? prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ) : null
    );

    try {
      const updated = await updateFunction(id, updates);
      setData(prev => 
        prev ? prev.map(item => 
          item.id === id ? updated : item
        ) : null
      );
      return updated;
    } catch (err) {
      // Revert on error
      refetch();
      throw err;
    }
  }, [updateFunction, setData, refetch]);

  const deleteItem = useCallback(async (id: string | number) => {
    if (!deleteFunction) throw new Error('Delete function not provided');
    
    // Optimistic delete
    const originalData = data;
    setData(prev => prev ? prev.filter(item => item.id !== id) : null);

    try {
      await deleteFunction(id);
    } catch (err) {
      // Revert on error
      setData(originalData);
      throw err;
    }
  }, [deleteFunction, setData, data]);

  return {
    data: data || [],
    loading,
    error,
    refetch,
    createItem,
    updateItem,
    deleteItem
  };
}

/**
 * Hook for loading dependent data (data that depends on other data)
 */
export function useDependentDataLoader<T, D>(
  loadFunction: (dependency: D) => Promise<T>,
  dependency: D | null,
  options: UseDataLoaderOptions<T> = {}
) {
  const { data, loading, error, refetch, setData, reset } = useDataLoader(
    async () => {
      if (!dependency) throw new Error('Dependency not available');
      return await loadFunction(dependency);
    },
    { 
      ...options, 
      loadOnMount: false,
      dependencies: [dependency]
    }
  );

  useEffect(() => {
    if (dependency) {
      refetch();
    } else {
      reset();
    }
  }, [dependency, refetch, reset]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
    reset,
    hasDependency: !!dependency
  };
}