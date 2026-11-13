export const RESEARCH_BACKGROUND = [
  'The widespread use of social media in Indonesia has increased the exposure of users to toxic language and hate speech. Automatically detecting such content remains challenging due to informal language, slang, regional expressions, and the contextual nature of offensive statements.',
  'Hate speech annotation can also be subjective, as individuals with different demographic and social backgrounds may perceive the same statement differently. However, conventional text classification approaches generally focus on the textual content without explicitly considering the background of the annotators who provide the labels.',
  'This research investigates the incorporation of annotator metadata into Indonesian hate speech detection to examine how annotator backgrounds may influence the classification process. The proposed approach uses a two-stage classification pipeline to identify toxic content and its corresponding toxicity categories.'
];

export interface ResearchItem {
  title: string;
  body: string;
}

export const RESEARCH_OBJECTIVES: ResearchItem[] = [
  {
    title: 'Develop a two-stage classification system',
    body: 'Develop a system that classifies Indonesian text into toxic and non-toxic categories in Stage 1, followed by multi-label classification of specific toxicity categories in Stage 2.'
  },
  {
    title: 'Incorporate annotator metadata',
    body: 'Integrate annotator demographic and social background information into the model input to investigate its influence on Indonesian hate speech classification.'
  },
  {
    title: 'Investigate metadata influence',
    body: 'Examine how annotator metadata contributes to toxicity detection by comparing classification approaches that use textual information alone and approaches that incorporate annotator metadata.'
  }
];

export const RESEARCH_PROBLEMS: ResearchItem[] = [
  {
    title: 'Subjectivity in hate speech annotation',
    body: 'Individuals with different demographic and social backgrounds may interpret the same statement differently, potentially resulting in variations in hate speech annotations.'
  },
  {
    title: 'Limited consideration of annotator backgrounds',
    body: 'Conventional hate speech detection models primarily rely on textual features and do not explicitly incorporate the demographic and social characteristics of the annotators responsible for the labels.'
  },
  {
    title: 'Fine-grained toxicity classification',
    body: 'Binary toxic and non-toxic classification alone does not provide sufficient information about the specific types of toxicity contained in a text.'
  }
];

export const RESEARCH_METHOD_STEPS: ResearchItem[] = [
  {
    title: 'Dataset preparation',
    body: 'Collect and organize Indonesian text data along with annotator labels and corresponding demographic and social metadata. Establish the final labels using majority voting, with tied cases re-annotated by three researchers.'
  },
  {
    title: 'Text and metadata preprocessing',
    body: 'Perform minimal text preprocessing and normalization while preparing annotator metadata for integration into the model input.'
  },
  {
    title: 'Stage 1: Binary classification',
    body: 'Fine-tune an Indonesian pretrained transformer model to classify text as toxic or non-toxic using textual information and annotator metadata.'
  },
  {
    title: 'Stage 2: Multi-label classification',
    body: 'Classify toxic text into six categories: insults, identity attack, polarized, threat or incitement to violence, profanity or obscenity, and sexually explicit content.'
  },
  {
    title: 'Model evaluation and analysis',
    body: 'Evaluate the classification performance and investigate the influence of annotator metadata through comparisons between text-only and metadata-integrated approaches.'
  }
];

export const RESEARCH_CONTRIBUTIONS: ResearchItem[] = [
  {
    title: 'Annotator-aware hate speech detection',
    body: 'Investigate an approach that incorporates annotator demographic and social metadata into Indonesian hate speech detection.'
  },
  {
    title: 'Two-stage classification framework',
    body: 'Develop a classification pipeline that identifies overall toxicity and provides more detailed toxicity category predictions.'
  },
  {
    title: 'Analysis of annotator metadata',
    body: 'Provide an empirical analysis of how annotator background information may influence the performance of Indonesian hate speech classification models.'
  },
  {
    title: 'ToxiLens web application',
    body: 'Provide an interactive web interface for exploring the developed hate speech classification system and its predictions.'
  }
];

export const METADATA_MOTIVATION = [
  'The interpretation of potentially offensive language can vary depending on an individual\'s demographic, cultural, and social background.',
  'Annotator metadata provides additional contextual information that may help the model account for differences in how individuals perceive and annotate toxic language.',
  'Incorporating metadata into the model input allows the research to investigate whether annotator background information contributes to more informed toxicity classification.'
];

export interface ComparisonRow {
  aspect: string;
  textOnly: string;
  metadata: string;
}

export const APPROACH_COMPARISON: ComparisonRow[] = [
  {
    aspect: 'Model input',
    textOnly: 'Textual content only',
    metadata: 'Textual content combined with annotator metadata'
  },
  {
    aspect: 'Annotator information',
    textOnly: 'Not explicitly incorporated',
    metadata: 'Demographic and social background information included'
  },
  {
    aspect: 'Classification stages',
    textOnly: 'Stage 1 and Stage 2',
    metadata: 'Stage 1 and Stage 2'
  },
  {
    aspect: 'Research focus',
    textOnly: 'Text-based classification performance',
    metadata: 'Classification performance and the influence of annotator metadata'
  },
  {
    aspect: 'Additional input',
    textOnly: 'None',
    metadata: 'Annotator demographic and social attributes'
  }
];

export const TOXICITY_CATEGORIES = [
  'Insults',
  'Identity Attack',
  'Polarized',
  'Threat / Incitement to Violence',
  'Profanity / Obscenity',
  'Sexually Explicit'
];

export const ANNOTATOR_METADATA = [
  'Ethnicity',
  'Religion',
  'Disability',
  'LGBT',
  'Gender',
  'Age',
  'Domicile',
  'Education',
  'Occupation',
  'Political Preference'
];

export const RESEARCH_PENDING = [
  'Final research questions and hypotheses',
  'Detailed experimental configuration and evaluation metrics',
  'Experimental results and comparative analysis',
  'Discussion of findings and research limitations',
  'References and academic citations'
];