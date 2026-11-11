import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Eraser, Sparkles, Wand2 } from 'lucide-react';
import { MAX_TEXT_LENGTH } from '@/config/api';
import { getFieldsForMode } from '@/config/metadata';
import { EXAMPLE_TEXTS, type ModelCategory } from '@/config/modes';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { usePrediction } from '@/hooks/usePrediction';
import { cn } from '@/lib/utils';
import { hasErrors, validatePrediction } from '@/lib/validation';
import type { MetadataValues, PredictionMode, ModelFamily } from '@/types/api';
import { MetadataFields } from './MetadataFields';
import { ModelSelector } from './ModelSelector';
import { ResultPanel } from './ResultPanel';

export function PredictionWorkbench() {
  const [category, setCategory] = useState<ModelCategory>('text-only');
  const [metadataVariant, setMetadataVariant] = useState<PredictionMode>('metadata-full');
  const [text, setText] = useState('');
  const [metadata, setMetadata] = useState<MetadataValues>({});
  const [submitted, setSubmitted] = useState(false);
  const exampleIndex = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const indobertweet = usePrediction('indobertweet');
  const nusabert = usePrediction('nusabert');

  // const { status, result, error, mode: resultMode, submit, reset } = usePrediction();

  const mode: PredictionMode = category === 'text-only' ? 'text-only' : metadataVariant;
  const fields = useMemo(() => getFieldsForMode(mode), [mode]);
  const errors = useMemo(() => validatePrediction(mode, text, metadata), [mode, text, metadata]);
  const loading = status === 'loading';
  const overLimit = text.length > MAX_TEXT_LENGTH;
  const showTextError = (submitted || overLimit) && errors.text;
  const visibleMetadataErrors = submitted ? errors.metadata : {};

  const run = async () => {
    setSubmitted(true);

    if (hasErrors(errors)) {
      if (errors.text) textareaRef.current?.focus();
      return;
    }

    await Promise.all([
      indobertweet.submit(mode, text.trim(), metadata),
      nusabert.submit(mode, text.trim(), metadata),
    ]);
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    run();
  };

  const handleExample = () => {
    setText(EXAMPLE_TEXTS[exampleIndex.current % EXAMPLE_TEXTS.length]);
    exampleIndex.current += 1;
    textareaRef.current?.focus();
  };

  const handleClear = () => {
    setText('');
    setSubmitted(false);
    textareaRef.current?.focus();
  };

  const handleNewPrediction = () => {
    indobertweet.reset();
    nusabert.reset();
    setText('');
    setSubmitted(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="grid gap-6 lg:items-start">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <ModelSelector
            category={category}
            onCategoryChange={setCategory}
            metadataVariant={metadataVariant}
            onVariantChange={setMetadataVariant}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="input-text" className="text-sm font-semibold">
                Text to analyze
              </label>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleExample} disabled={loading}>
                  <Wand2 className="h-3.5 w-3.5" aria-hidden />
                  Example
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear} disabled={loading || text.length === 0}>
                  <Eraser className="h-3.5 w-3.5" aria-hidden />
                  Clear
                </Button>
              </div>
            </div>
            <textarea
              id="input-text"
              ref={textareaRef}
              value={text}
              rows={5}
              disabled={loading}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis kalimat atau tweet berbahasa Indonesia di sini…"
              aria-invalid={Boolean(showTextError)}
              aria-describedby="input-text-help"
              className={cn(
                'w-full resize-y rounded-xl border bg-card px-4 py-3 text-sm leading-6 transition-colors',
                'placeholder:text-muted-foreground/70 hover:border-foreground/30 disabled:opacity-60',
                showTextError ? 'border-destructive' : 'border-input',
              )}
            />
            <div id="input-text-help" className="flex items-start justify-between gap-3 text-xs">
              <p className={cn('font-medium', showTextError ? 'text-destructive' : 'text-transparent')} role={showTextError ? 'alert' : undefined}>
                {showTextError || ' '}
              </p>
              <p className={cn('shrink-0 tabular-nums', overLimit ? 'font-medium text-destructive' : 'text-muted-foreground')}>
                {text.length} / {MAX_TEXT_LENGTH}
              </p>
            </div>
          </div>

          {fields.length > 0 && (
            <MetadataFields
              key={mode}
              fields={fields}
              values={metadata}
              errors={visibleMetadataErrors}
              disabled={loading}
              onChange={(key, value) => setMetadata((prev) => ({ ...prev, [key]: value }))}
            />
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading} disabled={loading}>
            {!loading && <Sparkles className="h-4 w-4" aria-hidden />}
            {loading ? 'Analyzing…' : 'Predict toxicity'}
          </Button>
        </form>
      </Card>

      <div className="col-span-full w-full min-w-0 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="w-full min-w-0">
          <ResultPanel
            status={indobertweet.status}
            result={indobertweet.result}
            error={indobertweet.error}
            mode={indobertweet.mode}
            family="indobertweet"
            onRetry={() => indobertweet.submit(mode, text.trim(), metadata)}
            onNewPrediction={handleNewPrediction}
          />
        </div>

        <div className="w-full min-w-0">
          <ResultPanel
            status={nusabert.status}
            result={nusabert.result}
            error={nusabert.error}
            mode={nusabert.mode}
            family="nusabert"
            onRetry={() => nusabert.submit(mode, text.trim(), metadata)}
            onNewPrediction={handleNewPrediction}
          />
        </div>
      </div>
    </div>
  );
}
