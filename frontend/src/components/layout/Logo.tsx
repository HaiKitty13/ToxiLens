import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground', className)}>
      <svg viewBox="0 0 32 32" fill="none" className="h-5 w-5" aria-hidden>
        <circle cx="15" cy="15" r="6.5" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="15" cy="15" r="1.9" fill="currentColor" />
        <path d="M20 20l5 5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-lg font-extrabold tracking-tight">ToxiLens</span>
    </span>
  );
}
