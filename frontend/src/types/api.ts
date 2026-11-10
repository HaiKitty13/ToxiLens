/**
 * Request / response types for the ToxiLens FastAPI backend.
 *
 * NOTE: These mirror the *example* API contract and are expected to change.
 * Raw backend shapes live here; the UI only consumes `PredictionResult`,
 * which is produced by `normalizePrediction` in `src/services/api.ts`.
 */

/** The three prediction configurations exposed in the UI. */
export type PredictionMode = 'text-only' | 'metadata-full' | 'metadata-domicile';

/** Annotator metadata: field key -> selected value. Keys come from src/config/metadata.ts. */
export type MetadataValues = Record<string, string>;

export interface TextOnlyRequest {
  text: string;
}

export interface MetadataRequest {
  text: string;
  metadata: MetadataValues;
}

export type PredictionRequest = TextOnlyRequest | MetadataRequest;

/** FastAPI default validation error body (HTTP 422). */
export interface ValidationErrorBody {
  detail: Array<{ loc: Array<string | number>; msg: string; type: string }> | string;
}

export type ToxicityLabel = 'toxic' | 'non-toxic';

export interface CategoryScore {
  /** Raw key from the API, e.g. "identity_attack" */
  key: string;
  /** Display label, e.g. "Identity Attack" */
  label: string;
  /** Probability / score in the 0..1 range */
  score: number;
  detected: boolean;
}

export interface PredictionResult {
  label: ToxicityLabel;
  /** Label exactly as returned by the API */
  rawLabel: string;
  /** 0..1, or null if the API did not return one */
  confidence: number | null;
    /** Stage 1 class probabilities (toxic / non-toxic), sorted desc. */
  stage1Probabilities: CategoryScore[];
  /** False when the API returned `stage2: null` (non-toxic text). */
  stage2Available: boolean;
  /** Stage 2 category probabilities sorted desc. Empty if stage 2 was not run. */
  categories: CategoryScore[];
  /** The untouched response body, shown in the "raw response" viewer. */
  raw: unknown;
}

/** UI-facing prediction result (normalized). */
export interface PredictionResponseRaw {
  text?: string;
  mode?: string;
  stage1: {
    prediction: string;
    confidence?: number;
    probabilities?: Record<string, number>;
  };
  /** null when the text is classified as non-toxic */
  stage2: {
    predictions?: string[];
    probabilities?: Record<string, number>;
  } | null;
}

export type ApiErrorKind = 'network' | 'timeout' | 'http' | 'validation' | 'parse';

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface HealthState {
  status: 'checking' | 'online' | 'offline';
  /** Short human readable detail, e.g. HTTP status or error text */
  detail?: string;
}
