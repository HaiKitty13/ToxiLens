import type { LucideIcon } from 'lucide-react';
import { Brain, FileText, Layers, MapPin, ScanText, Tags } from 'lucide-react';

/**
 * Static content for the Model Description page.
 * Items marked `tbd` describe details that have not been confirmed yet.
 */

export const SYSTEM_OVERVIEW =
  'ToxiLens detects toxic language in Indonesian text with a two-stage pipeline built on transformer encoders. Stage 1 decides whether a text is toxic; Stage 2 identifies which kinds of toxicity it contains. Models can optionally take annotator metadata into account.';

export interface PipelineNode {
  id: string;
  title: string;
  detail: string;
  icon: LucideIcon;
}

export const PIPELINE: PipelineNode[] = [
  { id: 'input', title: 'Input text', detail: 'Indonesian sentence or tweet, optionally with annotator metadata.', icon: FileText },
  { id: 'encoder', title: 'Transformer encoder', detail: 'IndoBERT / IndoBERTweet turns the text into a contextual representation.', icon: Brain },
  { id: 'stage1', title: 'Stage 1', detail: 'Binary classification: Toxic or Non-Toxic.', icon: ScanText },
  { id: 'stage2', title: 'Stage 2', detail: 'Multi-label classification of toxicity categories.', icon: Tags },
];

export interface StageInfo {
  stage: string;
  title: string;
  task: string;
  output: string;
  points: string[];
}

export const STAGES: StageInfo[] = [
  {
    stage: 'Stage 1',
    title: 'Binary classification',
    task: 'Classifies the input text into Toxic or Non-Toxic.',
    output: 'Label + confidence score',
    points: ['Single decision per text', 'Runs on every input'],
  },
  {
    stage: 'Stage 2',
    title: 'Multi-label classification',
    task: 'Identifies specific toxicity categories for texts classified as Toxic.',
    output: 'Score per category',
    points: ['A text can belong to several categories at once', 'Intended for texts that Stage 1 marks as toxic'],
  },
];

export interface VariantInfo {
  id: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  usesText: boolean;
  metadata: string;
}

export const VARIANTS: VariantInfo[] = [
  {
    id: 'text-only',
    title: 'Text-Only',
    icon: FileText,
    summary: 'Predicts from the input text alone, ignoring who the annotator is.',
    usesText: true,
    metadata: 'None',
  },
  {
    id: 'metadata-full',
    title: 'Full Metadata',
    icon: Layers,
    summary: 'Combines the text with the complete set of supported annotator metadata.',
    usesText: true,
    metadata: 'All supported fields',
  },
  {
    id: 'metadata-domicile',
    title: 'Domicile-Only',
    icon: MapPin,
    summary: 'Combines the text with the annotator domicile only.',
    usesText: true,
    metadata: 'Domicile',
  },
];

export const METADATA_INCORPORATION = {
  intro: 'In metadata-based models, annotator attributes accompany the text so the prediction can reflect the annotator’s perspective.',
  steps: [
    'Annotator metadata is supplied alongside the text.',
    'Metadata and text are combined into a single model input.',
    'The encoder and classification heads produce Stage 1 and Stage 2 outputs.',
  ],
  tbd: 'The exact fusion mechanism (e.g. how metadata is encoded and merged with the text representation) has not been specified yet. Update src/data/model.ts when it is confirmed.',
};

export interface ArchitectureCard {
  title: string;
  body: string;
}

export const ARCHITECTURE_CARDS = [
  {
    title: 'IndoBERTweet',
    body: 'A pretrained Indonesian language model based on the BERT architecture, designed to process informal language and social media text.',
  },
  {
    title: 'NusaBERT',
    body: 'A pretrained Indonesian language model used as an alternative encoder for Indonesian text classification.',
  },
];

export const ENCODER_STEPS: { title: string; detail: string }[] = [
  { title: 'Tokenization', detail: 'Text is split into subword tokens.' },
  { title: 'Embeddings', detail: 'Tokens become vectors with positional information.' },
  { title: 'Transformer layers', detail: 'Self-attention builds context-aware representations.' },
  { title: 'Classification heads', detail: 'Task-specific layers output Stage 1 and Stage 2 predictions.' },
];

export const CHECKPOINT_TBD = 'The exact pre-trained checkpoint(s) and fine-tuning settings are not specified yet.';
