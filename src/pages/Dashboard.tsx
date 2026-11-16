import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock, Trophy, Activity, Dumbbell, ClipboardList, Flame, HeartPulse,
  CalendarPlus, ArrowRight, Swords, CalendarDays,
} from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { useAthleteData } from '@/lib/use-athlete-data';
import { Card, SectionHeader, Spinner, EmptyState, StatCard, ErrorState } from '@/components/ui';
import { TargetModal, TargetList } from '@/components/TargetComponents';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import { PHASES, daysUntil, weeksUntil, computePhaseWindows, currentPhase, formatDate } from '@/lib/constants';
import { PhaseBadge } from '@/lib/phase-ui';
import type { PhaseKey } from '@/lib/types';

export default function Dashboard() {
  const { selected, athletes, loading: athLoading, error: athError } = useAthletes();
  const { targets, assessments, trainingLogs, rpeLogs, injuryLogs, loading, error, reload } = useAthleteData();
  const [targetOpen, setTargetOpen] = useState(false);

  if (athLoading) return <Spinner label="Memuat data atlet…" />;
  if (athError) return <ErrorState message={athError} />;
  if (!selected) {
    return (
      <EmptyState
        icon={<Swords className="h-7 w-7" />}
        title="Belum ada atlet"
        hint="Tambahkan atlet lewat pemilih atlet di kanan atas untuk mulai mengelola periodisasi latihan."
      />
    );
  }

  const nearest = targets[0];
  const dleft = nearest ? daysUntil(nearest.target_date) : null;
  const wleft = nearest ? weeksUntil(nearest.target_date) : null;
  const windows = nearest ? computePhaseWindows(nearest.target_date) : [];
  const curPhase: PhaseKey | null = windows.length ? currentPhase(windows) : null;
  const latest = assessments[0];

  const avgRpe = rpeLogs.length
    ? Math.round((rpeLogs.reduce((s, r) => s + r.rpe_value, 0) / rpeLogs.length) * 10) / 10
    : null;
  const totalLoad = rpeLogs.reduce((s, r) => s + (r.session_load ?? r.rpe_value * r.duration_minutes), 0);
  const activeInjuries = injuryLogs.filter((i) => i.status === 'Aktif');

  const quickLinks = [
    { to: '/prestasi', label: 'Indeks Prestasi', icon: Activity, desc: 'Penilaian 4 pilar struktur prestasi', color: 'accent' },
    { to: '/periodisasi', label: 'Periodisasi', icon: CalendarClock, desc: 'Pentahapan menuju puncak performa', color: 'gold' },
    { to: '/program', label: 'Program Latihan', icon: Dumbbell, desc: 'Mikro/meso/makro siklus & menu bank', color: 'warning' },
    { to: '/log', label: 'Log Atlet', icon: ClipboardList, desc: 'RPE harian, beban & rekam cedera', color: 'danger' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Hero countdown */}
      <Card className="relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Selamat datang</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">{selected.name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {selected.category === 'Seni' ? `Seni ${selected.sub_category ?? ''}`.trim() : 'Tanding'} ·{' '}
                {selected.belt_level} · {athletes.length} atlet terdaftar
              </p>
            </div>
            <button onClick={() => setTargetOpen(true)} className="btn-gold">
              <CalendarPlus className="h-4 w-4" /> Target Baru
            </button>
          </div>

          {nearest ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="glass-soft p-4">
                <div className="flex items-center gap-2 text-slate-400"><CalendarClock className="h-4 w-4" /><span className="text-xs">Hari lagi</span></div>
                <p className="mt-1 font-display text-3xl font-bold text-white">{dleft}</p>
              </div>
              <div className="glass-soft p-4">
                <div className="flex items-center gap-2 text-slate-400"><Trophy className="h-4 w-4" /><span className="text-xs">Minggu</span></div>
                <p className="mt-1 font-display text-3xl font-bold text-white">{wleft}</p>
              </div>
              <div className="glass-soft p-4 col-span-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Tahap Aktif</span>
                  {curPhase && <PhaseBadge phase={curPhase} />}
                </div>
                <p className="mt-1 truncate font-display text-lg font-bold text-white">
                  {curPhase ? PHASES[curPhase].name : '—'}
                </p>
                <p className="truncate text-xs text-slate-400">{curPhase ? PHASES[curPhase].focus : 'Belum berjalan'}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 glass-soft flex items-center gap-3 p-4">
              <CalendarDays strokeWidth={2.75} className="h-5 w-5 text-gold-400" />
              <p className="text-sm text-slate-300">
                Atur target tanggal kejuaraan agar sistem menghitung jadwal kondisi puncak secara otomatis.
              </p>
              <button onClick={() => setTargetOpen(true)} className="btn-ghost ml-auto shrink-0 text-xs">Atur sekarang</button>
            </div>
          )}
        </div>
      </Card>

      {error && <ErrorState message={error} />}

      {loading ? (
        <Spinner label="Memuat ringkasan…" />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard icon={<Flame className="h-5 w-5" />} label="Rata-rata RPE" value={avgRpe ?? '—'} sub={rpeLogs.length ? `${rpeLogs.length} sesi tercatat` : 'belum ada data'} color="warning" />
            <StatCard icon={<Dumbbell className="h-5 w-5" />} label="Total Beban (AU)" value={totalLoad.toLocaleString('id-ID')} sub="akumulasi session load" color="accent" />
            <StatCard icon={<Activity className="h-5 w-5" />} label="Log Latihan" value={trainingLogs.length} sub="sesi tercatat" color="gold" />
            <StatCard icon={<HeartPulse className="h-5 w-5" />} label="Cedera Aktif" value={activeInjuries.length} sub={activeInjuries.length ? 'perlu perhatian' : 'sehat'} color={activeInjuries.length ? 'danger' : 'success'} />
          </div>

          {/* Quick links */}
          <div>
            <SectionHeader
              title="Modul Aplikasi"
              subtitle="Akses cepat seluruh fitur periodisasi"
              action={<WhatsAppReportButton data={{ athlete: selected, phase: curPhase, rpeLogs, trainingLogs, assessment: latest, coachNotes: '' }} />}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {quickLinks.map((q) => (
                <Link key={q.to} to={q.to} className="glass card-hover group flex items-center gap-4 p-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${q.color}-500/15 text-${q.color}-300`}>
                    <q.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{q.label}</p>
                    <p className="truncate text-xs text-slate-400">{q.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-accent-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Two columns: targets + latest assessment */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <SectionHeader
                title="Target Kejuaraan"
                subtitle="Menentukan perhitungan kondisi puncak"
                action={<button onClick={() => setTargetOpen(true)} className="btn-ghost text-xs"><CalendarPlus className="h-3.5 w-3.5" /> Tambah</button>}
              />
              <TargetList targets={targets} onDeleted={reload} onAdd={() => setTargetOpen(true)} />
            </div>

            <div>
              <SectionHeader title="Penilaian Prestasi Terakhir" subtitle="Model Schroeter & Bauersfeld" />
              {latest ? (
                <Card>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">{formatDate(latest.assessment_date)}</p>
                    <Link to="/prestasi" className="text-xs font-semibold text-accent-300 hover:text-accent-200">Lihat detail →</Link>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      { label: 'Fisik', val: latest.physical_score, color: 'bg-accent-500' },
                      { label: 'Teknik', val: latest.technique_score, color: 'bg-gold-500' },
                      { label: 'Taktik', val: latest.tactical_score, color: 'bg-warning-500' },
                      { label: 'Psikologis', val: latest.psychological_score, color: 'bg-danger-500' },
                    ].map((p) => (
                      <div key={p.label} className="glass-soft p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{p.label}</span>
                          <span className="font-bold text-white">{p.val}/100</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full ${p.color}`} style={{ width: `${Math.min(100, p.val)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                <Card>
                  <EmptyState icon={<Activity className="h-7 w-7" />} title="Belum ada penilaian" hint="Mulai asesmen 4 pilar prestasi di modul Indeks Prestasi." />
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      <TargetModal open={targetOpen} onClose={() => setTargetOpen(false)} onSaved={reload} />
    </div>
  );
}
