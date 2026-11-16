import { PHASES } from './constants';
import type { PhaseKey } from './types';

export function phaseColor(key: PhaseKey): string {
  return PHASES[key].color;
}

export function PhaseBadge({ phase }: { phase: PhaseKey }) {
  const info = PHASES[phase];
  const colorMap: Record<string, string> = {
    accent: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
    gold: 'bg-gold-500/15 text-gold-400 border-gold-500/30',
    warning: 'bg-warning-500/15 text-warning-400 border-warning-500/30',
    danger: 'bg-danger-500/15 text-danger-400 border-danger-500/30',
    success: 'bg-success-500/15 text-success-400 border-success-500/30',
  };
  return (
    <span className={`chip border ${colorMap[info.color]}`}>{info.short}</span>
  );
}
