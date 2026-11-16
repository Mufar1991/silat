import { useState } from 'react';
import { CalendarPlus, MapPin, Trophy, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { COMPETITION_LEVELS } from '@/lib/constants';
import { useAthletes } from '@/lib/athlete-context';
import { createTarget, deleteTarget } from '@/lib/api';

const emptyForm = { name: '', target_date: '', location: '', level: 'Regional' };

export function TargetModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { selected } = useAthletes();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setForm(emptyForm);
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (!selected || !form.name.trim() || !form.target_date) return;
    setSaving(true);
    setError(null);
    try {
      await createTarget({
        athlete_id: selected.id,
        name: form.name.trim(),
        target_date: form.target_date,
        location: form.location.trim() || null,
        level: form.level,
      });
      setForm(emptyForm);
      onSaved?.();
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan target');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Target Kejuaraan Baru" size="md">
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div>
          <label className="label">Nama Kejuaraan</label>
          <input className="input" placeholder="mis. Kejurda Jatim 2026" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Tanggal Puncak / Pertandingan Utama</label>
          <input type="date" className="input" value={form.target_date}
            onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Lokasi</label>
            <input className="input" placeholder="kota" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label">Tingkat</label>
            <select className="input" value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}>
              {COMPETITION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={close} className="btn-ghost flex-1 justify-center" disabled={saving}>Batal</button>
          <button onClick={submit} disabled={saving || !form.name.trim() || !form.target_date} className="btn-primary flex-1 justify-center">
            <CalendarPlus className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan Target'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function TargetList({
  targets,
  onDeleted,
  onAdd,
}: {
  targets: { id: string; name: string; target_date: string; location?: string | null; level?: string | null }[];
  onDeleted?: () => void;
  onAdd?: () => void;
}) {
  const remove = async (id: string) => {
    try {
      await deleteTarget(id);
      onDeleted?.();
    } catch {
      // ignore — UI keeps the row
    }
  };

  return (
    <div className="space-y-3">
      {targets.length === 0 && (
        <div className="glass-soft flex flex-col items-center gap-2 py-6 text-center">
          <Trophy className="h-8 w-8 text-slate-600" />
          <p className="text-sm text-slate-400">Belum ada target kejuaraan.</p>
          <button onClick={onAdd} className="btn-ghost mt-1 text-xs">
            <CalendarPlus className="h-3.5 w-3.5" /> Tambah Target
          </button>
        </div>
      )}
      {targets.map((t) => (
        <div key={t.id} className="glass card-hover flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{t.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span className="font-medium text-accent-300">
                {new Date(t.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {t.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {t.location}</span>}
              {t.level && <span className="chip border border-white/10 bg-white/[0.06] text-slate-300">{t.level}</span>}
            </div>
          </div>
          <button onClick={() => remove(t.id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-danger-500/15 hover:text-danger-400 transition" aria-label="Hapus target">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
