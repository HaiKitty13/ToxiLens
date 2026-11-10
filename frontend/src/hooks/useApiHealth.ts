import { useCallback, useEffect, useState } from 'react';
import { checkHealth, toApiError } from '@/services/api';
import type { HealthState } from '@/types/api';

/** Pings the health-check endpoint on mount and on demand. */
export function useApiHealth() {
  const [health, setHealth] = useState<HealthState>({ status: 'checking' });

  const recheck = useCallback(async () => {
    setHealth({ status: 'checking' });
    try {
      await checkHealth();
      setHealth({ status: 'online' });
    } catch (err) {
      setHealth({ status: 'offline', detail: toApiError(err).friendlyMessage });
    }
  }, []);

  useEffect(() => {
    void recheck();
  }, [recheck]);

  return { health, recheck };
}
