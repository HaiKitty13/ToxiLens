// import { API_BASE_URL, ENDPOINTS, type EndpointKey } from '@/config/api';
// import { MODES } from '@/config/modes';
// import type { PredictionMode } from '@/types/api';

// /**
//  * Centralized API documentation content (examples only).
//  * Endpoint paths come from src/config/api.ts; request / response schemas live here.
//  * Update this file when the real FastAPI contract is known.
//  */

// const EXAMPLE_TEXT = 'Dasar bodoh, kamu tidak pantas berada di sini!';

// export const REQUEST_EXAMPLES: Record<PredictionMode, unknown> = {
//   'text-only': { text: EXAMPLE_TEXT },
//   'metadata-full': {
//     text: EXAMPLE_TEXT,
//     metadata: {
//       ethnicity: 'Jawa',
//       religion: 'Islam',
//       gender: 'Perempuan',
//       age: '20-25',
//       domicile: 'Jakarta',
//       education: 'S1',
//     },
//   },
//   'metadata-domicile': {
//     text: EXAMPLE_TEXT,
//     metadata: { domicile: 'Jakarta' },
//   },
// };

// /** Backend mode identifier. "text_only" is confirmed; the metadata ids are assumed — adjust if they differ. */
// const MODE_IDS: Record<PredictionMode, string> = {
//   'text-only': 'text_only',
//   'metadata-full': 'metadata_full',
//   'metadata-domicile': 'metadata_domicile',
// };

// const STAGE2_PROBABILITIES = {
//   insults: 0.84274822473526,
//   identity_attack: 0.23592452704906464,
//   threat_incitement_to_violence: 0.008430506102740765,
//   profanity_obscenity: 0.2801719307899475,
//   sexually_explicit: 0.00704586785286665,
// };

// export function RESPONSE_EXAMPLE(mode: PredictionMode) {
//   return {
//     text: EXAMPLE_TEXT,
//     mode: MODE_IDS[mode],
//     stage1: {
//       prediction: 'toxic',
//       confidence: 0.9389718174934387,
//       probabilities: { non_toxic: 0.06102815642952919, toxic: 0.9389718174934387 },
//     },
//     stage2: {
//       predictions: ['insults'],
//       probabilities: STAGE2_PROBABILITIES,
//     },
//   };
// }

// /** Non-toxic texts return `stage2: null`. */
// export const NON_TOXIC_RESPONSE_EXAMPLE = {
//   text: 'Terima kasih atas penjelasannya, sangat membantu sekali.',
//   mode: 'text_only',
//   stage1: {
//     prediction: 'non_toxic',
//     confidence: 0.97,
//     probabilities: { non_toxic: 0.97, toxic: 0.03 },
//   },
//   stage2: null,
// };

// export const HEALTH_RESPONSE_EXAMPLE = { status: 'ok' };

// export interface ErrorExample {
//   id: string;
//   title: string;
//   status: string;
//   description: string;
//   body: unknown;
// }

// export const ERROR_EXAMPLES: ErrorExample[] = [
//   {
//     id: 'validation',
//     title: 'Validation error',
//     status: '422 Unprocessable Entity',
//     description: 'The request body is missing a required field or has the wrong type (FastAPI default format).',
//     body: {
//       detail: [{ loc: ['body', 'text'], msg: 'Field required', type: 'missing' }],
//     },
//   },
//   {
//     id: 'server',
//     title: 'Server error',
//     status: '500 Internal Server Error',
//     description: 'Something went wrong while running the model.',
//     body: { detail: 'Internal Server Error' },
//   },
// ];

// export interface FieldDoc {
//   name: string;
//   type: string;
//   required: boolean;
//   description: string;
// }

// export const REQUEST_FIELDS: FieldDoc[] = [
//   { name: 'text', type: 'string', required: true, description: 'Indonesian sentence or tweet to classify.' },
//   { name: 'metadata', type: 'object', required: false, description: 'Annotator metadata. Required for metadata-based endpoints; omit for text-only. Keys depend on the model variant.' },
// ];

// export const RESPONSE_FIELDS_DOC: FieldDoc[] = [
//   { name: 'prediction', type: 'string', required: true, description: 'Stage 1 label: "Toxic" or "Non-Toxic".' },
//   { name: 'confidence', type: 'number', required: false, description: 'Confidence of the Stage 1 prediction (0–1).' },
//   { name: 'stage_2', type: 'object', required: false, description: 'Stage 2 toxicity categories mapped to probabilities (0–1).' },
// ];

// export interface EndpointDoc {
//   key: EndpointKey;
//   mode?: PredictionMode;
//   title: string;
//   method: string;
//   path: string;
//   description: string;
//   requestExample?: unknown;
//   responseExample: unknown;
//   curl: string;
// }

// function buildCurl(key: EndpointKey, body?: unknown): string {
//   const { method, path } = ENDPOINTS[key];
//   const url = `${API_BASE_URL}${path}`;
//   if (body === undefined) return `curl ${url}`;
//   return [`curl -X ${method} ${url}`, `  -H "Content-Type: application/json"`, `  -d '${JSON.stringify(body)}'`].join(' \\\n');
// }

// const MODE_KEYS: PredictionMode[] = ['text-only', 'metadata-full', 'metadata-domicile'];

// export const ENDPOINT_DOCS: EndpointDoc[] = [
//   ...MODE_KEYS.map((mode) => ({
//     key: mode,
//     mode,
//     title: ENDPOINTS[mode].title,
//     method: ENDPOINTS[mode].method,
//     path: ENDPOINTS[mode].path,
//     description: ENDPOINTS[mode].description,
//     requestExample: REQUEST_EXAMPLES[mode],
//     responseExample: RESPONSE_EXAMPLE,
//     curl: buildCurl(mode, REQUEST_EXAMPLES[mode]),
//   })),
//   {
//     key: 'health',
//     title: ENDPOINTS.health.title,
//     method: ENDPOINTS.health.method,
//     path: ENDPOINTS.health.path,
//     description: ENDPOINTS.health.description,
//     responseExample: HEALTH_RESPONSE_EXAMPLE,
//     curl: buildCurl('health'),
//   },
// ];

// export const SUPPORTED_MODES = MODE_KEYS.map((id) => ({
//   id,
//   label: MODES[id].label,
//   description: MODES[id].description,
//   endpoint: ENDPOINTS[id].path,
// }));
