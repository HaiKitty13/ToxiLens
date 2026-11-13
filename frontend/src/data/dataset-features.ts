export interface DatasetFeature {
  name: string;
  description: string;
}

export const MAIN_TABLE_FEATURES: DatasetFeature[] = [
  {
    name: "Text_id",
    description:
      "Unique string identifier assigned to each text in the dataset.",
  },
  {
    name: "Annotators_id",
    description:
      "List of anonymized annotator identifiers who provided labels for the corresponding text. Linked to the Annotator Table.",
  },
  {
    name: "Text",
    description:
      "Raw Indonesian-language text collected from social media posts or online news discussions. May contain informal language, slang, code-mixing, and contextual expressions.",
  },
  {
    name: "Initial_paragraph",
    description:
      "Initial paragraph or surrounding context that provides additional information, particularly for texts from longer discussions or online news comments.",
  },
  {
    name: "Topic",
    description:
      "Categorical attribute indicating the main topic or target group discussed, such as ethnicity, religion, or specific social identities.",
  },
  {
    name: "Is_noise_or_spam_text",
    description:
      "Binary annotation indicating whether the text is noise or spam (1) or meaningful discourse (0). Final labels are determined through majority voting.",
  },
  {
    name: "Related_to_election_2024",
    description:
      "Binary annotation indicating whether the text is related to the 2024 Indonesian Election (1) or not (0).",
  },
  {
    name: "Toxicity",
    description:
      "Binary annotation indicating whether the text is toxic (1) or non-toxic (0). Final labels are determined through majority voting.",
  },
  {
    name: "Polarized",
    description:
      "Binary annotation indicating whether the text contains polarized discourse (1) or not (0).",
  },
  {
    name: "Profanity_obscenity",
    description:
      "Binary annotation indicating the presence (1) or absence (0) of profanity or obscene language.",
  },
  {
    name: "Threat_incitement_to_violence",
    description:
      "Binary annotation indicating the presence (1) or absence (0) of threats or incitement to physical violence.",
  },
  {
    name: "Insults",
    description:
      "Binary annotation indicating whether the text contains insults or derogatory expressions (1) or not (0).",
  },
  {
    name: "Identity_attack",
    description:
      "Binary label indicating whether the text attacks individuals or groups based on protected identity attributes, such as ethnicity, religion, gender, disability, or sexual orientation.",
  },
  {
    name: "Sexually_explicit",
    description:
      "Binary annotation indicating the presence (1) or absence (0) of sexually explicit content.",
  },
];

export const ANNOTATOR_TABLE_FEATURES: DatasetFeature[] = [
  {
    name: "Annotator_id",
    description:
      "Unique string identifier assigned to each annotator.",
  },
  {
    name: "Ethnicity",
    description:
      "Categorical attribute representing the ethnic background of the annotator.",
  },
  {
    name: "Religion",
    description:
      "Categorical attribute representing the religious affiliation of the annotator.",
  },
  {
    name: "Disability",
    description:
      "Binary attribute indicating whether the annotator has a disability (yes/no).",
  },
  {
    name: "Lgbt",
    description:
      "Binary attribute indicating whether the annotator identifies as part of the LGBTQ+ community (yes/no).",
  },
  {
    name: "Gender",
    description:
      "Categorical attribute representing the annotator's gender identity (F/M).",
  },
  {
    name: "Age",
    description:
      "Numerical attribute representing the age of the annotator.",
  },
  {
    name: "Domisili",
    description:
      "Categorical attribute representing the residential location or registered region of the annotator.",
  },
  {
    name: "Pendidikan Terakhir",
    description:
      "Categorical attribute representing the highest level of formal education completed by the annotator.",
  },
  {
    name: "Status Pekerjaan",
    description:
      "Categorical attribute representing the employment status of the annotator, such as employed, student, homemaker, or unemployed.",
  },
  {
    name: "President Vote Leaning",
    description:
      "Categorical attribute representing the annotator's presidential election preference (candidate 1/2/3 or abstention).",
  },
];
