import { Badge, PlaceholderBadge } from '@/components/ui/Badge';
import { BarChartCard } from '@/components/charts/BarChartCard';
import { DonutChartCard } from '@/components/charts/DonutChartCard';
import { Card } from '@/components/ui/Card';
import { PageHeader, PlaceholderNotice, SectionHeading } from '@/components/ui/PageHeader';
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
  value === null ? <PlaceholderBadge>TBD</PlaceholderBadge> : typeof value === 'number' ? value.toLocaleString() : value;

function Steps({ steps }: { steps: MethodologyStep[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={`${step.title}-${i}`} className="flex gap-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="font-medium">{step.title}</p>
            {step.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            ) : (
              <p className="mt-1 text-sm italic text-muted-foreground">Description not provided yet.</p>
            )}
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
        title="The data behind the model."
        description="An overview of the Indonesian toxicity dataset: its size, label distribution, toxicity categories and the annotator metadata attached to each label."
      />

      <div className="container space-y-16 py-12 sm:py-16">
        <PlaceholderNotice>
          <strong>Dataset figures are pending.</strong> Items marked <PlaceholderBadge>TBD</PlaceholderBadge> are placeholders — no statistics have been invented.
          Update <code className="rounded bg-muted px-1 font-mono text-xs">src/data/dataset.ts</code> and this page will fill in automatically.
        </PlaceholderNotice>

        {/* Overview + stats */}
        <section>
          <SectionHeading eyebrow="Overview" title="Dataset at a glance" />
          <Card className="mb-6 p-6">
            {DATASET_OVERVIEW ? (
              <p className="text-muted-foreground">{DATASET_OVERVIEW}</p>
            ) : (
              <p className="text-muted-foreground">
                <PlaceholderBadge>Overview pending</PlaceholderBadge>{' '}
                <span className="ml-1">A short description of how the dataset was built and what it contains will appear here.</span>
              </p>
            )}
          </Card>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DATASET_STATS.map((stat) => (
              <Card key={stat.id} className="p-5">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold">{fmt(stat.value)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Charts */}
        <section>
          <SectionHeading eyebrow="Distribution" title="Labels and categories" />
          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChartCard title="Label distribution" description="Toxic vs. non-toxic samples (Stage 1)." data={LABEL_DISTRIBUTION} />
            <BarChartCard title="Category distribution" description="Samples per toxicity category (Stage 2)." data={CATEGORY_DISTRIBUTION} />
          </div>
        </section>

        {/* Categories + splits */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Stage 2" title="Toxicity categories" className="mb-5" />
            <Card className="divide-y">
              {TOXICITY_CATEGORIES.map((c) => (
                <div key={c.key} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{c.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{c.description ?? 'Definition not provided yet.'}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{c.key}</code>
                    {!c.confirmed && <PlaceholderBadge>Confirm name</PlaceholderBadge>}
                  </div>
                </div>
              ))}
            </Card>
            <p className="mt-3 text-xs text-muted-foreground">
              Category names are taken from the example API response and may differ from the final label set.
            </p>
          </div>

          <div>
            <SectionHeading eyebrow="Splits" title="Data splits" className="mb-5" />
            <Card className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Split</th>
                    <th className="px-4 py-3 font-medium">Samples</th>
                    <th className="px-4 py-3 font-medium">Toxic</th>
                    <th className="px-4 py-3 font-medium">Non-toxic</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {DATA_SPLITS.map((row) => (
                    <tr key={row.split}>
                      <td className="px-4 py-3 font-medium">{row.split}</td>
                      <td className="px-4 py-3">{fmt(row.samples)}</td>
                      <td className="px-4 py-3">{fmt(row.toxic)}</td>
                      <td className="px-4 py-3">{fmt(row.nonToxic)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* Metadata */}
        <section>
          <SectionHeading
            eyebrow="Annotator metadata"
            title="Who labeled the data"
            description="Each label is linked to information about the annotator. The metadata-based models use this to account for annotator perspective."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {METADATA_CATEGORIES.map((m) => (
              <Card key={m.key} className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold">{m.label}</h3>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{m.key}</code>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {m.values ? (
                    m.values.map((v) => (
                      <Badge key={v} tone="primary">
                        {v}
                      </Badge>
                    ))
                  ) : (
                    <PlaceholderBadge>Categories TBD</PlaceholderBadge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Methodology */}
        <section>
          <SectionHeading eyebrow="Methodology" title="Preprocessing and annotation" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-5 text-lg font-bold">Data preprocessing</h3>
              <Steps steps={PREPROCESSING_STEPS} />
            </Card>
            <Card className="p-6">
              <h3 className="mb-5 text-lg font-bold">Annotation methodology</h3>
              <Steps steps={ANNOTATION_STEPS} />
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
