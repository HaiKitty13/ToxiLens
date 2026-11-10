import { RefreshCw } from 'lucide-react';
import { useApiHealth } from '@/hooks/useApiHealth';
import { cn } from '@/lib/utils';

const dot = {
  checking: 'bg-warning animate-pulse',
  online: 'bg-success',
  offline: 'bg-destructive',
} as const;

const text = {
  checking: 'Checking API…',
  online: 'API online',
  offline: 'API unreachable',
} as const;

/** Small pill showing whether the backend responds to the health-check endpoint. */
export function ApiStatus() {
  const { health, recheck } = useApiHealth();
  return (
    <button
      type="button"
      onClick={() => void recheck()}
      title={health.detail ?? 'Click to re-check the API connection'}
      className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className={cn('h-2 w-2 rounded-full', dot[health.status])} aria-hidden />
      <span role="status">{text[health.status]}</span>
      <RefreshCw className={cn('h-3 w-3', health.status === 'checking' && 'animate-spin')} aria-hidden />
    </button>
  );
}
