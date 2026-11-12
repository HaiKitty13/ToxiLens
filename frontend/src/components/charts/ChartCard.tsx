
import type { ReactNode } from 'react';

import { Card } from '@/components/ui/Card';
import { PlaceholderBadge } from '@/components/ui/Badge';

export interface ChartDatum {
  name: string;
  value: number | null;
  total?: number;
  percentage?: number;
}

/** Colors for chart series — all theme tokens, so charts follow light/dark mode. */
export const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--destructive))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--accent-foreground))',
  'hsl(var(--muted-foreground))',
];

export const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  color: 'hsl(var(--foreground))',
  fontSize: 12,
  boxShadow: 'none',
} as const;

/** True only when every datum has a real numeric value. */
export function hasAllValues(
  data: ChartDatum[],
): data is Array<ChartDatum & { value: number }> {
  return (
    data.length > 0 &&
    data.every(
      (item) =>
        item.value !== null &&
        Number.isFinite(item.value),
    )
  );
}

interface ChartCardProps {
  title: string;
  description?: string;
  placeholder: boolean;
  children: ReactNode;
}

export function ChartCard({
  title,
  description,
  placeholder,
  children,
}: ChartCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold">{title}</h3>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {placeholder && (
          <PlaceholderBadge>Awaiting data</PlaceholderBadge>
        )}
      </div>

      {children}
    </Card>
  );
}

/** Neutral empty visual shown when the API has no chart data. */
export function ChartPlaceholder({
  labels,
}: {
  labels: string[];
}) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed bg-muted/40 p-4 text-center">
      <div
        className="flex w-full max-w-xs items-end justify-center gap-2"
        aria-hidden
      >
        {labels.map((label) => (
          <div
            key={label}
            className="h-10 flex-1 rounded-md bg-muted"
          />
        ))}
      </div>

      <p className="max-w-xs text-sm text-muted-foreground">
        No chart data is currently available from the dataset API.
      </p>
    </div>
  );
}
