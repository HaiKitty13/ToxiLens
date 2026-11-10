import { Link } from 'react-router-dom';
import { NAV_ITEMS } from '@/config/navigation';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Machine learning-based Indonesian toxicity detection, developed for academic research purposes.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
          {NAV_ITEMS.map(({ to, label }) => (
            <Link key={to} to={to} className="text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t">
        <p className="container py-4 text-xs text-muted-foreground">
          Predictions are produced by research models and may be inaccurate. Not intended for automated moderation decisions.
        </p>
      </div>
    </footer>
  );
}
