import type { LucideIcon } from 'lucide-react';
import { FileText, Layers, MapPin } from 'lucide-react';
import type { PredictionMode } from '@/types/api';

export type ModelCategory = 'text-only' | 'metadata';

export interface ModeConfig {
  id: PredictionMode;
  category: ModelCategory;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
}

/** Display configuration for the three prediction configurations. */
export const MODES: Record<PredictionMode, ModeConfig> = {
  'text-only': {
    id: 'text-only',
    category: 'text-only',
    label: 'Text-Only Model',
    shortLabel: 'Text-Only',
    description: 'This model analyzes the input text without considering annotator metadata.',
    icon: FileText,
  },
  'metadata-full': {
    id: 'metadata-full',
    category: 'metadata',
    label: 'Full Metadata Model',
    shortLabel: 'Full Metadata',
    description: 'Combines the input text with the complete set of supported annotator metadata.',
    icon: Layers,
  },
  'metadata-domicile': {
    id: 'metadata-domicile',
    category: 'metadata',
    label: 'Domicile-Only Metadata Model',
    shortLabel: 'Domicile-Only',
    description: 'Combines the input text with the annotator domicile only.',
    icon: MapPin,
  },
};

export const METADATA_VARIANTS: PredictionMode[] = ['metadata-full', 'metadata-domicile'];

/** Example sentences for the "Example" button (cycled in order). */
export const EXAMPLE_TEXTS: string[] = [
  'Dasar bodoh, kamu tidak pantas berada di sini!',
  'Terima kasih atas penjelasannya, sangat membantu sekali.',
  'Kalau tidak setuju, silakan sampaikan alasanmu dengan sopan.',
];
