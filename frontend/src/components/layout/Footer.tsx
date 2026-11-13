
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { NAV_ITEMS } from '@/config/navigation';
import { Logo } from './Logo';

const AUTHORS = [
  {
    name: 'Evelyn Caristy Untariady',
    email: 'evelyn.untariady@example.com',
  },
  {
    name: 'Audrey Theodora Phang',
    email: 'audrey.phang@example.com',
  },
  {
    name: 'Ni Komang Gayatri Kusuma Wardhani',
    email: 'ni.komang.gayatri@example.com',
  },
];

const CONTACT_EMAIL = 'research.email@example.com';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto grid grid-cols-1 gap-8 py-10 md:grid-cols-[1fr_auto_1fr]">
        {/* Research Description */}
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Machine learning-based Indonesian toxicity detection,
            developed for academic research purposes.
          </p>
        </div>

        
      {/* Research Team */}
      <div className="space-y-4 md:justify-self-center">
        <h3 className=" text-sm font-semibold">Research Team</h3>

        <div className="space-y-3">
          {AUTHORS.map((author) => (
            <div key={author.email} className="space-y-1">
              <p className="text-sm font-medium">{author.name}</p>
              <a
                href={`mailto:${author.email}`}
                className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                {author.email}
              </a>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Bina Nusantara University
        </p>
      </div>


        {/* Navigation */}
        <nav aria-label="Footer" className="space-y-3 md:justify-self-end">
          <h3 className="text-sm font-semibold">Explore</h3>
          <div className="flex flex-col gap-2 text-sm">
            {NAV_ITEMS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Bottom Footer */}
      <div className="border-t">
        <div className="container flex flex-col items-center gap-2 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Predictions are produced by research models and may be
            inaccurate. Not intended for automated moderation decisions.
          </p>

          <p className="text-xs text-muted-foreground">
            © 2026 Indonesian Toxicity Detection Research
          </p>
        </div>
      </div>
    </footer>
  );
}
