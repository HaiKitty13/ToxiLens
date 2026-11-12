
export type MethodologyStep = {
  title: string;
  description: string;
};

export type DatasetStat = {
  id: string;
  label: string;
  value: number | string | null;
  hint: string;
};


export const DATASET_OVERVIEW = [
  <>
    This research adopts <strong>IndoDiscourse</strong>, an Indonesian
    discourse dataset introduced by Susanto et al. (2025), as its primary
    data source. The dataset was developed to support research on toxicity,
    hate speech, and polarization in Indonesian online communication by
    incorporating annotator demographic information.
  </>,
  <>
    The original dataset consists of Indonesian-language texts collected
    from social media platforms and online news discussions. It contains
    two main components: the <strong>Main Table</strong>, which stores
    discourse texts and their annotation labels, and the{" "}
    <strong>Annotator Table</strong>, which contains demographic and
    background information about the annotators.
  </>,
  <>
    However, <strong>this research does not directly use the original
    IndoDiscourse dataset without modification</strong>. Several data
    preparation and annotation procedures are conducted to improve the
    consistency and reliability of the toxicity labels.
  </>,
  <>
    The original annotations are first aggregated using{" "}
    <strong>majority voting</strong>. Samples without a clear majority are
    subsequently <strong>re-annotated by three researchers</strong>.
    Samples that remain highly ambiguous after re-annotation are{" "}
    <strong>excluded from the research dataset</strong>.
  </>,
  <>
    The resulting dataset, which consists of finalized text, toxicity
    labels, and integrated annotator metadata, is{" "}
    <strong>the primary dataset used for model training and evaluation</strong>.
  </>,
  <>
    Therefore, <strong>the dataset used in this research is a processed
    and modified version of the original IndoDiscourse dataset</strong>,
    rather than the unmodified original dataset.
  </>,
];


export const DATASET_STATS: DatasetStat[] = [
  {
    id: "original-samples",
    label: "Original Samples",
    value: 28477,
    hint: "Total text samples in the original IndoDiscourse dataset",
  },
  {
    id: "original-annotators",
    label: "Original Annotators",
    value: 29,
    hint: "Annotators in the original dataset",
  },
  {
    id: "collection-period",
    label: "Collection Period",
    value: "Sep 2023 – Jan 2024",
    hint: "Original dataset collection period",
  },
  {
    id: "dataset-components",
    label: "Dataset Components",
    value: 2,
    hint: "Main Table and Annotator Table",
  },
  {
    id: "classification-stages",
    label: "Classification Stages",
    value: 2,
    hint: "Binary and multi-label classification",
  },
  {
    id: "toxicity-categories",
    label: "Toxicity Categories",
    value: 6,
    hint: "Categories used in Stage 2 classification",
  },
];

// Populate these arrays using the final EDA results.
// Empty arrays are used to avoid displaying fabricated statistics.

export const LABEL_DISTRIBUTION: {
  name: string;
  value: number;
}[] = [];

export const CATEGORY_DISTRIBUTION: {
  name: string;
  value: number;
}[] = [];

export const TOXICITY_CATEGORIES = [
  {
    key: "insults",
    label: "Insults",
    description:
      "Expressions intended to insult, demean, ridicule, or verbally attack an individual or group.",
    confirmed: true,
  },
  {
    key: "identity_attack",
    label: "Identity Attack",
    description:
      "Attacks targeting individuals or groups based on their identity or personal characteristics.",
    confirmed: true,
  },
  {
    key: "polarized",
    label: "Polarized",
    description:
      "Content expressing strong opposing viewpoints, divisions, or polarized perspectives.",
    confirmed: true,
  },
  {
    key: "threat_incitement_to_violence",
    label: "Threat / Incitement to Violence",
    description:
      "Content containing threats or encouraging others to engage in acts of violence.",
    confirmed: true,
  },
  {
    key: "profanity_obscenity",
    label: "Profanity / Obscenity",
    description:
      "Content containing vulgar, profane, or obscene expressions.",
    confirmed: true,
  },
  {
    key: "sexually_explicit",
    label: "Sexually Explicit",
    description:
      "Content containing sexually explicit language or expressions.",
    confirmed: true,
  },
];

