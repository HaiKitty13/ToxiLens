import type { LucideIcon } from 'lucide-react';
import { BookOpen, Cpu, Database, ScanSearch, Terminal } from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Model Prediction', icon: ScanSearch },
  { to: '/model', label: 'Model Description', icon: Cpu },
  { to: '/dataset', label: 'Dataset Description', icon: Database },
  { to: '/research', label: 'Research Description', icon: BookOpen },
  { to: '/api', label: 'API Documentation', icon: Terminal },
];
