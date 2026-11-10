import type { PredictionMode } from '@/types/api';

/**
 * Central API configuration.
 *
 * - The base URL comes from the VITE_API_BASE_URL environment variable (see .env.example).
 * - Endpoint paths below are EXAMPLES. Replace them here when the real backend contract is known;
 *   no component needs to change.
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

/** Base URL without trailing slash. Falls back to the local FastAPI default for development only. */
export const API_BASE_URL: string = (rawBaseUrl && rawBaseUrl.trim() !== '' ? rawBaseUrl : 'http://localhost:8000').replace(
  /\/+$/,
  '',
);

export const REQUEST_TIMEOUT_MS = 30_000;

export type HttpMethod = 'GET' | 'POST';

export interface EndpointConfig {
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
}

export const ENDPOINTS = {
  'text-only': {
    method: 'POST',
    path: '/api/v1/predict/text-only',
    title: 'Text-Only Prediction',
    description: 'Classifies the input text without any annotator metadata.',
  },
  'metadata-full': {
    method: 'POST',
    path: '/api/v1/predict/metadata-full',
    title: 'Full Metadata Prediction',
    description: 'Classifies the input text together with the full set of annotator metadata.',
  },
  'metadata-domicile': {
    method: 'POST',
    path: '/api/v1/predict/metadata',
    title: 'Domicile-Only Prediction',
    description: 'Classifies the input text together with the annotator domicile only.',
  },
  health: {
    method: 'GET',
    path: '/health',
    title: 'API Health Check',
    description: 'Returns a simple response confirming that the API is reachable.',
  },
} as const satisfies Record<PredictionMode | 'health', EndpointConfig>;

export type EndpointKey = keyof typeof ENDPOINTS;

/** Build an absolute URL for an endpoint key. */
export function endpointUrl(key: EndpointKey): string {
  return `${API_BASE_URL}${ENDPOINTS[key].path}`;
}

/**
 * Where to find each value inside the backend response body.
 * Adjust these when the real response structure is known.
 */
export const RESPONSE_FIELDS = {
  stage1: 'stage1',
  stage2: 'stage2',
  prediction: 'prediction',
  confidence: 'confidence',
  probabilities: 'probabilities',
  stage2Predictions: 'predictions',
} as const;

/** Stage 2 scores at or above this value are highlighted as "detected" categories. */
export const CATEGORY_HIGHLIGHT_THRESHOLD = 0.5;

/** Maximum characters accepted by the text input (client-side only). */
export const MAX_TEXT_LENGTH = 500;
