import { useEffect, useState } from 'react';
import { ClipboardCheck, Battery, Moon, Brain, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { Card, SectionHeader, Spinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { formatDate } from '@/lib/constants';
import { createReadinessLog, fetchReadinessLogs } from '@/lib/api';
import type { ReadinessLog } from '@/lib/types';

const FITNESS_OPTIONS = ['Segar & Prima', 'Cukup Bugar', 'Sedikit Lelah', 'Lelah / Pegal', 'Sakit'];

function riskScore(fitness: string, sleep: number, stress: number): { label: string; color: 'success' | 'warning' | 'danger' } {
  let s = 0;
  if (fitness === 'Lelah / Pegal') s += 2;
  if (fitness === 'Sakit') s += 3;
  if (fitness === 'Sedikit Lelah') s += 1;
  if (sleep < 6) s += 2;
  else if (sleep < 7) s += 1;
  if (stress >= 8) s += 2;
  else if (stress >= 6) s += 1;
  if (s >= 4) return { label: 'Risiko Tinggi — disarankan recovery aktif', color: 'danger' };
  if (s >= 2) return { label: 'Risiko Sedang — kurangi intensitas', color: 'warning' };
  return { label: 'Aman berlatih penuh', color: 'success' };
}

export default function ReadinessChecklist() {
  const { selected, loading: athLoading, error: athError } = useAthletes();
  const [logs, setLogs] = useState<ReadinessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [fitness, setFitness] = useState(FITNESS_OPTIONS[0]);
  const [sleep, setSleep] = useState(7);
  const [stress, setStress] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    if (!selected) {
      setLogs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setLogs(await fetchReadinessLogs(selected.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data kesiapan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (athLoading) return <Spinner label="Memuat…" />;
  if (athError) return <ErrorState message={athError} />;
  if (!selected) {
    return <EmptyState icon={<ClipboardCheck className="h-7 w-7" />} title="Pilih atlet dulu" hint="Gunakan pemilih atlet di kanan atas." />;
  }

  const risk = riskScore(fitness, sleep, stress);

  const submit = async () => {
    setSaving(true);
    setFormError(null);
    setSaved(false);
    try {
      await createReadinessLog({
        athlete_id: selected.id,
        check_date: date,
        fitness_status: fitness,
        sleep_hours: sleep,
        stress_level: stress,
        notes: notes.trim() || null,
      });
      setLogs(await fetchReadinessLogs(selected.id));
      setNotes('');
      setSaved(true);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Gagal menyimpan check-in');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Ceklis Kesiapan Harian"
        subtitle="Check-in singkat sebelum latihan untuk mencegah overtraining"
      />

      {error && <ErrorState message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Check-in form */}
        <Card>
          <h3 className="font-display font-bold text-white">Check-in Hari Ini</h3>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Tanggal</label>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div>
              <label className="label flex items-center gap-1.5"><Battery className="h-3.5 w-3.5" /> Status Kebugaran</label>
              <div className="flex flex-wrap gap-2">
                {FITNESS_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFitness(f)}
                    className={`chip border ${fitness === f ? 'border-accent-500/40 bg-accent-500/15 text-accent-300' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-soft p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-white"><Moon className="h-4 w-4 text-accent-300" /> Durasi Tidur Malam</span>
                <span className="font-display text-xl font-bold text-accent-300">{sleep} jam</span>
              </div>
              <input type="range" min={0} max={12} step={1} value={sleep} onChange={(e) => setSleep(Number(e.target.value))} className="mt-3 w-full" />
              <div className="mt-1 flex justify-between text-[10px] text-slate-500"><span>0j</span><span>6j</span><span>12j</span></div>
            </div>

            <div className="glass-soft p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold text-white"><Brain className="h-4 w-4 text-danger-400" /> Tingkat Stres / Beban Mental</span>
                <span className="font-display text-xl font-bold text-danger-400">{stress}/10</span>
              </div>
              <input type="range" min={1} max={10} step={1} value={stress} onChange={(e) => setStress(Number(e.target.value))} className="mt-3 w-full" />
              <div className="mt-1 flex justify-between text-[10px] text-slate-500"><span>Tenang</span><span>Sedang</span><span>Tekanan berat</span></div>
            </div>

            <div
              className={`rounded-xl border p-3 text-sm font-semibold ${
                risk.color === 'success'
                  ? 'border-success-500/30 bg-success-500/10 text-success-400'
                  : risk.color === 'warning'
                    ? 'border-warning-500/30 bg-warning-500/10 text-warning-400'
                    : 'border-danger-500/30 bg-danger-500/10 text-danger-400'
              }`}
            >
              {risk.label}
            </div>

            <div>
              <label className="label">Catatan (opsional)</label>
              <textarea className="input min-h-[60px]" placeholder="mis. otot paha masih pegal setelah sparring kemarin" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{formError}</span>
              </div>
            )}
            {saved && (
              <div className="flex items-start gap-2 rounded-xl border border-success-500/30 bg-success-500/10 p-3 text-sm text-success-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><span>Check-in tersimpan.</span>
              </div>
            )}

            <button onClick={submit} disabled={saving} className="btn-primary w-full">
              <Save className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan Check-in'}
            </button>
          </div>
        </Card>

        {/* History */}
        <div>
          <SectionHeader title="Riwayat Check-in" subtitle="14 kesiapan terakhir" />
          {loading ? (
            <Spinner label="Memuat…" />
          ) : logs.length === 0 ? (
            <Card>
              <EmptyState icon={<ClipboardCheck className="h-7 w-7" />} title="Belum ada check-in" hint="Isi check-in pertama untuk mulai memantau kesiapan harian." />
            </Card>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 14).map((l) => {
                const r = riskScore(l.fitness_status, Number(l.sleep_hours ?? 0), l.stress_level ?? 5);
                return (
                  <Card key={l.id} className="card-hover flex flex-wrap items-center justify-between gap-2 !p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{formatDate(l.check_date)}</p>
                      <p className="text-[11px] text-slate-400">
                        {l.fitness_status} · tidur {l.sleep_hours ?? '-'} jam · stres {l.stress_level ?? '-'}/10
                      </p>
                      {l.notes && <p className="mt-0.5 text-[11px] text-slate-500">"{l.notes}"</p>}
                    </div>
                    <Badge color={r.color}>{r.color === 'success' ? 'Aman' : r.color === 'warning' ? 'Waspada' : 'Tinggi'}</Badge>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
