import { MAX_TEXT_LENGTH } from '@/config/api';
import { getFieldsForMode } from '@/config/metadata';
import type { MetadataValues, PredictionMode } from '@/types/api';

export interface ValidationErrors {
  text?: string;
  /** field key -> message */
  metadata: Record<string, string>;
}

export function validatePrediction(mode: PredictionMode, text: string, metadata: MetadataValues): ValidationErrors {
  const errors: ValidationErrors = { metadata: {} };
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    errors.text = 'Please enter some text to analyze.';
  } else if (text.length > MAX_TEXT_LENGTH) {
    errors.text = `Text is too long (maximum ${MAX_TEXT_LENGTH} characters).`;
  }

  for (const field of getFieldsForMode(mode)) {
    if (field.required && !metadata[field.key]) {
      errors.metadata[field.key] = `Please select ${field.label.toLowerCase()}.`;
    }
  }
  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Boolean(errors.text) || Object.keys(errors.metadata).length > 0;
}
