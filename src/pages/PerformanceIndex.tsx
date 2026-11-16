import { useState } from 'react';
import {
  Dumbbell, Swords, Brain, Heart, Save, Plus, History, ChevronRight, X,
} from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { useAthleteData } from '@/lib/use-athlete-data';
import { Card, SectionHeader, Spinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { PILLARS, EXTERNAL_FACTORS, INTERNAL_FACTORS, formatDate } from '@/lib/constants';
import { createAssessment } from '@/lib/api';
import type { PerformanceAssessment } from '@/lib/types';

const ICONS: Record<string, typeof Dumbbell> = {
  Dumbbell, Swords, Brain, Heart,
};

const colorBar: Record<string, string> = {
  accent: 'bg-accent-500',
  gold: 'bg-gold-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

export default function PerformanceIndex() {
  const { selected } = useAthletes();
  const { assessments, loading, error, reload } = useAthleteData();
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState({ physical: 50, technique: 50, tactical: 50, psychological: 50 });
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [externalNotes, setExternalNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  if (!selected) {
    return <EmptyState icon={<Brain className="h-7 w-7" />} title="Pilih atlet dulu" hint="Gunakan pemilih atlet di kanan atas." />;
  }

  const submit = async () => {
    setSaving(true);
    try {
      await createAssessment({
        athlete_id: selected.id,
        assessment_date: date,
        physical_score: scores.physical,
        technique_score: scores.technique,
        tactical_score: scores.tactical,
        psychological_score: scores.psychological,
        external_notes: externalNotes.trim() || null,
        internal_notes: internalNotes.trim() || null,
      });
      setScores({ physical: 50, technique: 50, tactical: 50, psychological: 50 });
      setExternalNotes('');
      setInternalNotes('');
      setOpen(false);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const latest = assessments[0];
  const overall = latest
    ? Math.round((latest.physical_score + latest.technique_score + latest.tactical_score + latest.psychological_score) / 4)
    : null;

  const scoreColor = (v: number) => (v >= 80 ? 'success' : v >= 60 ? 'accent' : v >= 40 ? 'warning' : 'danger');

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Indeks Struktur Prestasi"
        subtitle="Model Schroeter & Bauersfeld — 4 pilar + faktor internal/eksternal"
        action={
          <div className="flex gap-2">
            {assessments.length > 0 && (
              <button onClick={() => setHistoryOpen(true)} className="btn-ghost text-xs">
                <History className="h-3.5 w-3.5" /> Riwayat
              </button>
            )}
            <button onClick={() => setOpen(true)} className="btn-primary text-xs">
              <Plus className="h-4 w-4" /> Asesmen
            </button>
          </div>
        }
      />

      {error && <ErrorState message={error} />}

      {loading ? (
        <Spinner label="Memuat asesmen…" />
      ) : latest ? (
        <>
          {/* Overall score ring */}
          <Card className="relative overflow-hidden">
            <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-accent-500/10 blur-3xl" />
            <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="44" fill="none" stroke="#25a4ff" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(overall! / 100) * 276} 276`}
                    />
                  </svg>
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold text-white">{overall}</p>
                    <p className="text-[10px] text-slate-400">skor</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Skor Total Prestasi</p>
                  <p className="font-display text-lg font-bold text-white">
                    {overall! >= 80 ? 'Sangat Baik' : overall! >= 60 ? 'Baik' : overall! >= 40 ? 'Cukup' : 'Perlu Perbaikan'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Asesmen {formatDate(latest.assessment_date)}</p>
                </div>
              </div>
              <Badge color={scoreColor(overall!)}>Rata-rata {overall}/100</Badge>
            </div>
          </Card>

          {/* Pillars */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PILLARS.map((p) => {
              const val =
                p.key === 'physical' ? latest.physical_score :
                p.key === 'technique' ? latest.technique_score :
                p.key === 'tactical' ? latest.tactical_score : latest.psychological_score;
              const Icon = ICONS[p.icon] ?? Dumbbell;
              return (
                <Card key={p.key} className="card-hover">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-${p.color}-500/15 text-${p.color}-300`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{p.name}</h3>
                        <Badge color={scoreColor(val)}>{val}/100</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{p.description}</p>
                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${colorBar[p.color]} transition-all`} style={{ width: `${val}%` }} />
                      </div>
                      <ul className="mt-3 space-y-1">
                        {p.subFactors.map((s) => (
                          <li key={s} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className={`h-1 w-1 rounded-full bg-${p.color}-400`} /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* External & Internal factors */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <h3 className="font-display font-bold text-white">Faktor Eksternal</h3>
              <p className="mt-1 text-xs text-slate-400">Sarana & sistem kompetisi yang memengaruhi prestasi</p>
              <ul className="mt-3 space-y-2">
                {EXTERNAL_FACTORS.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" /> {f}
                  </li>
                ))}
              </ul>
              {latest.external_notes && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-slate-300">
                  <p className="mb-1 font-semibold text-slate-400">Catatan asesmen:</p>
                  {latest.external_notes}
                </div>
              )}
            </Card>
            <Card>
              <h3 className="font-display font-bold text-white">Faktor Internal Atlet</h3>
              <p className="mt-1 text-xs text-slate-400">Kondisi pribadi atlet yang memengaruhi prestasi</p>
              <ul className="mt-3 space-y-2">
                {INTERNAL_FACTORS.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" /> {f}
                  </li>
                ))}
              </ul>
              {latest.internal_notes && (
                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-slate-300">
                  <p className="mb-1 font-semibold text-slate-400">Catatan asesmen:</p>
                  {latest.internal_notes}
                </div>
              )}
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <EmptyState
            icon={<Brain className="h-7 w-7" />}
            title="Belum ada asesmen prestasi"
            hint="Lakukan asesmen pertama untuk memetakan kekuatan & kelemahan 4 pilar atlet."
          />
          <button onClick={() => setOpen(true)} className="btn-primary mx-auto mt-2 flex">
            <Plus className="h-4 w-4" /> Mulai Asesmen
          </button>
        </Card>
      )}

      {/* Assessment modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Asesmen Struktur Prestasi" size="lg">
        <div className="space-y-5">
          <div>
            <label className="label">Tanggal Asesmen</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {PILLARS.map((p) => {
            const key = p.key as keyof typeof scores;
            return (
              <div key={p.key} className="glass-soft p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{p.name}</span>
                  <span className="font-display text-lg font-bold text-accent-300">{scores[key]}/100</span>
                </div>
                <input
                  type="range" min={0} max={100} step={5}
                  value={scores[key]}
                  onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
                  className="mt-3 w-full"
                />
                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>Lemah</span><span>Cukup</span><span>Baik</span><span>Optimal</span>
                </div>
              </div>
            );
          })}
          <div>
            <label className="label">Catatan Faktor Eksternal (opsional)</label>
            <textarea className="input min-h-[60px]" placeholder="Sarana, kompetisi, dukungan organisasi…"
              value={externalNotes} onChange={(e) => setExternalNotes(e.target.value)} />
          </div>
          <div>
            <label className="label">Catatan Faktor Internal (opsional)</label>
            <textarea className="input min-h-[60px]" placeholder="Gizi, tidur, riwayat cedera…"
              value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
          </div>
          <button onClick={submit} disabled={saving} className="btn-primary w-full">
            <Save className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan Asesmen'}
          </button>
        </div>
      </Modal>

      {/* History modal */}
      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Riwayat Asesmen" size="lg">
        <div className="space-y-3">
          {assessments.map((a: PerformanceAssessment) => {
            const avg = Math.round((a.physical_score + a.technique_score + a.tactical_score + a.psychological_score) / 4);
            return (
              <div key={a.id} className="glass-soft p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">{formatDate(a.assessment_date)}</p>
                  <Badge color={scoreColor(avg)}>{avg}/100</Badge>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[
                    { l: 'Fisik', v: a.physical_score },
                    { l: 'Teknik', v: a.technique_score },
                    { l: 'Taktik', v: a.tactical_score },
                    { l: 'Psik', v: a.psychological_score },
                  ].map((x) => (
                    <div key={x.l} className="text-center">
                      <p className="text-[10px] text-slate-400">{x.l}</p>
                      <p className="font-bold text-white">{x.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
