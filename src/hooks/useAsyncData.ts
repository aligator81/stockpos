import { useState, useEffect } from 'react';

interface UseAsyncDataResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  retry: () => void;
}

export default function useAsyncData<T>(
  key: string,
  timeout = 30000
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timed out'));
        }, timeout);
      });

      // Create the data loading promise
      const dataPromise = new Promise<T>((resolve) => {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          resolve(JSON.parse(storedData));
        } else {
          reject(new Error(`No data found for key: ${key}`));
        }
      });

      // Race between timeout and data loading
      const result = await Promise.race([dataPromise, timeoutPromise]);
      setData(result as T);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [key, retryCount]);

  const retry = () => {
    setRetryCount(count => count + 1);
  };

  return { data, error, isLoading, retry };
}