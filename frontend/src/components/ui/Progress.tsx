import { cn } from '@/lib/utils';

type ProgressTone = 'primary' | 'danger' | 'success' | 'muted';

const tones: Record<ProgressTone, string> = {
  primary: 'bg-primary',
  danger: 'bg-destructive',
  success: 'bg-success',
  muted: 'bg-muted-foreground/40',
};

interface ProgressProps {
  /** 0..1 */
  value: number;
  tone?: ProgressTone;
  className?: string;
  label?: string;
}

export function Progress({ value, tone = 'primary', className, label }: ProgressProps) {
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <div
        className={cn('h-full origin-left animate-bar-grow rounded-full', tones[tone])}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  );
}
