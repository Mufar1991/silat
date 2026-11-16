import { useState } from 'react';
import { CalendarClock, Trophy, Layers, Target, CheckCircle2, Circle, Info } from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { useAthleteData } from '@/lib/use-athlete-data';
import { Card, SectionHeader, Spinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { TargetModal, TargetList } from '@/components/TargetComponents';
import {
  PHASES, PHASE_ORDER, computePhaseWindows, currentPhase, daysUntil, formatDate,
} from '@/lib/constants';
import { PhaseBadge } from '@/lib/phase-ui';
import type { PhaseKey } from '@/lib/types';

export default function Periodization() {
  const { selected } = useAthletes();
  const { targets, loading, error, reload } = useAthleteData();
  const [targetOpen, setTargetOpen] = useState(false);

  if (!selected) {
    return <EmptyState icon={<CalendarClock className="h-7 w-7" />} title="Pilih atlet dulu" hint="Gunakan pemilih atlet di kanan atas." />;
  }

  const nearest = targets[0];
  const windows = nearest ? computePhaseWindows(nearest.target_date) : [];
  const curPhase: PhaseKey | null = windows.length ? currentPhase(windows) : null;
  const dleft = nearest ? daysUntil(nearest.target_date) : null;

  const colorClasses: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    accent: { bg: 'bg-accent-500/10', text: 'text-accent-300', border: 'border-accent-500/40', dot: 'bg-accent-400' },
    gold: { bg: 'bg-gold-500/10', text: 'text-gold-400', border: 'border-gold-500/40', dot: 'bg-gold-400' },
    warning: { bg: 'bg-warning-500/10', text: 'text-warning-400', border: 'border-warning-500/40', dot: 'bg-warning-400' },
    danger: { bg: 'bg-danger-500/10', text: 'text-danger-400', border: 'border-danger-500/40', dot: 'bg-danger-400' },
    success: { bg: 'bg-success-500/10', text: 'text-success-400', border: 'border-success-500/40', dot: 'bg-success-400' },
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Periodisasi & Pentahapan"
        subtitle="Penghitungan otomatis kondisi puncak menuju kejuaraan"
        action={<button onClick={() => setTargetOpen(true)} className="btn-primary text-xs"><Target className="h-4 w-4" /> Atur Target</button>}
      />

      {error && <ErrorState message={error} />}

      {loading ? (
        <Spinner label="Memuat periodisasi…" />
      ) : !nearest ? (
        <Card>
          <EmptyState
            icon={<Trophy className="h-7 w-7" />}
            title="Belum ada target kejuaraan"
            hint="Atur tanggal kejuaraan agar sistem menghitung pentahapan latihan dan jadwal kondisi puncak secara otomatis."
          />
          <button onClick={() => setTargetOpen(true)} className="btn-primary mx-auto mt-2 flex">
            <Target className="h-4 w-4" /> Tambah Target
          </button>
        </Card>
      ) : (
        <>
          {/* Peak performance summary */}
          <Card className="relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <div className="flex items-center gap-2 text-gold-400">
                  <Trophy className="h-5 w-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Peak Performance Target</span>
                </div>
                <h3 className="mt-1 font-display text-xl font-bold text-white">{nearest.name}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {formatDate(nearest.target_date)} {nearest.location ? `· ${nearest.location}` : ''}
                  {nearest.level ? ` · ${nearest.level}` : ''}
                </p>
                {curPhase && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-slate-400">Tahap aktif:</span>
                    <PhaseBadge phase={curPhase} />
                    <span className="text-xs text-slate-300">{PHASES[curPhase].name}</span>
                  </div>
                )}
              </div>
              <div className="glass-soft flex flex-col items-center justify-center p-4">
                <p className="font-display text-4xl font-bold text-white">{dleft}</p>
                <p className="text-xs text-slate-400">hari menuju puncak</p>
              </div>
            </div>
          </Card>

          {/* Phase timeline */}
          <div>
            <SectionHeader title="Garis Waktu Pentahapan" subtitle="Distribusi tahap berdasarkan total minggu menuju target" />
            <Card className="p-4 sm:p-5">
              {/* Progress bar */}
              <div className="mb-5 flex h-3 overflow-hidden rounded-full">
                {windows.map((w) => {
                  const info = PHASES[w.key];
                  const c = colorClasses[info.color];
                  return (
                    <div
                      key={w.key}
                      className={`${c.dot} transition-all`}
                      style={{ width: `${(w.weeks / windows.reduce((s, x) => s + x.weeks, 0)) * 100}%` }}
                      title={`${info.short} — ${w.weeks} minggu`}
                    />
                  );
                })}
              </div>

              <div className="space-y-3">
                {windows.map((w) => {
                  const info = PHASES[w.key];
                  const c = colorClasses[info.color];
                  const active = curPhase === w.key;
                  const past = curPhase ? PHASE_ORDER.indexOf(curPhase) > PHASE_ORDER.indexOf(w.key) : false;
                  return (
                    <div
                      key={w.key}
                      className={`rounded-xl border p-4 transition-all ${active ? `${c.border} ${c.bg} shadow-glow` : 'border-white/10 bg-white/[0.03]'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {past ? <CheckCircle2 className={`h-5 w-5 ${c.text}`} /> : active ? <Circle className={`h-5 w-5 ${c.text} fill-current`} /> : <Circle className="h-5 w-5 text-slate-600" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                              <h4 className="font-semibold text-white">{info.name}</h4>
                              {active && <Badge color={info.color}>Aktif</Badge>}
                            </div>
                            <span className="text-xs text-slate-400">{w.weeks} minggu · {formatDate(w.start.toISOString().slice(0, 10))} → {formatDate(w.end.toISOString().slice(0, 10))}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400">{info.description}</p>
                          <p className="mt-2 text-xs font-semibold text-slate-300">Fokus: {info.focus}</p>
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="glass-soft p-2.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu Fisik</p>
                              <ul className="mt-1 space-y-0.5">
                                {info.physicalMenu.slice(0, 3).map((m) => (
                                  <li key={m} className="text-[11px] text-slate-300">• {m}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="glass-soft p-2.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Menu Teknik</p>
                              <ul className="mt-1 space-y-0.5">
                                {info.techniqueMenu.slice(0, 3).map((m) => (
                                  <li key={m} className="text-[11px] text-slate-300">• {m}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Phase detail cards */}
          <div>
            <SectionHeader title="Detail Tahapan" subtitle="Rincian seluruh 5 tahap periodisasi" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PHASE_ORDER.map((key) => {
                const info = PHASES[key];
                const c = colorClasses[info.color];
                return (
                  <Card key={key} className={`card-hover ${c.bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className={`h-5 w-5 ${c.text}`} />
                        <span className={`text-xs font-bold ${c.text}`}>{info.short}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{info.duration}</span>
                    </div>
                    <h4 className="mt-2 font-display font-bold text-white">{info.name}</h4>
                    <p className="mt-1 text-xs text-slate-400">{info.description}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-300">
                      <Info className="h-3.5 w-3.5" /> {info.focus}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* All targets */}
          <div>
            <SectionHeader title="Semua Target Kejuaraan" />
            <TargetList targets={targets} onDeleted={reload} onAdd={() => setTargetOpen(true)} />
          </div>
        </>
      )}

      <TargetModal open={targetOpen} onClose={() => setTargetOpen(false)} onSaved={reload} />
    </div>
  );
}
