import { useState } from 'react';
import { AlertTriangle, ChevronDown, Loader2, RotateCcw, ScanSearch, ShieldAlert, ShieldCheck } from 'lucide-react';
import { MODES } from '@/config/modes';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Progress } from '@/components/ui/Progress';
import { cn, formatPercent } from '@/lib/utils';
import type { ApiError } from '@/services/api';
import type { ModelFamily, PredictionMode, PredictionResult, RequestStatus } from '@/types/api';
import { CATEGORY_HIGHLIGHT_THRESHOLD } from '@/config/api';

interface ResultPanelProps {
  status: RequestStatus;
  result: PredictionResult | null;
  error: ApiError | null;
  mode: PredictionMode | null;
  family: ModelFamily | null;
  onRetry: () => void;
  onNewPrediction: () => void;
}

export function ResultPanel({ status, result, error, mode, family, onRetry, onNewPrediction }: ResultPanelProps) {
  return (
    <Card className="w-full max-w-none min-w-0 h-full min-h-[360px] overflow-hidden" aria-live="polite">
      {status === 'idle' && <EmptyState />}
      {status === 'loading' && <LoadingState />}
      {status === 'error' && error && <ErrorState error={error} onRetry={onRetry} />}
      {status === 'success' && result && <SuccessState result={result} mode={mode} family={family} onNewPrediction={onNewPrediction} />}
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <ScanSearch className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="text-lg font-bold">No prediction yet</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        Enter an Indonesian sentence and run the model. The classification and toxicity categories will appear here.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 p-8 text-center" role="status">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm font-medium">Analyzing text…</p>
      <div className="w-full max-w-xs space-y-3" aria-hidden>
        <div className="h-3 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
        <div className="h-3 w-3/5 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: ApiError; onRetry: () => void }) {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="text-lg font-bold">
        {error.kind === 'network' || error.kind === 'timeout' ? 'Connection problem' : 'Prediction failed'}
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground" role="alert">
        {error.friendlyMessage}
      </p>
      <Button variant="outline" onClick={onRetry} className="mt-2">
        <RotateCcw className="h-4 w-4" aria-hidden />
        Try again
      </Button>
    </div>
  );
}

function SuccessState({
  result,
  mode,
  family,
  onNewPrediction,
}: {
  result: PredictionResult;
  mode: PredictionMode | null;
  family: ModelFamily | null;
  onNewPrediction: () => void;
}) {
  const [showRaw, setShowRaw] = useState(false);
  const toxic = result.label === 'toxic';
  const Icon = toxic ? ShieldAlert : ShieldCheck;
  const hasCategories = result.categories.length > 0;

  return (
    <div className="animate-fade-up">
      {/* Verdict */}
        <div className="border-b px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {family ? `${family.toUpperCase()} · ` : ''}
              </h3>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Stage 1 · Classification
              </p>
            </div>

            {mode && (
              <Badge tone="outline">
                {MODES[mode].shortLabel}
              </Badge>
            )}
          </div>
        </div>

        {/* Verdict */}
        <div className={cn(
          'p-6',
          toxic ? 'bg-destructive/5' : 'bg-success/5'
        )}>
        <div className="flex items-center gap-4">
          <span
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
              toxic ? 'bg-destructive text-destructive-foreground' : 'bg-success text-success-foreground',
            )}
          >
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className={cn('font-display text-3xl font-extrabold', toxic ? 'text-destructive' : 'text-success')}>
              {toxic ? 'Toxic' : 'Non-Toxic'}
            </p>
            {result.rawLabel.toLowerCase().replace(/[_\s]/g, '-') !== result.label && (
              <p className="truncate text-xs text-muted-foreground">API label: {result.rawLabel}</p>
            )}
          </div>
        </div>

        {result.confidence !== null && (
          <div className="mt-5 space-y-2">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium">Confidence</span>
              <span className="font-display text-lg font-bold">{formatPercent(result.confidence)}</span>
            </div>
            <Progress value={result.confidence} tone={toxic ? 'danger' : 'success'} label="Confidence" />
            {result.stage1Probabilities.length > 0 && (
              <dl className="grid grid-cols-2 gap-2 pt-2 text-xs">
                {result.stage1Probabilities.map((p) => (
                  <div key={p.key} className="rounded-lg bg-card/60 px-3 py-2">
                    <dt className="text-muted-foreground">{p.label}</dt>
                    <dd className="font-medium tabular-nums">{formatPercent(p.score)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        )}
      </div>

      {/* Stage 2 */}
      <div className="space-y-4 p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stage 2 · Toxicity categories</span>

        {!hasCategories && (
          <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            {toxic
              ? 'The API did not return category scores for this text.'
              : 'No category analysis was returned. Stage 2 applies to texts classified as toxic.'}
          </p>
        )}

        {hasCategories && !toxic && (
          <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            This text was classified as Non-Toxic. Stage 2 is designed for toxic texts, so the scores below are shown for reference only.
          </p>
        )}

        {hasCategories && (
          <ul className={cn('space-y-4', !toxic && 'opacity-70')}>
            {result.categories.map((category) => {
              const detected = toxic && category.score >= CATEGORY_HIGHLIGHT_THRESHOLD;
              return (
                <li key={category.key} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      {category.label}
                      {detected && <Badge tone="danger">Detected</Badge>}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{formatPercent(category.score)}</span>
                  </div>
                  <Progress value={category.score} tone={detected ? 'danger' : 'muted'} label={category.label} />
                </li>
              );
            })}
          </ul>
        )}

        <p className="text-xs text-muted-foreground">
          Categories scoring at or above {formatPercent(CATEGORY_HIGHLIGHT_THRESHOLD, 0)} are marked as detected.
        </p>
      </div>

      {/* Footer actions */}
      <div className="border-t px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowRaw((v) => !v)}
            aria-expanded={showRaw}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', showRaw && 'rotate-180')} aria-hidden />
            Raw API response
          </button>
          <Button variant="secondary" size="sm" onClick={onNewPrediction}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            New prediction
          </Button>
        </div>
        {showRaw && <CodeBlock className="mt-3 animate-fade-in" code={JSON.stringify(result.raw, null, 2)} title="response.json" />}
      </div>
    </div>
  );
}
