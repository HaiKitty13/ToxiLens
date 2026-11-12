
import { useEffect, useState } from 'react';

import {
  getDatasetVisualizations,
  type DatasetVisualizationData,
} from '@/services/dataset';

interface UseDatasetVisualizationsResult {
  data: DatasetVisualizationData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDatasetVisualizations(): UseDatasetVisualizationsResult {
  const [data, setData] =
    useState<DatasetVisualizationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const result = await getDatasetVisualizations(
          controller.signal,
        );

        setData(result);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === 'AbortError'
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dataset visualizations.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => controller.abort();
  }, [requestKey]);

  const refetch = () => {
    setRequestKey((current) => current + 1);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
