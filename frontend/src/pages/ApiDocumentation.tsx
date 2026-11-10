import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { PageHeader, PlaceholderNotice, SectionHeading } from '@/components/ui/PageHeader';
import {
  ENDPOINT_DOCS,
  ERROR_EXAMPLES,
  REQUEST_FIELDS,
  RESPONSE_FIELDS_DOC,
  SUPPORTED_MODES,
  type FieldDoc,
} from '@/data/apiDocs';
import { cn } from '@/lib/utils';

const json = (value: unknown) => JSON.stringify(value, null, 2);

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={cn(
        'inline-flex min-w-[3.5rem] justify-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold',
        method === 'GET' ? 'bg-success/10 text-success' : 'bg-accent text-accent-foreground',
      )}
    >
      {method}
    </span>
  );
}

function FieldTable({ fields }: { fields: FieldDoc[] }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="px-4 py-3 font-medium">Field</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {fields.map((f) => (
            <tr key={f.name}>
              <td className="whitespace-nowrap px-4 py-3">
                <code className="font-mono text-xs font-semibold">{f.name}</code>
                {f.required && <span className="ml-2 text-xs text-destructive">required</span>}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{f.type}</td>
              <td className="px-4 py-3 text-muted-foreground">{f.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function CopyInline({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy base URL"
      className="inline-flex items-center gap-2 rounded-lg border bg-[hsl(var(--code-bg))] px-3 py-2 font-mono text-sm transition-colors hover:border-foreground/30"
    >
      {value}
      {copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Copy className="h-4 w-4 text-muted-foreground" aria-hidden />}
    </button>
  );
}

export default function ApiDocumentation() {
  return (
    <>
      <PageHeader
        eyebrow="API Documentation"
        title="Integrate with the ToxiLens API."
        description="REST endpoints exposed by the FastAPI backend for text-only and metadata-based toxicity prediction."
      />

      <div className="container space-y-16 py-12 sm:py-16">
        <PlaceholderNotice>
          <strong>Example contract.</strong> Endpoint paths and schemas shown here are placeholders and may not match the final backend. Paths live in{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs">src/config/api.ts</code>, examples in{' '}
          <code className="rounded bg-muted px-1 font-mono text-xs">src/data/apiDocs.ts</code>.
        </PlaceholderNotice>

        {/* Overview */}
        <section>
          <SectionHeading eyebrow="Overview" title="Base URL and conventions" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="space-y-4 p-6">
              <div>
                <p className="mb-2 text-sm font-medium">Configured base URL</p>
                <CopyInline value={API_BASE_URL} />
              </div>
              <p className="text-sm text-muted-foreground">
                Set <code className="rounded bg-muted px-1 font-mono text-xs">VITE_API_BASE_URL</code> in a <code className="rounded bg-muted px-1 font-mono text-xs">.env</code> file
                (see <code className="rounded bg-muted px-1 font-mono text-xs">.env.example</code>) and restart the dev server to change it.
              </p>
            </Card>
            <Card className="p-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  Requests and responses use <code className="rounded bg-muted px-1 font-mono text-xs">application/json</code>.
                </li>
                <li>Prediction endpoints use POST; the health check uses GET.</li>
                <li>Probabilities are floats between 0 and 1.</li>
                <li>Errors follow the FastAPI default format.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Endpoint table */}
        <section>
          <SectionHeading eyebrow="Endpoints" title="Available endpoints" />
          <Card className="divide-y">
            {ENDPOINT_DOCS.map((e) => (
              <div key={e.key} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <MethodBadge method={e.method} />
                <code className="font-mono text-sm font-medium">{e.path}</code>
                <span className="text-sm text-muted-foreground sm:ml-auto">{e.title}</span>
              </div>
            ))}
          </Card>
        </section>

        {/* Modes */}
        <section>
          <SectionHeading eyebrow="Models" title="Supported prediction modes" />
          <div className="grid gap-4 md:grid-cols-3">
            {SUPPORTED_MODES.map((m) => (
              <Card key={m.id} className="p-5">
                <h3 className="font-bold">{m.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                <code className="mt-4 inline-block rounded bg-muted px-2 py-1 font-mono text-xs">POST {m.endpoint}</code>
              </Card>
            ))}
          </div>
        </section>

        {/* Schemas */}
        <section>
          <SectionHeading eyebrow="Schemas" title="Request and response fields" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-bold">Request body</h3>
              <FieldTable fields={REQUEST_FIELDS} />
            </div>
            <div className="space-y-3">
              <h3 className="font-bold">Response body</h3>
              <FieldTable fields={RESPONSE_FIELDS_DOC} />
            </div>
          </div>
        </section>

        {/* Per endpoint examples */}
        <section className="space-y-10">
          <SectionHeading eyebrow="Examples" title="Requests and responses" className="mb-0" />
          {ENDPOINT_DOCS.map((e) => (
            <article key={e.key} className="space-y-4" aria-labelledby={`ep-${e.key}`}>
              <div className="flex flex-wrap items-center gap-3">
                <MethodBadge method={e.method} />
                <code className="font-mono text-sm font-medium">{e.path}</code>
                <Badge tone="outline">{e.title}</Badge>
              </div>
              <h3 id={`ep-${e.key}`} className="sr-only">
                {e.title}
              </h3>
              <p className="text-sm text-muted-foreground">{e.description}</p>
              <div className="grid gap-4 lg:grid-cols-2">
                {e.requestExample !== undefined && <CodeBlock title="Request body" code={json(e.requestExample)} />}
                <CodeBlock title="Response body" code={json(e.responseExample)} />
              </div>
              <CodeBlock language="bash" title="cURL" code={e.curl} />
            </article>
          ))}
        </section>

        {/* Errors */}
        <section>
          <SectionHeading eyebrow="Errors" title="Error responses" />
          <div className="grid gap-6 lg:grid-cols-2">
            {ERROR_EXAMPLES.map((err) => (
              <div key={err.id} className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{err.title}</h3>
                  <Badge tone="danger">{err.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{err.description}</p>
                <CodeBlock title="Response body" code={json(err.body)} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
