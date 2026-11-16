import { useState } from 'react';
import {
  ClipboardList, Flame, HeartPulse, Plus, Save, Activity, Heart,
  TrendingUp,
} from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { useAthleteData } from '@/lib/use-athlete-data';
import { Card, SectionHeader, Spinner, EmptyState, ErrorState, Badge, StatCard } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { PHASES, PHASE_ORDER, INTENSITY_LEVELS, formatDate } from '@/lib/constants';
import { PhaseBadge } from '@/lib/phase-ui';
import { createRpeLog, createTrainingLog, createInjuryLog, updateInjuryLog } from '@/lib/api';
import { WhatsAppReportButton } from '@/components/WhatsAppReportButton';
import type { PhaseKey, RpeLog, TrainingLog, InjuryLog } from '@/lib/types';

type LogTab = 'rpe' | 'training' | 'injury';

const RPE_LABELS = [
  { v: 1, label: 'Sangat Ringan' },
  { v: 3, label: 'Ringan' },
  { v: 5, label: 'Sedang' },
  { v: 7, label: 'Berat' },
  { v: 9, label: 'Sangat Berat' },
  { v: 10, label: 'Maksimal' },
];

const BODY_PARTS = [
  'Lutut', 'Pergelangan Kaki', 'Paha', 'Betis', 'Punggung', 'Bahu', 'Siku',
  'Pergelangan Tangan', 'Leher', 'Kepala', 'Paha Belakang (Hamstring)', 'Lainnya',
];
const INJURY_TYPES = ['Keseleo (Sprain)', 'Tegang Otot (Strain)', 'Memar (Contusion)', 'Nyeri Otot (DOMS)', 'Fraktur', 'Cedera Lain'];
const SEVERITIES = ['Ringan', 'Sedang', 'Berat'];
const INJURY_STATUS = ['Aktif', 'Pemulihan', 'Sembuh'];

