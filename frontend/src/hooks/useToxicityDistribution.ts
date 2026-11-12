import { useCallback, useEffect, useState } from 'react';

import {
  getToxicityDistribution,
  type ToxicityEDAResponse,
} from '@/services/eda';

export function useToxicityDistribution() {
  const [data, setData] = useState<ToxicityEDAResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await getToxicityDistribution(
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
            : 'Failed to load toxicity distribution.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [reloadKey]);

  return { data, loading, error, refetch };
}