import type { PredictionMode } from '@/types/api';

export interface MetadataOption {
  value: string;
  label: string;
}

export interface MetadataFieldConfig {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
  type?: 'select' | 'number';
  options: MetadataOption[];
}

const opts = (...values: string[]): MetadataOption[] =>
  values.map((v) => ({ value: v, label: v }));

export const METADATA_FIELDS: MetadataFieldConfig[] = [
  {
    key: 'ethnicity',
    label: 'Ethnicity',
    description: "The annotator's ethnic background.",
    placeholder: 'Select ethnicity',
    required: true,
    options: opts(
      'Jawa',
      'Sunda',
      'Batak',
      'Minangkabau',
      'Betawi',
      'Bugis',
      'Lainnya'
    ),
  },
  {
    key: 'religion',
    label: 'Religion',
    description: "The annotator's religion.",
    placeholder: 'Select religion',
    required: true,
    options: opts(
      'Islam',
      'Kristen',
      'Katolik',
      'Hindu',
      'Buddha',
      'Konghucu',
      'Lainnya'
    ),
  },
  {
    key: 'gender',
    label: 'Gender',
    description: "The annotator's gender.",
    placeholder: 'Select gender',
    required: true,
    options: [
      { value: 'M', label: 'Male' },
      { value: 'F', label: 'Female' },
    ],
  },
  {
    key: 'age',
    label: 'Age',
    description: "The annotator's age in years.",
    placeholder: 'Enter your age',
    required: true,
    type: 'number',
    options: [],
  },
  {
    key: 'domisili',
    label: 'Domicile',
    description: "The annotator's current domicile.",
    placeholder: 'Select domicile',
    required: true,
    options: opts('Jabodetabek', 'Non-Jabodetabek'),
  },
  {
    key: 'disability',
    label: 'Disability',
    description: "Whether the annotator has a disability.",
    placeholder: 'Select option',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'lgbt',
    label: 'LGBT',
    description: "Whether the annotator identifies as LGBT.",
    placeholder: 'Select option',
    required: true,
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'pendidikan_terakhir',
    label: 'Education',
    description: "The annotator's highest education level.",
    placeholder: 'Select education level',
    required: true,
    options: opts('SMA', 'D3', 'Sarjana(S1)', 'Magister(S2)', 'Doktor(S3)'),
  },
  {
    key: 'status_pekerjaan',
    label: 'Employment Status',
    description: "The annotator's current employment status.",
    placeholder: 'Select employment status',
    required: true,
    options: opts('Bekerja', 'Tidak Bekerja', 'Pelajar/Mahasiswa'),
  },
  {
    key: 'president_vote_leaning',
    label: 'President Vote Leaning',
    description: "The annotator's presidential vote preference category.",
    placeholder: 'Select option',
    required: true,
    options: opts('1', '2', '3', "Golput", "-"),
  },
];

type MetadataMode = Exclude<PredictionMode, 'text-only'>;

export const MODE_METADATA_KEYS: Record<MetadataMode, string[]> = {
  'metadata-full': METADATA_FIELDS.map((f) => f.key),
  'metadata-domicile': ['domisili'],
};

export function getFieldsForMode(
  mode: PredictionMode
): MetadataFieldConfig[] {
  if (mode === 'text-only') return [];

  const keys = MODE_METADATA_KEYS[mode];
  return METADATA_FIELDS.filter((f) => keys.includes(f.key));
}