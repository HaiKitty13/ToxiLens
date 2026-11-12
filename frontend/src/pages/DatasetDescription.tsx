
import { Badge, PlaceholderBadge } from '@/components/ui/Badge';
import { BarChartCard } from '@/components/charts/BarChartCard';
import { DonutChartCard } from '@/components/charts/DonutChartCard';
import { Card } from '@/components/ui/Card';
import {
  PageHeader,
  PlaceholderNotice,
  SectionHeading,
} from '@/components/ui/PageHeader';

import {
  ANNOTATION_STEPS,
  CATEGORY_DISTRIBUTION,
  DATASET_OVERVIEW,
  DATASET_STATS,
  DATA_SPLITS,
  LABEL_DISTRIBUTION,
  METADATA_CATEGORIES,
  PREPROCESSING_STEPS,
  TOXICITY_CATEGORIES,
  type MethodologyStep,
} from '@/data/dataset';

const fmt = (value: number | string | null) =>
  value === null ? (
    <PlaceholderBadge>TBD</PlaceholderBadge>
  ) : typeof value === 'number' ? (
    value.toLocaleString()
  ) : (
    value
  );

function Steps({ steps }: { steps: MethodologyStep[] }) {
  return (
    <ol className="space-y-5">
      {steps.map((step, i) => (
        <li key={`${step.title}-${i}`} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {i + 1}
          </span>

          <div className="min-w-0 pt-0.5">
            <p className="font-medium">{step.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function DatasetDescription() {
  return (
    <>
      <PageHeader
        eyebrow="Dataset Description"
        title="Understanding the dataset."
        description="An overview of IndoDiscourse, its toxicity annotation framework, annotator demographics, and the data preparation methodology used in this research."
      />

      <div className="container space-y-16 py-12 sm:py-16">

        {/* Overview and Statistics */}
        <section>
          <SectionHeading
            eyebrow="Overview"
            title="Dataset at a glance"
            description="Understanding the source, structure, and characteristics of the dataset used in this research."
          />

          <Card className="mb-6 p-6">
            <div className="flex items-center gap-2">
              <Badge tone="primary">IndoDiscourse</Badge>
              <span className="text-xs text-muted-foreground">
                Susanto et al. (2025)
              </span>
            </div>

            <div className="space-y-3 text-sm leading-7 text-muted-foreground">
              {DATASET_OVERVIEW.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-6 border-t pt-5">
              <p className="text-sm font-semibold">
                Dataset Reference
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Susanto et al. (2025). IndoDiscourse: An Indonesian
                discourse dataset enriched with toxicity, polarization,
                and annotator demographic information.
              </p>

              <a
                href="https://huggingface.co/datasets/Exqrch/IndoDiscourse"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                View IndoDiscourse on Hugging Face
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </Card>

          <div className="mb-4">
            <h3 className="text-sm font-semibold">
              Original Dataset Statistics
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Statistics refer to the original IndoDiscourse dataset,
              not the final processed dataset used in this research.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DATASET_STATS.map((stat) => (
              <Card key={stat.id} className="p-5">
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>

                <p className="mt-2 font-display text-3xl font-extrabold">
                  {fmt(stat.value)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.hint}
                </p>
              </Card>
            ))}
          </div>
        </section>


        {/* Dataset Modification */}
        <section>
          <SectionHeading
            eyebrow="Research Dataset"
            title="From Original to Research Dataset"
            description="The original IndoDiscourse dataset undergoes several modifications before being used in model development."
          />

          <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-2">

              {/* Original Dataset */}
              <div className="rounded-xl border p-5">
                <Badge tone="secondary">Original Dataset</Badge>

                <h3 className="mt-3 text-lg font-bold">
                  IndoDiscourse
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The original dataset introduced by Susanto et al.
                  (2025), containing Indonesian discourse texts,
                  initial toxicity annotations, and annotator
                  demographic information.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Original text samples</li>
                  <li>• Multiple annotator labels</li>
                  <li>• Annotator demographic information</li>
                  <li>• Initial toxicity annotations</li>
                </ul>
              </div>

              {/* Research Dataset */}
              <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
                <Badge tone="primary">Used in This Research</Badge>

                <h3 className="mt-3 text-lg font-bold">
                  Processed IndoDiscourse
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  A modified version of the original dataset after
                  annotation refinement, ambiguous sample handling,
                  metadata integration, and text preprocessing.
                </p>

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Finalized toxicity labels</li>
                  <li>• Re-annotated ambiguous samples</li>
                  <li>• Exclusion of highly ambiguous samples</li>
                  <li>• Integrated annotator metadata</li>
                  <li>• Preprocessed text data</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 border-t pt-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="text-foreground">
                  Important distinction:
                </strong>{" "}
                All model training and evaluation experiments in this
                research are conducted using the processed IndoDiscourse
                dataset, not the unmodified original dataset.
              </p>
            </div>
          </Card>
        </section>


        {/* Label Distribution */}
        <section>
          <SectionHeading
            eyebrow="Distribution"
            title="Labels and categories"
            description="An overview of the toxicity labels used in the two-stage classification framework."
          />

          {LABEL_DISTRIBUTION.length > 0 ||
          CATEGORY_DISTRIBUTION.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {LABEL_DISTRIBUTION.length > 0 ? (
                <DonutChartCard
                  title="Label Distribution"
                  description="Toxic vs. Non-Toxic samples (Stage 1)."
                  data={LABEL_DISTRIBUTION}
                />
              ) : (
                <Card className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
                  <PlaceholderBadge>Data Pending</PlaceholderBadge>
                  <h3 className="mt-3 font-semibold">
                    Label Distribution
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Toxic and Non-Toxic sample counts will appear
                    here after the final data processing.
                  </p>
                </Card>
              )}

              {CATEGORY_DISTRIBUTION.length > 0 ? (
                <BarChartCard
                  title="Category Distribution"
                  description="Samples per toxicity category (Stage 2)."
                  data={CATEGORY_DISTRIBUTION}
                />
              ) : (
                <Card className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
                  <PlaceholderBadge>Data Pending</PlaceholderBadge>
                  <h3 className="mt-3 font-semibold">
                    Category Distribution
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    The number of samples in each toxicity category
                    will appear here.
                  </p>
                </Card>
              )}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
                <PlaceholderBadge>Data Pending</PlaceholderBadge>
                <h3 className="mt-3 font-semibold">
                  Label Distribution
                </h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Toxic and Non-Toxic sample counts will appear here
                  after the final data processing.
                </p>
              </Card>

              <Card className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
                <PlaceholderBadge>Data Pending</PlaceholderBadge>
                <h3 className="mt-3 font-semibold">
                  Category Distribution
                </h3>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  The number of samples in each toxicity category
                  will appear here.
                </p>
              </Card>
            </div>
          )}
        </section>

        {/* Toxicity Categories and Data Splits */}
        <section className="grid gap-8 lg:grid-cols-2">

          {/* Stage 2 Categories */}
          <div>
            <SectionHeading
              eyebrow="Stage 2"
              title="Toxicity Categories"
              description="The six categories used for multi-label toxicity classification."
              className="mb-5"
            />

            <Card className="divide-y">
              {TOXICITY_CATEGORIES.map((category) => (
                <div
                  key={category.key}
                  className="flex items-start justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {category.label}
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {category.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <code className="max-w-36 break-all rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                      {category.key}
                    </code>

                    {category.confirmed && (
                      <Badge tone="success">Confirmed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Data Splits */}
          <div>
            <SectionHeading
              eyebrow="Splits"
              title="Data Splits"
              description="The distribution of samples across training, validation, and testing sets."
              className="mb-5"
            />

            <Card className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-4 py-3 font-medium">
                      Split
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Samples
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Toxic
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Non-Toxic
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {DATA_SPLITS.map((row) => (
                    <tr key={row.split}>
                      <td className="px-4 py-3 font-medium">
                        {row.split}
                      </td>

                      <td className="px-4 py-3">
                        {fmt(row.samples)}
                      </td>

                      <td className="px-4 py-3">
                        {fmt(row.toxic)}
                      </td>

                      <td className="px-4 py-3">
                        {fmt(row.nonToxic)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <p className="mt-3 text-xs text-muted-foreground">
              Split statistics will be updated based on the final
              experimental configuration.
            </p>
          </div>
        </section>

        {/* Annotator Metadata */}
        <section>
          <SectionHeading
            eyebrow="Annotator Metadata"
            title="Who labeled the data?"
            description="Each annotation is associated with information about the annotator. These demographic and background attributes provide additional context for investigating the influence of annotator characteristics on toxicity labeling."
          />

          <div className="mb-5 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              The metadata is obtained from the Annotator Table
              and linked to the corresponding text annotations
              through annotator identifiers. In this research,
              annotator metadata is incorporated as textual
              features alongside the original text.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {METADATA_CATEGORIES.map((metadata) => (
              <Card key={metadata.key} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">
                    {metadata.label}
                  </h3>

                  <code className="max-w-32 break-all rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                    {metadata.key}
                  </code>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {metadata.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <Badge tone="secondary">
                    Annotator Attribute
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section>
          <SectionHeading
            eyebrow="Methodology"
            title="Data preprocessing and annotation"
            description="The procedures applied to prepare the dataset and establish reliable toxicity labels before model training."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Preprocessing */}
            <Card className="p-6">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="primary">Preprocessing</Badge>
                </div>

                <h3 className="text-lg font-bold">
                  Data Preprocessing
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Preparing textual data and metadata for the
                  classification model.
                </p>
              </div>

              <Steps steps={PREPROCESSING_STEPS} />
            </Card>

            {/* Annotation */}
            <Card className="p-6">
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone="primary">Annotation</Badge>
                </div>

                <h3 className="text-lg font-bold">
                  Annotation Methodology
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Establishing final toxicity labels through
                  majority voting and additional re-annotation.
                </p>
              </div>

              <Steps steps={ANNOTATION_STEPS} />
            </Card>
          </div>
        </section>

        {/* Re-annotation Explanation */}
        <section>
          <SectionHeading
            eyebrow="Data Quality"
            title="Handling Ambiguous Labels"
            description="Additional procedures to ensure consistency and reliability in the final annotation labels."
          />

          <Card className="p-6">
            <div className="grid gap-6 md:grid-cols-3">

              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg font-bold text-accent-foreground">
                  01
                </div>

                <h3 className="font-semibold">
                  Majority Voting
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Multiple annotator labels are aggregated
                  to determine the final Toxic or Non-Toxic
                  classification.
                </p>
              </div>

              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg font-bold text-accent-foreground">
                  02
                </div>

                <h3 className="font-semibold">
                  Researcher Re-annotation
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Samples without a majority are reviewed
                  by three researchers, who provide additional
                  annotations based on the complete text context.
                </p>
              </div>

              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-lg font-bold text-accent-foreground">
                  03
                </div>

                <h3 className="font-semibold">
                  Ambiguous Data Removal
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Samples that remain highly ambiguous after
                  re-annotation are excluded to maintain
                  dataset quality and label consistency.
                </p>
              </div>

            </div>
          </Card>
        </section>

      </div>
    </>
  );
}
