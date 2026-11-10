import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

/** Large page intro used at the top of every page. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="relative border-b">
      <div className="bg-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="container relative animate-fade-up py-12 sm:py-16">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-accent-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          {eyebrow}
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </header>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn('mb-8 max-w-2xl', className)}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}
      <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Notice banner for content that still needs to be supplied. */
export function PlaceholderNotice({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-dashed border-warning/60 bg-warning/10 p-4 text-sm">
      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-warning" aria-hidden />
      <div className="text-foreground/90">{children}</div>
    </div>
  );
}
