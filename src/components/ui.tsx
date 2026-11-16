import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`glass p-5 ${className}`}>{children}</div>;
}

export function StatCard({
  icon,
  label,
  value,
  sub,
  color = 'accent',
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: string;
  color?: 'accent' | 'gold' | 'success' | 'warning' | 'danger';
}) {
  const colorMap: Record<string, string> = {
    accent: 'text-accent-300 bg-accent-500/15',
    gold: 'text-gold-400 bg-gold-500/15',
    success: 'text-success-400 bg-success-500/15',
    warning: 'text-warning-400 bg-warning-500/15',
    danger: 'text-danger-400 bg-danger-500/15',
  };
  return (
    <div className="glass card-hover p-4 animate-fade-up">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-white">{value}</p>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
      <Loader2 className="h-7 w-7 animate-spin text-accent-400" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-500">{icon}</div>
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {hint && <p className="max-w-xs text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="glass border-danger-500/30 p-4 text-sm text-danger-400">
      {message}
    </div>
  );
}

export function Badge({ children, color = 'accent' }: { children: ReactNode; color?: string }) {
  const map: Record<string, string> = {
    accent: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
    gold: 'bg-gold-500/15 text-gold-400 border-gold-500/30',
    success: 'bg-success-500/15 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    danger: 'bg-danger-500/15 text-danger-400 border-danger-500/30',
    slate: 'bg-white/[0.06] text-slate-300 border-white/10',
  };
  return <span className={`chip border ${map[color] ?? map.accent}`}>{children}</span>;
}
