
import type { PredictionMode, ModelFamily } from '@/types/api';

/* -------------------------------------------------------------------------- */
/* Base URL                                                                   */
/* -------------------------------------------------------------------------- */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL: string = (
  rawBaseUrl?.trim() || 'http://localhost:8000'
).replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 30_000;

/* -------------------------------------------------------------------------- */
/* Endpoint Types                                                             */
/* -------------------------------------------------------------------------- */

export type HttpMethod = 'GET' | 'POST';

export interface EndpointConfig {
  method: HttpMethod;
  path: string;
  title: string;
  description: string;
}

/* -------------------------------------------------------------------------- */
/* Prediction Endpoints                                                       */
/* -------------------------------------------------------------------------- */

export const ENDPOINTS_INDOBERTWEET = {
  'text-only': {
    method: 'POST',
    path: '/api/v1/predict/text-only',
    title: 'Text-Only Prediction',
    description:
      'Classifies the input text without any annotator metadata.',
  },
  'metadata-full': {
    method: 'POST',
    path: '/api/v1/predict/metadata-full',
    title: 'Full Metadata Prediction',
    description:
      'Classifies the input text together with the full set of annotator metadata.',
  },
  'metadata-domicile': {
    method: 'POST',
    path: '/api/v1/predict/metadata',
    title: 'Domicile-Only Prediction',
    description:
      'Classifies the input text together with the annotator domicile only.',
  },
  health: {
    method: 'GET',
    path: '/health',
    title: 'API Health Check',
    description:
      'Returns a simple response confirming that the API is reachable.',
  },
} as const satisfies Record<PredictionMode | 'health', EndpointConfig>;

export const ENDPOINTS_NUSABERT = {
  'text-only': {
    method: 'POST',
    path: '/api/v1/nusabert/predict/text-only',
    title: 'Text-Only Prediction',
    description:
      'Classifies the input text without any annotator metadata.',
  },
  'metadata-full': {
    method: 'POST',
    path: '/api/v1/nusabert/predict/metadata-full',
    title: 'Full Metadata Prediction',
    description:
      'Classifies the input text together with the full set of annotator metadata.',
  },
  'metadata-domicile': {
    method: 'POST',
    path: '/api/v1/nusabert/predict/metadata-domicile',
    title: 'Domicile-Only Prediction',
    description:
      'Classifies the input text together with the annotator domicile only.',
  },
  health: {
    method: 'GET',
    path: '/health',
    title: 'API Health Check',
    description:
      'Returns a simple response confirming that the API is reachable.',
  },
} as const satisfies Record<PredictionMode | 'health', EndpointConfig>;

export type EndpointKey = PredictionMode | 'health';

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

export function endpointUrl(
  family: ModelFamily,
  key: EndpointKey,
): string {
  const endpoint = getEndpointConfig(family, key);
  return `${API_BASE_URL}${endpoint.path}`;
}

/* -------------------------------------------------------------------------- */
/* Dataset and EDA Endpoints                                                  */
/* -------------------------------------------------------------------------- */

export const DATASET_ENDPOINTS = {
  summary: {
    method: 'GET',
    path: '/api/dataset/summary',
    title: 'Dataset Summary',
    description: 'Returns the overall dataset statistics.',
  },
  overview: {
    method: 'GET',
    path: '/api/eda/overview',
    title: 'EDA Overview',
    description: 'Returns annotation coverage and annotator statistics.',
  },
  demographics: {
    method: 'GET',
    path: '/api/eda/demographics',
    title: 'Annotator Demographics',
    description: 'Returns annotator demographic distributions.',
  },
} as const satisfies Record<string, EndpointConfig>;

export type DatasetEndpointKey = keyof typeof DATASET_ENDPOINTS;

export function getDatasetEndpointConfig(
  key: DatasetEndpointKey,
): EndpointConfig {
  return DATASET_ENDPOINTS[key];
}

export function datasetEndpointUrl(
  key: DatasetEndpointKey,
): string {
  const endpoint = getDatasetEndpointConfig(key);
  return `${API_BASE_URL}${endpoint.path}`;
}

export const EDA_ENDPOINTS = {
  toxicity: {
    method: 'GET',
    path: '/api/eda/toxicity',
    title: 'Toxicity Distribution',
    description: 'Tweet-level and annotation-level toxicity distribution.',
  },
  categories: {
    method: 'GET',
    path: '/api/eda/categories',
    title: 'Toxicity Category Distribution',
    description: 'Distribution of Stage 2 toxicity categories.',
  },
} as const;

export type EDAEndpointKey = keyof typeof EDA_ENDPOINTS;

export function edaEndpointUrl(key: EDAEndpointKey): string {
  return `${API_BASE_URL}${EDA_ENDPOINTS[key].path}`;
}

/* -------------------------------------------------------------------------- */
/* Prediction Response Configuration                                         */
/* -------------------------------------------------------------------------- */

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
