import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'danger' | 'warning' | 'outline';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  primary: 'bg-accent text-accent-foreground',
  success: 'bg-success/10 text-success',
  danger: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/15 text-warning',
  outline: 'border border-border text-muted-foreground',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5',
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** Marks content that has not been provided yet. */
export function PlaceholderBadge({ children = 'Placeholder' }: { children?: string }) {
  return (
    <Badge tone="warning" className="border border-dashed border-warning/50">
      {children}
    </Badge>
  );
}
