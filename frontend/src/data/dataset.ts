import type { ChartDatum } from '@/components/charts/ChartCard';

/**
 * Centralized dataset information.
 *
 * Every `null` below is a PLACEHOLDER — no figures have been provided yet, so none are invented.
 * Fill them in here and the Dataset page (cards, charts, tables) updates automatically.
 */

export interface DatasetStat {
  id: string;
  label: string;
  /** null = not provided yet */
  value: number | string | null;
  hint: string;
}

export const DATASET_STATS: DatasetStat[] = [
  { id: 'samples', label: 'Total samples', value: null, hint: 'Number of annotated texts' },
  { id: 'toxic', label: 'Toxic samples', value: null, hint: 'Texts labeled as toxic' },
  { id: 'non-toxic', label: 'Non-toxic samples', value: null, hint: 'Texts labeled as non-toxic' },
  { id: 'annotators', label: 'Annotators', value: null, hint: 'Number of contributing annotators' },
  { id: 'language', label: 'Language', value: 'Indonesian', hint: 'Language of the texts' },
  { id: 'source', label: 'Text source', value: null, hint: 'Where the texts were collected from' },
];

export const DATASET_OVERVIEW: string | null = null; // e.g. "A corpus of Indonesian social media texts annotated for toxicity..."

export const LABEL_DISTRIBUTION: ChartDatum[] = [
  { name: 'Toxic', value: null },
  { name: 'Non-Toxic', value: null },
];

export interface ToxicityCategory {
  key: string;
  label: string;
  description: string | null;
  count: number | null;
  /** false = name only taken from the example API response; confirm against the real label set */
  confirmed: boolean;
}

export const TOXICITY_CATEGORIES: ToxicityCategory[] = [
  { key: 'insults', label: 'Insults', description: null, count: null, confirmed: false },
  { key: 'identity_attack', label: 'Identity Attack', description: null, count: null, confirmed: false },
  { key: 'profanity_obscenity', label: 'Profanity / Obscenity', description: null, count: null, confirmed: false },
];

export const CATEGORY_DISTRIBUTION: ChartDatum[] = TOXICITY_CATEGORIES.map((c) => ({ name: c.label, value: c.count }));

export interface SplitRow {
  split: string;
  samples: number | null;
  toxic: number | null;
  nonToxic: number | null;
}

export const DATA_SPLITS: SplitRow[] = [
  { split: 'Train', samples: null, toxic: null, nonToxic: null },
  { split: 'Validation', samples: null, toxic: null, nonToxic: null },
  { split: 'Test', samples: null, toxic: null, nonToxic: null },
];

export interface MetadataCategoryInfo {
  key: string;
  label: string;
  description: string;
  /** Categories / value distribution — null until provided */
  values: string[] | null;
}

/** Field names are taken from the example API contract. */
export const METADATA_CATEGORIES: MetadataCategoryInfo[] = [
  { key: 'ethnicity', label: 'Ethnicity', description: "The annotator's ethnic background.", values: null },
  { key: 'religion', label: 'Religion', description: "The annotator's religion.", values: null },
  { key: 'gender', label: 'Gender', description: "The annotator's gender.", values: null },
  { key: 'age', label: 'Age range', description: "The annotator's age group.", values: null },
  { key: 'domicile', label: 'Domicile', description: 'Where the annotator lives.', values: null },
  { key: 'education', label: 'Education', description: "The annotator's education level.", values: null },
];

export interface MethodologyStep {
  title: string;
  /** null = not provided yet */
  description: string | null;
}

export const PREPROCESSING_STEPS: MethodologyStep[] = [
  { title: 'Step 1', description: null },
  { title: 'Step 2', description: null },
  { title: 'Step 3', description: null },
];

export const ANNOTATION_STEPS: MethodologyStep[] = [
  { title: 'Step 1', description: null },
  { title: 'Step 2', description: null },
  { title: 'Step 3', description: null },
];
