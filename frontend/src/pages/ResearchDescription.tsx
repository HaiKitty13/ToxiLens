import { ArrowDown, ArrowRight, Check } from 'lucide-react';
import { Fragment } from 'react';
import { PlaceholderBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader, PlaceholderNotice, SectionHeading } from '@/components/ui/PageHeader';
import {
  APPROACH_COMPARISON,
  METADATA_MOTIVATION,
  RESEARCH_BACKGROUND,
  RESEARCH_CONTRIBUTIONS,
  RESEARCH_METHOD_STEPS,
  RESEARCH_OBJECTIVES,
  RESEARCH_PENDING,
  RESEARCH_PROBLEMS,
  type ResearchItem,
} from '@/data/research';

function NumberedCards({ items, columns = 'md:grid-cols-3' }: { items: ResearchItem[]; columns?: string }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {items.map((item, i) => (
        <Card key={item.title} className="p-6">
          <span className="font-display text-3xl font-extrabold text-primary/40">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="mt-3 font-bold">{item.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
        </Card>
      ))}
    </div>
  );
}

export default function ResearchDescription() {
  return (
    <>
      <PageHeader
        eyebrow="Research Description"
        title="Why annotator perspective matters."
        description="The academic motivation behind ToxiLens: detecting toxicity in Indonesian text while accounting for who is doing the labeling."
      />

      <div className="container space-y-20 py-12 sm:py-16">

        <section>
          <SectionHeading eyebrow="Background" title="Research background" />
          <div className="grid gap-4 md:grid-cols-2">
            {RESEARCH_BACKGROUND.map((p) => (
              <Card key={p} className="p-6">
                <p className="text-muted-foreground">{p}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Objectives" title="Research objectives" />
          <NumberedCards items={RESEARCH_OBJECTIVES} />
        </section>

        <section>
          <SectionHeading eyebrow="Problems" title="Research problems" />
          <NumberedCards items={RESEARCH_PROBLEMS} />
        </section>

        <section>
          <SectionHeading eyebrow="Methodology" title="Research methodology" />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
            {RESEARCH_METHOD_STEPS.map((step, i) => (
              <Fragment key={step.title}>
                <Card className="flex-1 p-5">
                  <span className="text-xs font-semibold text-primary">Step {i + 1}</span>
                  <h3 className="mt-1 font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </Card>
                {i < RESEARCH_METHOD_STEPS.length - 1 && (
                  <>
                    <ArrowDown className="mx-auto h-5 w-5 shrink-0 text-muted-foreground lg:hidden" aria-hidden />
                    <ArrowRight className="hidden h-5 w-5 shrink-0 self-center text-muted-foreground lg:block" aria-hidden />
                  </>
                )}
              </Fragment>
            ))}
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Motivation" title="Why include annotator metadata?" />
          <Card className="p-6">
            <ul className="space-y-3">
              {METADATA_MOTIVATION.map((m) => (
                <li key={m} className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="text-muted-foreground">{m}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="Comparison" title="Text-only vs. metadata-based" description="A qualitative comparison of the approaches. Quantitative results are not shown here." />
          <Card className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="px-4 py-3 font-medium" />
                  <th className="px-4 py-3 font-medium">Text-only</th>
                  <th className="px-4 py-3 font-medium">Metadata-based</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {APPROACH_COMPARISON.map((row) => (
                  <tr key={row.aspect}>
                    <td className="px-4 py-3 font-medium">{row.aspect}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.textOnly}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.metadata}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <section>
          <SectionHeading eyebrow="Contributions" title="Research contributions" />
          <NumberedCards items={RESEARCH_CONTRIBUTIONS} columns="sm:grid-cols-2 lg:grid-cols-4" />
        </section>

        <section>
          <SectionHeading eyebrow="Findings" title="Results and conclusions" />
          <Card className="border-dashed p-6">
            <PlaceholderBadge>Pending</PlaceholderBadge>
            <p className="mt-3 text-muted-foreground">No findings are shown yet. Still to be provided:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {RESEARCH_PENDING.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Card>
        </section>
      </div>
    </>
  );
}
