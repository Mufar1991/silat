import { useState } from 'react';
import { ChevronDown, UserPlus, Check, Users, AlertCircle } from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { Modal } from './Modal';
import { CATEGORIES, SENI_SUBCATEGORIES, BELT_LEVELS } from '@/lib/constants';
import type { Athlete } from '@/lib/types';

const emptyForm = {
  name: '',
  category: 'Tanding',
  sub_category: '',
  age: '',
  weight: '',
  belt_level: 'Dasar',
};

export function AthleteSelector() {
  const { athletes, selected, select, addAthlete } = useAthletes();
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openForm = () => {
    setOpen(false);
    setForm(emptyForm);
    setError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
    setError(null);
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addAthlete({
        name: form.name.trim(),
        category: form.category,
        sub_category: form.category === 'Seni' ? form.sub_category || null : null,
        age: form.age ? Number(form.age) : null,
        weight: form.weight ? Number(form.weight) : null,
        belt_level: form.belt_level,
      });
      closeForm();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal menyimpan atlet';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const categoryLabel = (a: Athlete) =>
    a.category === 'Seni' ? `Seni ${a.sub_category ?? ''}`.trim() : 'Tanding';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-left transition hover:bg-white/[0.1]"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/20 text-accent-300">
          <Users className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight text-white">
            {selected?.name ?? 'Pilih atlet'}
          </p>
          <p className="truncate text-[11px] text-slate-400">
            {selected ? categoryLabel(selected) : 'Belum ada atlet'}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Pilih Atlet" size="sm">
        <div className="space-y-2">
          {athletes.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">Belum ada atlet. Tambahkan dulu.</p>
          )}
          {athletes.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                select(a.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left transition hover:bg-white/[0.08]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{a.name}</p>
                <p className="truncate text-[11px] text-slate-400">
                  {categoryLabel(a)} {a.belt_level ? `· ${a.belt_level}` : ''}
                </p>
              </div>
              {selected?.id === a.id && <Check className="h-5 w-5 shrink-0 text-accent-400" />}
            </button>
          ))}
          <button
            onClick={openForm}
            className="btn-ghost mt-2 w-full justify-center"
          >
            <UserPlus className="h-4 w-4" /> Tambah Atlet
          </button>
        </div>
      </Modal>

      <Modal open={formOpen} onClose={closeForm} title="Tambah Atlet Baru" size="md">
        <div className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {/* 1. Nama Lengkap Atlet — paling atas */}
          <div>
            <label className="label">Nama Lengkap Atlet</label>
            <input
              className="input"
              placeholder="Masukkan nama lengkap atlet"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          {/* 2. Kategori & Usia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Kategori</label>
              <select
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value, sub_category: '' })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            {form.category === 'Seni' ? (
              <div>
                <label className="label">Sub Kategori</label>
                <select
                  className="input"
                  value={form.sub_category}
                  onChange={(e) => setForm({ ...form, sub_category: e.target.value })}
                >
                  <option value="">Pilih…</option>
                  {SENI_SUBCATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="label">Usia</label>
                <input
                  type="number"
                  className="input"
                  placeholder="tahun"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
            )}
          </div>
          {/* 3. Berat & Tingkat Sabuk */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Berat (kg)</label>
              <input
                type="number"
                className="input"
                placeholder="kg"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Tingkat Sabuk</label>
              <select
                className="input"
                value={form.belt_level}
                onChange={(e) => setForm({ ...form, belt_level: e.target.value })}
              >
                {BELT_LEVELS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Usia tetap tampil untuk kategori Seni */}
          {form.category === 'Seni' && (
            <div>
              <label className="label">Usia</label>
              <input
                type="number"
                className="input"
                placeholder="tahun"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>
          )}
          {/* 4. Tombol Batal & Simpan — selalu terlihat di bawah */}
          <div className="flex gap-3 pt-2">
            <button onClick={closeForm} className="btn-ghost flex-1 justify-center" disabled={saving}>
              Batal
            </button>
            <button onClick={submit} disabled={saving || !form.name.trim()} className="btn-primary flex-1 justify-center">
              {saving ? 'Menyimpan…' : 'Simpan Atlet'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