export default function AthleteLogs() {
  const { selected } = useAthletes();
  const { rpeLogs, trainingLogs, injuryLogs, loading, error, reload } = useAthleteData();
  const [tab, setTab] = useState<LogTab>('rpe');

  const [rpeOpen, setRpeOpen] = useState(false);
  const [trainOpen, setTrainOpen] = useState(false);
  const [injuryOpen, setInjuryOpen] = useState(false);

  if (!selected) {
    return <EmptyState icon={<ClipboardList className="h-7 w-7" />} title="Pilih atlet dulu" hint="Gunakan pemilih atlet di kanan atas." />;
  }

  const avgRpe = rpeLogs.length ? rpeLogs.reduce((s, r) => s + r.rpe_value, 0) / rpeLogs.length : 0;
  const totalLoad = rpeLogs.reduce((s, r) => s + (r.session_load ?? r.rpe_value * r.duration_minutes), 0);
  const activeInjuries = injuryLogs.filter((i) => i.status === 'Aktif');

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Log & Perkembangan Atlet"
        subtitle="Pencatatan beban latihan (RPE), sesi, dan rekam cedera"
        action={
          <div className="flex flex-wrap gap-2">
            <WhatsAppReportButton
              data={{
                athlete: selected,
                phase: null,
                rpeLogs,
                trainingLogs,
                assessment: null,
                coachNotes: '',
              }}
            />
            {tab === 'rpe' && <button onClick={() => setRpeOpen(true)} className="btn-primary text-xs"><Plus className="h-4 w-4" /> Log RPE</button>}
            {tab === 'training' && <button onClick={() => setTrainOpen(true)} className="btn-primary text-xs"><Plus className="h-4 w-4" /> Log Latihan</button>}
            {tab === 'injury' && <button onClick={() => setInjuryOpen(true)} className="btn-primary text-xs"><Plus className="h-4 w-4" /> Catat Cedera</button>}
          </div>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Flame className="h-5 w-5" />} label="Rata-rata RPE" value={avgRpe ? avgRpe.toFixed(1) : '—'} sub={`${rpeLogs.length} sesi`} color="warning" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Total Beban (AU)" value={totalLoad.toLocaleString('id-ID')} color="accent" />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Sesi Latihan" value={trainingLogs.length} color="gold" />
        <StatCard icon={<HeartPulse className="h-5 w-5" />} label="Cedera Aktif" value={activeInjuries.length} color={activeInjuries.length ? 'danger' : 'success'} />
      </div>

      {error && <ErrorState message={error} />}

      {loading ? (
        <Spinner label="Memuat log…" />
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {([
              { k: 'rpe' as const, label: 'RPE & Beban', icon: Flame },
              { k: 'training' as const, label: 'Log Latihan', icon: Activity },
              { k: 'injury' as const, label: 'Rekam Cedera', icon: HeartPulse },
            ]).map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  tab === t.k ? 'bg-accent-500/15 text-accent-300 shadow-glow' : 'bg-white/[0.05] text-slate-400 hover:text-white'
                }`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {tab === 'rpe' && <RpeTab logs={rpeLogs} />}
          {tab === 'training' && <TrainingTab logs={trainingLogs} />}
          {tab === 'injury' && <InjuryTab logs={injuryLogs} onUpdated={reload} />}
        </>
      )}

      <RpeModal open={rpeOpen} onClose={() => setRpeOpen(false)} athleteId={selected.id} onSaved={reload} />
      <TrainingModal open={trainOpen} onClose={() => setTrainOpen(false)} athleteId={selected.id} onSaved={reload} />
      <InjuryModal open={injuryOpen} onClose={() => setInjuryOpen(false)} athleteId={selected.id} onSaved={reload} />
    </div>
  );
}

function RpeTab({ logs }: { logs: RpeLog[] }) {
  if (logs.length === 0)
    return <Card><EmptyState icon={<Flame className="h-7 w-7" />} title="Belum ada catatan RPE" hint="Catat RPE setelah sesi latihan untuk memantau beban & kelelahan." /></Card>;
  // weekly load chart (last 14 entries reversed)
  const recent = [...logs].slice(0, 14).reverse();
  const maxLoad = Math.max(...recent.map((r) => r.session_load ?? r.rpe_value * r.duration_minutes), 1);
  return (
    <div className="space-y-4">
      <Card>
        <h3 className="font-display font-bold text-white">Tren Beban Latihan (Session Load)</h3>
        <p className="mt-1 text-xs text-slate-400">Session Load = RPE × Durasi (menit) — 14 sesi terakhir</p>
        <div className="mt-4 flex h-40 items-end gap-1.5">
          {recent.map((r) => {
            const load = r.session_load ?? r.rpe_value * r.duration_minutes;
            const h = Math.max(4, (load / maxLoad) * 100);
            const rpeColor = r.rpe_value >= 8 ? 'bg-danger-500' : r.rpe_value >= 6 ? 'bg-warning-500' : 'bg-accent-500';
            return (
              <div key={r.id} className="group relative flex flex-1 flex-col items-center justify-end">
                <div className={`${rpeColor} w-full rounded-t-md transition-all`} style={{ height: `${h}%` }} title={`RPE ${r.rpe_value} · ${r.duration_minutes}m · ${load} AU`} />
                <span className="mt-1 hidden text-[9px] text-slate-500 sm:block">{new Date(r.log_date).getDate()}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <div className="space-y-2">
        {logs.map((r) => {
          const load = r.session_load ?? r.rpe_value * r.duration_minutes;
          const color = r.rpe_value >= 8 ? 'danger' : r.rpe_value >= 6 ? 'warning' : 'accent';
          return (
            <Card key={r.id} className="card-hover flex items-center justify-between gap-3 !p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl bg-${color}-500/15 text-${color}-300`}>
                  <span className="font-display text-lg font-bold leading-none">{r.rpe_value}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">RPE {r.rpe_value} · {r.duration_minutes} menit</p>
                  <p className="text-[11px] text-slate-400">{formatDate(r.log_date)} · Beban {load} AU</p>
                  {r.fatigue_notes && <p className="mt-0.5 text-[11px] text-slate-500">"{r.fatigue_notes}"</p>}
                </div>
              </div>
              <Badge color={color}>{RPE_LABELS.reduce((p, c) => Math.abs(c.v - r.rpe_value) < Math.abs(p.v - r.rpe_value) ? c : p).label}</Badge>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TrainingTab({ logs }: { logs: TrainingLog[] }) {
  if (logs.length === 0)
    return <Card><EmptyState icon={<Activity className="h-7 w-7" />} title="Belum ada log latihan" hint="Catat sesi latihan harian lengkap dengan fase, porsi fisik & teknik." /></Card>;
  return (
    <div className="space-y-2">
      {logs.map((l) => (
        <Card key={l.id} className="card-hover !p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PhaseBadge phase={l.phase as PhaseKey} />
              <span className="text-sm font-semibold text-white">{formatDate(l.log_date)}</span>
            </div>
            {l.intensity && <Badge color={l.intensity === 'Maksimal' ? 'danger' : l.intensity === 'Tinggi' ? 'warning' : 'accent'}>{l.intensity}</Badge>}
          </div>
          {l.description && <p className="mt-2 text-sm text-slate-300">{l.description}</p>}
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {l.session_type && <Badge color="slate">{l.session_type}</Badge>}
            {l.physical_minutes != null && l.physical_minutes > 0 && <Badge color="accent">Fisik {l.physical_minutes}m</Badge>}
            {l.technique_minutes != null && l.technique_minutes > 0 && <Badge color="gold">Teknik {l.technique_minutes}m</Badge>}
          </div>
        </Card>
      ))}
    </div>
  );
}
function InjuryTab({ logs, onUpdated }: { logs: InjuryLog[]; onUpdated: () => void }) {
  if (logs.length === 0)
    return <Card><EmptyState icon={<HeartPulse className="h-7 w-7" />} title="Tidak ada catatan cedera" hint="Catat setiap cedera untuk memantau pemulihan & mencegah kekambuhan." /></Card>;
  const statusColor = (s?: string | null) => s === 'Aktif' ? 'danger' : s === 'Pemulihan' ? 'warning' : 'success';
  const sevColor = (s?: string | null) => s === 'Berat' ? 'danger' : s === 'Sedang' ? 'warning' : 'accent';
  return (
    <div className="space-y-2">
      {logs.map((i) => (
        <Card key={i.id} className="card-hover !p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger-500/15 text-danger-400">
                <Heart className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{i.body_part}</p>
                <p className="text-[11px] text-slate-400">{formatDate(i.injury_date)}{i.injury_type ? ` · ${i.injury_type}` : ''}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <Badge color={sevColor(i.severity)}>{i.severity ?? 'Ringan'}</Badge>
              <Badge color={statusColor(i.status)}>{i.status ?? 'Aktif'}</Badge>
            </div>
          </div>
          {(i.treatment || i.recovery_notes) && (
            <div className="mt-2 space-y-1 text-xs text-slate-300">
              {i.treatment && <p><span className="text-slate-500">Penanganan:</span> {i.treatment}</p>}
              {i.recovery_notes && <p><span className="text-slate-500">Catatan pemulihan:</span> {i.recovery_notes}</p>}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            {INJURY_STATUS.map((s) => (
              <button key={s} onClick={async () => { await updateInjuryLog(i.id, { status: s }); onUpdated(); }}
                className={`chip border text-[11px] ${i.status === s ? 'border-accent-500/40 bg-accent-500/15 text-accent-300' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
function RpeModal({ open, onClose, athleteId, onSaved }: { open: boolean; onClose: () => void; athleteId: string; onSaved: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rpe, setRpe] = useState(5);
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const load = rpe * duration;

  const submit = async () => {
    setSaving(true);
    try {
      await createRpeLog({ athlete_id: athleteId, log_date: date, rpe_value: rpe, duration_minutes: duration, fatigue_notes: notes.trim() || null });
      setRpe(5); setDuration(60); setNotes('');
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Catat RPE & Beban Latihan" size="md">
      <div className="space-y-4">
        <div>
          <label className="label">Tanggal</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="glass-soft p-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white">RPE (1–10)</span>
            <span className="font-display text-2xl font-bold text-accent-300">{rpe}</span>
          </div>
          <input type="range" min={1} max={10} step={1} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="mt-3 w-full" />
          <div className="mt-1 flex justify-between text-[10px] text-slate-500">
            {RPE_LABELS.map((l) => <span key={l.v}>{l.v}</span>)}
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">{RPE_LABELS.reduce((p, c) => Math.abs(c.v - rpe) < Math.abs(p.v - rpe) ? c : p).label}</p>
        </div>
        <div>
          <label className="label">Durasi (menit)</label>
          <input type="number" min={1} className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </div>
        <div className="glass-soft flex items-center justify-between p-4">
          <span className="text-sm text-slate-400">Session Load (RPE × Durasi)</span>
          <span className="font-display text-xl font-bold text-gold-400">{load} AU</span>
        </div>
        <div>
          <label className="label">Catatan Kelelahan (opsional)</label>
          <textarea className="input min-h-[60px]" placeholder="Otot terasa berat, sulit fokus…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button onClick={submit} disabled={saving} className="btn-primary w-full"><Save className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan'}</button>
      </div>
    </Modal>
  );
}

function TrainingModal({ open, onClose, athleteId, onSaved }: { open: boolean; onClose: () => void; athleteId: string; onSaved: () => void }) {
  const [form, setForm] = useState({
    log_date: new Date().toISOString().slice(0, 10),
    phase: 'TPU' as PhaseKey,
    session_type: '',
    physical_minutes: '45',
    technique_minutes: '30',
    intensity: 'Sedang',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await createTrainingLog({
        athlete_id: athleteId,
        log_date: form.log_date,
        phase: form.phase,
        session_type: form.session_type.trim() || null,
        physical_minutes: Number(form.physical_minutes) || 0,
        technique_minutes: Number(form.technique_minutes) || 0,
        intensity: form.intensity,
        description: form.description.trim() || null,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Log Latihan Harian" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tanggal</label>
            <input type="date" className="input" value={form.log_date} onChange={(e) => setForm({ ...form, log_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Tahap</label>
            <select className="input" value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value as PhaseKey })}>
              {PHASE_ORDER.map((k) => <option key={k} value={k}>{PHASES[k].short} — {PHASES[k].name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Jenis Sesi</label>
          <input className="input" placeholder="mis. Sparring, Drill Tendangan, Pliometrik" value={form.session_type}
            onChange={(e) => setForm({ ...form, session_type: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Porsi Fisik (menit)</label>
            <input type="number" min={0} className="input" value={form.physical_minutes}
              onChange={(e) => setForm({ ...form, physical_minutes: e.target.value })} />
          </div>
          <div>
            <label className="label">Porsi Teknik (menit)</label>
            <input type="number" min={0} className="input" value={form.technique_minutes}
              onChange={(e) => setForm({ ...form, technique_minutes: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Intensitas</label>
          <select className="input" value={form.intensity} onChange={(e) => setForm({ ...form, intensity: e.target.value })}>
            {INTENSITY_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Deskripsi (opsional)</label>
          <textarea className="input min-h-[60px]" placeholder="Rincian latihan hari ini…" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <button onClick={submit} disabled={saving} className="btn-primary w-full"><Save className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan Log'}</button>
      </div>
    </Modal>
  );
}

function InjuryModal({ open, onClose, athleteId, onSaved }: { open: boolean; onClose: () => void; athleteId: string; onSaved: () => void }) {
  const [form, setForm] = useState({
    injury_date: new Date().toISOString().slice(0, 10),
    body_part: BODY_PARTS[0],
    injury_type: INJURY_TYPES[0],
    severity: 'Ringan',
    status: 'Aktif',
    treatment: '',
    recovery_notes: '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await createInjuryLog({
        athlete_id: athleteId,
        injury_date: form.injury_date,
        body_part: form.body_part,
        injury_type: form.injury_type,
        severity: form.severity,
        status: form.status,
        treatment: form.treatment.trim() || null,
        recovery_notes: form.recovery_notes.trim() || null,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Catat Cedera / Rekam Medis" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tanggal Cedera</label>
            <input type="date" className="input" value={form.injury_date} onChange={(e) => setForm({ ...form, injury_date: e.target.value })} />
          </div>
          <div>
            <label className="label">Bagian Tubuh</label>
            <select className="input" value={form.body_part} onChange={(e) => setForm({ ...form, body_part: e.target.value })}>
              {BODY_PARTS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Jenis Cedera</label>
            <select className="input" value={form.injury_type} onChange={(e) => setForm({ ...form, injury_type: e.target.value })}>
              {INJURY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Keparahan</label>
            <select className="input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Status</label>
          <div className="flex gap-2">
            {INJURY_STATUS.map((s) => (
              <button key={s} onClick={() => setForm({ ...form, status: s })}
                className={`chip border flex-1 justify-center ${form.status === s ? 'border-accent-500/40 bg-accent-500/15 text-accent-300' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Penanganan (opsional)</label>
          <input className="input" placeholder="RICE, fisioterapi, istirahat…" value={form.treatment}
            onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
        </div>
        <div>
          <label className="label">Catatan Pemulihan (opsional)</label>
          <textarea className="input min-h-[60px]" placeholder="Progres pemulihan, target kembali latih…" value={form.recovery_notes}
            onChange={(e) => setForm({ ...form, recovery_notes: e.target.value })} />
        </div>
        <button onClick={submit} disabled={saving} className="btn-primary w-full"><Save className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan Catatan'}</button>
      </div>
    </Modal>
  );
}
