import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: 'json' | 'bash' | 'text';
  title?: string;
  className?: string;
}

const JSON_TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}[\],:]/g;

/** Minimal JSON syntax highlighter that emits themed token spans. */
function highlightJson(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const match of code.matchAll(JSON_TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(code.slice(last, index));
    const [full, str, colon, literal] = match;
    if (str !== undefined) {
      nodes.push(
        <span key={i++} className={colon ? 'tok-key' : 'tok-string'}>
          {str}
        </span>,
      );
      if (colon) {
        nodes.push(
          <span key={i++} className="tok-punct">
            {colon}
          </span>,
        );
      }
    } else if (literal !== undefined) {
      nodes.push(
        <span key={i++} className="tok-literal">
          {full}
        </span>,
      );
    } else if (/^[{}[\],:]$/.test(full)) {
      nodes.push(
        <span key={i++} className="tok-punct">
          {full}
        </span>,
      );
    } else {
      nodes.push(
        <span key={i++} className="tok-number">
          {full}
        </span>,
      );
    }
    last = index + full.length;
  }
  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}

export function CodeBlock({ code, language = 'json', title, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await copyToClipboard(code)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-[hsl(var(--code-bg))]', className)}>
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">{title ?? language}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6">
        <code>{language === 'json' ? highlightJson(code) : code}</code>
      </pre>
    </div>
  );
}
