
import type { PredictionMode, ModelFamily } from '@/types/api';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL: string = (
  rawBaseUrl?.trim() || 'http://localhost:8000'
).replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 30_000;

export type HttpMethod = 'GET' | 'POST';

export interface EndpointConfig {
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
}

// IndoBERTweet endpoints
export const ENDPOINTS_INDOBERTWEET = {
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

// NusaBERT endpoints
export const ENDPOINTS_NUSABERT = {
  'text-only': {
    method: 'POST',
    path: '/api/v1/nusabert/predict/text-only',
    title: 'Text-Only Prediction',
    description: 'Classifies the input text without any annotator metadata.',
  },
  'metadata-full': {
    method: 'POST',
    path: '/api/v1/nusabert/predict/metadata-full',
    title: 'Full Metadata Prediction',
    description: 'Classifies the input text together with the full set of annotator metadata.',
  },
  'metadata-domicile': {
    method: 'POST',
    path: '/api/v1/nusabert/predict/metadata-domicile',
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

// Endpoint keys
export type EndpointKey = PredictionMode | 'health';

// Select endpoint configuration based on model family
export function getEndpointConfig(
  family: ModelFamily,
  key: EndpointKey,
): EndpointConfig {
  const endpoints =
    family === 'indobertweet'
      ? ENDPOINTS_INDOBERTWEET
      : ENDPOINTS_NUSABERT;

  return endpoints[key];
}

// Build an absolute URL based on model family and endpoint key
export function endpointUrl(
  family: ModelFamily,
  key: EndpointKey,
): string {
  const endpoint = getEndpointConfig(family, key);
  return `${API_BASE_URL}${endpoint.path}`;
}

export const RESPONSE_FIELDS = {
  stage1: 'stage1',
  stage2: 'stage2',
  prediction: 'prediction',
  confidence: 'confidence',
  probabilities: 'probabilities',
  stage2Predictions: 'predictions',
} as const;

export const CATEGORY_HIGHLIGHT_THRESHOLD = 0.5;

export const MAX_TEXT_LENGTH = 500;