export const DATA_SPLITS = [
  {
    split: "Training",
    samples: null,
    toxic: null,
    nonToxic: null,
  },
  {
    split: "Validation",
    samples: null,
    toxic: null,
    nonToxic: null,
  },
  {
    split: "Testing",
    samples: null,
    toxic: null,
    nonToxic: null,
  },
];

export const METADATA_CATEGORIES = [
  {
    key: "ethnicity",
    label: "Ethnicity",
    description:
      "Information about the ethnic background of each annotator.",
  },
  {
    key: "religion",
    label: "Religion",
    description:
      "Information about the religious background of each annotator.",
  },
  {
    key: "disability",
    label: "Disability",
    description:
      "Information indicating the disability status of each annotator.",
  },
  {
    key: "lgbt",
    label: "LGBT",
    description:
      "Information regarding the annotator's LGBT-related demographic background.",
  },
  {
    key: "gender",
    label: "Gender",
    description:
      "Gender information associated with each annotator.",
  },
  {
    key: "age",
    label: "Age",
    description:
      "Age information of each annotator.",
  },
  {
    key: "domisili",
    label: "Domicile",
    description:
      "Residential location or domicile of each annotator.",
  },
  {
    key: "pendidikan terakhir",
    label: "Education",
    description:
      "Highest educational attainment of each annotator.",
  },
  {
    key: "status pekerjaan",
    label: "Employment Status",
    description:
      "Employment or occupational background of each annotator.",
  },
  {
    key: "president vote leaning",
    label: "Presidential Voting Preference",
    description:
      "Reported presidential voting preference or political leaning of each annotator.",
  },
];

export const PREPROCESSING_STEPS: MethodologyStep[] = [
  {
    title: "Dataset Collection",
    description:
      "The Main Table and Annotator Table from IndoDiscourse are used as the primary data sources.",
  },
  {
    title: "Data Integration",
    description:
      "Text annotations are connected with annotator IDs to retrieve the corresponding demographic metadata.",
  },
  {
    title: "Majority Voting",
    description:
      "Multiple annotations for each text are aggregated to determine the final toxicity label.",
  },
  {
    title: "Ambiguous Label Identification",
    description:
      "Samples with an equal number of Toxic and Non-Toxic votes are identified as ambiguous cases.",
  },
  {
    title: "Text Cleaning and Normalization",
    description:
      "Minimal text preprocessing and LLM-assisted normalization are applied while preserving the original meaning and context.",
  },
  {
    title: "Final Dataset Preparation",
    description:
      "The finalized texts, toxicity labels, and annotator metadata are prepared for model training and evaluation.",
  },
];

export const ANNOTATION_STEPS: MethodologyStep[] = [
  {
    title: "Initial Annotation",
    description:
      "Each text is labeled by multiple annotators with either a Toxic or Non-Toxic classification.",
  },
  {
    title: "Majority Voting",
    description:
      "The final label is determined based on the majority of votes received from the annotators.",
  },
  {
    title: "Ambiguity Identification",
    description:
      "Samples with an equal number of Toxic and Non-Toxic votes are identified because no majority label can be established.",
  },
  {
    title: "Re-annotation by Researchers",
    description:
      "Ambiguous samples are reviewed and re-annotated by three researchers who act as additional annotators.",
  },
  {
    title: "Final Label Determination",
    description:
      "The additional annotations are used to establish the final labels for previously ambiguous samples.",
  },
  {
    title: "Removal of Highly Ambiguous Samples",
    description:
      "Samples that remain highly ambiguous and cannot be assigned a reliable label are excluded from the research dataset.",
  },
];
