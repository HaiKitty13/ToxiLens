import {
  API_BASE_URL,
  CATEGORY_HIGHLIGHT_THRESHOLD,
  ENDPOINTS,
  REQUEST_TIMEOUT_MS,
  RESPONSE_FIELDS,
  type EndpointKey,
} from '@/config/api';
import { getFieldsForMode } from '@/config/metadata';
import { humanize } from '@/lib/utils';
import type {
  ApiErrorKind,
  CategoryScore,
  MetadataValues,
  PredictionMode,
  PredictionRequest,
  PredictionResult,
  ToxicityLabel,
  ValidationErrorBody,
} from '@/types/api';

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }

  /** Message that is safe and friendly to show directly to end users. */
  get friendlyMessage(): string {
    switch (this.kind) {
      case 'network':
        return 'Could not connect to the ToxiLens API. Make sure the backend is running and VITE_API_BASE_URL is correct.';
      case 'timeout':
        return 'The API took too long to respond. Please try again in a moment.';
      case 'validation':
        return `The API rejected the request: ${this.message}`;
      case 'parse':
        return 'The API responded, but the response format was not what the frontend expected.';
      case 'http':
      default:
        return this.status && this.status >= 500
          ? 'The API reported an internal error. Please try again later.'
          : `The API returned an error${this.status ? ` (HTTP ${this.status})` : ''}.`;
    }
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError('network', error instanceof Error ? error.message : 'Unknown error');
}

/* -------------------------------------------------------------------------- */
/* Low-level request helper                                                   */
/* -------------------------------------------------------------------------- */

interface RequestOptions {
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(endpoint: EndpointKey, { body, signal }: RequestOptions = {}): Promise<T> {
  const { method, path } = ENDPOINTS[endpoint];
  const controller = new AbortController();
  let timedOut = false;
  const timer = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  signal?.addEventListener('abort', () => controller.abort());

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (timedOut) throw new ApiError('timeout', 'Request timed out');
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError('network', err instanceof Error ? err.message : 'Network error');
  } finally {
    window.clearTimeout(timer);
  }

  if (!response.ok) {
    const parsed = await response.json().catch(() => null);
    if (response.status === 422) {
      throw new ApiError('validation', describeValidationError(parsed as ValidationErrorBody | null), 422);
    }
    throw new ApiError('http', `HTTP ${response.status}`, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError('parse', 'Response was not valid JSON', response.status);
  }
}

function describeValidationError(body: ValidationErrorBody | null): string {
  if (!body || !body.detail) return 'Validation failed.';
  if (typeof body.detail === 'string') return body.detail;
  return body.detail
    .map((d) => `${d.loc.filter((p) => p !== 'body').join('.') || 'request'}: ${d.msg}`)
    .join('; ');
}

/* -------------------------------------------------------------------------- */
/* Request building / response normalization                                  */
/* -------------------------------------------------------------------------- */

/** Build the request body for a mode. Only the metadata keys relevant to the mode are sent. */
export function buildPredictionRequest(mode: PredictionMode, text: string, metadata: MetadataValues): PredictionRequest {
  if (mode === 'text-only') return { text };
  const picked: MetadataValues = {};
  for (const field of getFieldsForMode(mode)) {
    picked[field.key] = metadata[field.key] ?? '';
  }
  return { text, metadata: picked };
}

function normalizeLabel(value: unknown): ToxicityLabel | null {
  if (typeof value === 'boolean') return value ? 'toxic' : 'non-toxic';
  if (typeof value === 'number') return value >= 1 ? 'toxic' : 'non-toxic';
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (['non-toxic', 'nontoxic', 'not-toxic', 'non', '0', 'false'].includes(v)) return 'non-toxic';
  if (['toxic', '1', 'true'].includes(v)) return 'toxic';
  return null;
}

function toUnitInterval(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  const unit = value > 1 && value <= 100 ? value / 100 : value;
  return Math.min(1, Math.max(0, unit));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function toScores(value: unknown, detectedKeys: Set<string> | null): CategoryScore[] {
  const record = asRecord(value);
  if (!record) return [];
  const scores: CategoryScore[] = [];
  for (const [key, v] of Object.entries(record)) {
    const score = toUnitInterval(v);
    if (score === null) continue;
    scores.push({
      key,
      label: humanize(key),
      score,
      detected: detectedKeys ? detectedKeys.has(key) : score >= CATEGORY_HIGHLIGHT_THRESHOLD,
    });
  }
  return scores.sort((a, b) => b.score - a.score);
}

const STAGE1_LABELS: Record<string, string> = { toxic: 'Toxic', non_toxic: 'Non-Toxic' };

export function normalizePrediction(raw: unknown): PredictionResult {
  const F = RESPONSE_FIELDS;
  const body = asRecord(raw);
  if (!body) throw new ApiError('parse', 'Response body is not an object');

  const stage1 = asRecord(body[F.stage1]);
  if (!stage1) throw new ApiError('parse', `Response is missing "${F.stage1}"`);

  const rawPrediction = stage1[F.prediction];
  const label = normalizeLabel(rawPrediction);
  if (!label) {
    throw new ApiError('parse', `Unrecognized prediction value: ${JSON.stringify(rawPrediction)}`);
  }

  // Stage 2 is null when the text is classified as non-toxic.
  const stage2 = asRecord(body[F.stage2]);
  const predicted = stage2?.[F.stage2Predictions];
  const detectedKeys = Array.isArray(predicted) ? new Set(predicted.map(String)) : null;

  return {
    label,
    rawLabel: String(rawPrediction),
    confidence: toUnitInterval(stage1[F.confidence]),
    stage1Probabilities: toScores(stage1[F.probabilities], null).map((p) => ({
      ...p,
      label: STAGE1_LABELS[p.key] ?? p.label,
    })),
    stage2Available: stage2 !== null,
    categories: toScores(stage2?.[F.probabilities], detectedKeys),
    raw,
  };
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export async function predict(
  mode: PredictionMode,
  text: string,
  metadata: MetadataValues,
  signal?: AbortSignal,
): Promise<PredictionResult> {
  const raw = await request<unknown>(mode, { body: buildPredictionRequest(mode, text, metadata), signal });
  return normalizePrediction(raw);
}

export async function checkHealth(signal?: AbortSignal): Promise<void> {
  await request<unknown>('health', { signal });
}
