import { useState, useEffect, useRef } from 'react';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  dependencies: unknown[] = [],
  options: UseFetchOptions = {}
): UseFetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const {
    revalidateOnFocus = false,
    revalidateOnReconnect = false,
    refreshInterval,
  } = options;

  const fetchData = async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState({ data: null, loading: false, error: error.message });
      }
    }
  };

  const refetch = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Set up focus/reconnect revalidation
  useEffect(() => {
    const handleFocus = () => {
      if (revalidateOnFocus) {
        fetchData();
      }
    };

    const handleOnline = () => {
      if (revalidateOnReconnect) {
        fetchData();
      }
    };

    if (revalidateOnFocus) {
      window.addEventListener('focus', handleFocus);
    }

    if (revalidateOnReconnect) {
      window.addEventListener('online', handleOnline);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [revalidateOnFocus, revalidateOnReconnect]);

  return { ...state, refetch };
} 