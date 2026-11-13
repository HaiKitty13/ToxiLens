import { ArrowDown, ArrowRight, Check, Minus } from 'lucide-react';
import { Fragment } from 'react';
import { PlaceholderBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader, PlaceholderNotice, SectionHeading } from '@/components/ui/PageHeader';
import {
  ARCHITECTURE_CARDS,
  CHECKPOINT_TBD,
  ENCODER_STEPS,
  METADATA_INCORPORATION,
  PIPELINE,
  STAGES,
  SYSTEM_OVERVIEW,
  VARIANTS,
} from '@/data/model';

export default function ModelDescription() {
  return (
    <>
      <PageHeader
        eyebrow="Model Description"
        title="How ToxiLens classifies toxic language."
        description="A two-stage pipeline on top of Indonesian transformer encoders, available in text-only and metadata-aware variants."
      />

      <div className="container space-y-20 py-12 sm:py-16">
        {/* Overview + pipeline */}
        <section>
          <SectionHeading eyebrow="System overview" title="One pipeline, two stages" description={SYSTEM_OVERVIEW} />
          <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
            {PIPELINE.map((node, i) => (
              <Fragment key={node.id}>
                <Card className="flex-1 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <node.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-bold">{node.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{node.detail}</p>
                </Card>
                {i < PIPELINE.length - 1 && (
                  <>
                    <ArrowDown className="mx-auto h-5 w-5 shrink-0 text-muted-foreground lg:hidden" aria-hidden />
                    <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground lg:block" aria-hidden />
                  </>
                )}
              </Fragment>
            ))}
          </div>
        </section>

        {/* Stages */}
        <section>
          <SectionHeading eyebrow="Architecture" title="Two-stage classification" />
          <div className="grid gap-6 md:grid-cols-2">
            {STAGES.map((s) => (
              <Card key={s.stage} className="p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">{s.stage}</p>
                <h3 className="mt-2 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.task}</p>
                <dl className="mt-5 rounded-xl bg-muted px-4 py-3 text-sm">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Output</dt>
                  <dd className="mt-0.5 font-medium">{s.output}</dd>
                </dl>
                <ul className="mt-4 space-y-2 text-sm">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* Variants */}
        <section>
          <SectionHeading
            eyebrow="Model variants"
            title="Text-only vs. metadata-aware"
            description="All variants share the same two-stage design. They differ in what information goes in."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {VARIANTS.map((v) => (
              <Card key={v.id} className="p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <v.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{v.summary}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Variant</th>
                  <th className="px-4 py-3 font-medium">Input text</th>
                  <th className="px-4 py-3 font-medium">Annotator metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {VARIANTS.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-medium">{v.title}</td>
                    <td className="px-4 py-3">
                      <Check className="h-4 w-4 text-success" aria-label="Yes" />
                    </td>
                    <td className="px-4 py-3">
                      {v.metadata === 'None' ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Minus className="h-4 w-4" aria-hidden /> None
                        </span>
                      ) : (
                        v.metadata
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        {/* Metadata incorporation */}
        <section>
          <SectionHeading eyebrow="Annotator metadata" title="How metadata enters the prediction" description={METADATA_INCORPORATION.intro} />
          <div className="grid gap-4 md:grid-cols-3">
            {METADATA_INCORPORATION.steps.map((step, i) => (
              <Card key={step} className="p-5">
                <span className="font-display text-3xl font-extrabold text-primary/40">0{i + 1}</span>
                <p className="mt-2 text-sm">{step}</p>
              </Card>
            ))}
          </div>
          {/* <div className="mt-4">
            <PlaceholderNotice>
              <PlaceholderBadge>To be confirmed</PlaceholderBadge> <span className="ml-1">{METADATA_INCORPORATION.tbd}</span>
            </PlaceholderNotice>
          </div> */}
        </section>

        {/* Encoder */}
        <section>
          <SectionHeading
            eyebrow="Model architecture"
            title="IndoBERTweet and NusaBERT"
            description="Both are transformer encoders in the BERT family, specialised for Indonesian."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {ARCHITECTURE_CARDS.map((c) => (
              <Card key={c.title} className="p-6">
                <h3 className="text-lg font-bold">{c.title}</h3>
                <p className="mt-2 text-muted-foreground">{c.body}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-6 p-6">
            <h3 className="mb-5 font-bold">Inside the encoder</h3>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ENCODER_STEPS.map((s, i) => (
                <li key={s.title} className="rounded-xl bg-muted p-4">
                  <span className="text-xs font-semibold text-primary">Step {i + 1}</span>
                  <p className="mt-1 font-medium">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
                </li>
              ))}
            </ol>
          </Card>

          {/* <div className="mt-4">
            <PlaceholderNotice>
              <PlaceholderBadge>To be confirmed</PlaceholderBadge> <span className="ml-1">{CHECKPOINT_TBD}</span>
            </PlaceholderNotice>
          </div> */}
        </section>
      </div>
    </>
  );
}
