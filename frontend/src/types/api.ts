export type PredictionMode = 'text-only' | 'metadata-full' | 'metadata-domicile';
export type ModelFamily = 'nusabert' | 'indobertweet';

/** Annotator metadata: field key -> selected value. Keys come from src/config/metadata.ts. */
export type MetadataValues = Record<string, string>;

export interface TextOnlyRequest {
  text: string;
}

export interface MetadataRequest {
  text: string;
  metadata: MetadataValues;
  family: ModelFamily;
}

export type PredictionRequest = TextOnlyRequest | MetadataRequest;

export interface ValidationErrorBody {
  detail: Array<{ loc: Array<string | number>; msg: string; type: string }> | string;
}

export type ToxicityLabel = 'toxic' | 'non-toxic';

export interface CategoryScore {
  key: string;
  label: string;
  score: number;
  detected: boolean;
}

export interface PredictionResult {
  label: ToxicityLabel;
  rawLabel: string;
  confidence: number | null;
  stage1Probabilities: CategoryScore[];
  stage2Available: boolean;
  categories: CategoryScore[];
  raw: unknown;
}

export interface PredictionResponseRaw {
  text?: string;
  mode?: string;
  family?: string;
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
