/**
 * Static content for the Research Description page.
 *
 * This is DRAFT wording derived from the project brief. No findings, results or statistics are included.
 * Replace / extend it with the final text from the research report. Sections whose content is still unknown
 * are listed in RESEARCH_PENDING.
 */

export const RESEARCH_BACKGROUND = [
  'Toxic language on Indonesian social media harms individuals and communities, and it is difficult to detect automatically because of informal writing, slang, regional expressions and context.',
  'Whether a text is perceived as toxic is not always objective. Annotators with different backgrounds may judge the same sentence differently, yet most toxicity detectors ignore who produced the labels.',
];

export interface ResearchItem {
  title: string;
  body: string;
}

export const RESEARCH_OBJECTIVES: ResearchItem[] = [
  { title: 'Build a two-stage detector', body: 'Develop a system that first classifies Indonesian text as toxic or non-toxic, then identifies the toxicity categories involved.' },
  { title: 'Incorporate annotator metadata', body: 'Investigate how adding annotator metadata to the model input affects toxicity detection.' },
  { title: 'Compare approaches', body: 'Compare text-only models with metadata-based models, including a domicile-only variant.' },
];

export const RESEARCH_PROBLEMS: ResearchItem[] = [
  { title: 'Subjectivity of toxicity', body: 'Annotator background may influence labels, but standard models treat every label as equally objective.' },
  { title: 'Fine-grained categories', body: 'A binary label hides which kind of toxicity a text contains, limiting its usefulness.' },
  { title: 'Which metadata matters?', body: 'It is unclear whether the full set of annotator metadata is needed, or whether a single attribute such as domicile is enough.' },
];

export const RESEARCH_METHOD_STEPS: ResearchItem[] = [
  { title: 'Dataset', body: 'Indonesian texts annotated for toxicity, with annotator metadata.' },
  { title: 'Preprocessing', body: 'Text preparation for transformer models.' },
  { title: 'Model training', body: 'IndoBERT / IndoBERTweet fine-tuned for Stage 1 and Stage 2.' },
  { title: 'Variant comparison', body: 'Text-only, full metadata and domicile-only models.' },
  { title: 'Evaluation', body: 'Assessment of the variants on held-out data.' },
];

export const RESEARCH_CONTRIBUTIONS: ResearchItem[] = [
  { title: 'Annotator-aware toxicity detection', body: 'An approach that brings annotator metadata into Indonesian toxicity detection.' },
  { title: 'Two-stage classification', body: 'A pipeline that reports both overall toxicity and its categories.' },
  { title: 'Variant comparison', body: 'A structured comparison of text-only, full-metadata and domicile-only models.' },
  { title: 'Public demo', body: 'ToxiLens, a web interface for exploring the models interactively.' },
];

export const METADATA_MOTIVATION = [
  'Perceptions of offensive language depend on culture, identity and experience, so the same sentence can be judged differently by different people.',
  'Including annotator metadata lets a model learn from these differences instead of averaging them away.',
  'Testing a domicile-only variant helps show whether a single, easy-to-collect attribute captures part of that effect.',
];

export interface ComparisonRow {
  aspect: string;
  textOnly: string;
  metadata: string;
}

export const APPROACH_COMPARISON: ComparisonRow[] = [
  { aspect: 'Model input', textOnly: 'Text only', metadata: 'Text + annotator metadata' },
  { aspect: 'Annotator perspective', textOnly: 'Not considered', metadata: 'Considered' },
  { aspect: 'Variants', textOnly: 'Single model', metadata: 'Full metadata, domicile-only' },
  { aspect: 'Extra input required', textOnly: 'None', metadata: 'Annotator attributes' },
];

export const RESEARCH_PENDING = [
  'Final research problem statements and hypotheses',
  'Evaluation metrics and experimental setup',
  'Results and conclusions',
  'References and citations',
];
