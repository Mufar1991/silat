import { useEffect, useState } from 'react';
import { Trophy, CalendarPlus, MapPin, Timer, Trash2, CalendarClock, Pencil, AlertCircle } from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { useAthleteData } from '@/lib/use-athlete-data';
import { Card, SectionHeader, Spinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { TargetModal } from '@/components/TargetComponents';
import { PHASES, PHASE_ORDER, computePhaseWindows, currentPhase, daysUntil, COMPETITION_LEVELS, formatDate } from '@/lib/constants';
import { PhaseBadge } from '@/lib/phase-ui';
import { fetchPublicEvents, createPublicEvent, updatePublicEvent, deletePublicEvent, deleteTarget } from '@/lib/api';
import type { PhaseKey, PublicEvent } from '@/lib/types';

function Countdown({ targetDate }: { targetDate: string }) {
  const days = daysUntil(targetDate);
  const weeks = Math.floor(days / 7);
  const isPast = days < 0;
  const urgent = days >= 0 && days <= 14;
  const pct = days >= 0 ? Math.min(100, Math.max(0, 100 - (days / 180) * 100)) : 100;
  return (
    <div className="glass-soft p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Timer className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Countdown Kondisi Puncak</span>
      </div>
      {isPast ? (
        <p className="mt-2 font-display text-2xl font-bold text-slate-400">Selesai / lewat</p>
      ) : (
        <div className="mt-2 flex items-end gap-4">
          <div>
            <p className={`font-display text-4xl font-bold ${urgent ? 'text-danger-400' : 'text-white'}`}>{days}</p>
            <p className="text-[11px] text-slate-400">hari lagi</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-gold-400">{weeks}</p>
            <p className="text-[11px] text-slate-400">minggu</p>
          </div>
        </div>
      )}
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all duration-700 ${urgent ? 'bg-danger-500' : 'bg-gradient-to-r from-accent-500 to-gold-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ChampionshipHub() {
  const { selected, loading: athLoading, error: athError } = useAthletes();
  const { targets, loading, error, reload } = useAthleteData();
  const [targetOpen, setTargetOpen] = useState(false);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PublicEvent | null>(null);

  const loadEvents = async () => {
    try {
      setEventsError(null);
      setEvents(await fetchPublicEvents());
    } catch (e) {
      setEventsError(e instanceof Error ? e.message : 'Gagal memuat kalender kejuaraan umum');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  if (athLoading) return <Spinner label="Memuat…" />;
  if (athError) return <ErrorState message={athError} />;
  if (!selected) {
    return <EmptyState icon={<Trophy className="h-7 w-7" />} title="Pilih atlet dulu" hint="Gunakan pemilih atlet di kanan atas." />;
  }

  const windows = targets[0] ? computePhaseWindows(targets[0].target_date) : [];
  const curPhase = windows.length ? currentPhase(windows) : null;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Championship Hub"
        subtitle="Kalender kejuaraan & countdown menuju kondisi puncak"
        action={
          <button onClick={() => setTargetOpen(true)} className="btn-primary text-xs">
            <CalendarPlus className="h-4 w-4" /> Target Baru
          </button>
        }
      />

      {error && <ErrorState message={error} />}

      {loading ? (
        <Spinner label="Memuat target…" />
      ) : (
        <>
          {targets[0] && (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-bold text-white">{targets[0].name}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <CalendarClock className="h-3.5 w-3.5" /> {formatDate(targets[0].target_date)}
                    {targets[0].location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {targets[0].location}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {targets[0].level && <Badge color="gold">{targets[0].level}</Badge>}
                  {curPhase && <PhaseBadge phase={curPhase} />}
                </div>
              </div>
              <div className="mt-4">
                <Countdown targetDate={targets[0].target_date} />
              </div>
              {curPhase && (
                <p className="mt-3 text-xs text-slate-400">
                  Fase aktif: <span className="font-semibold text-accent-300">{PHASES[curPhase].name}</span> — {PHASES[curPhase].focus}
                </p>
              )}
            </Card>
          )}

          <div>
            <SectionHeader title="Daftar Target Kejuaraan" subtitle="Semua kejuaraan yang direncanakan" />
            {targets.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Trophy className="h-7 w-7" />}
                  title="Belum ada target kejuaraan"
                  hint="Tambahkan target untuk mengaktifkan countdown & perhitungan fase periodisasi."
                />
                <button onClick={() => setTargetOpen(true)} className="btn-primary mx-auto mt-2 flex text-xs">
                  <CalendarPlus className="h-4 w-4" /> Tambah Target Pertama
                </button>
              </Card>
            ) : (
              <div className="space-y-2">
                {targets.map((t) => {
                  const d = daysUntil(t.target_date);
                  return (
                    <Card key={t.id} className="card-hover flex flex-wrap items-center justify-between gap-3 !p-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{t.name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatDate(t.target_date)} · {d >= 0 ? `${d} hari lagi` : 'selesai'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.level && <Badge color="slate">{t.level}</Badge>}
                        <Badge color={d < 0 ? 'slate' : d <= 14 ? 'danger' : d <= 45 ? 'warning' : 'success'}>
                          {d < 0 ? 'Selesai' : d <= 14 ? 'Mendesak' : d <= 45 ? 'Dekat' : 'Terjadwal'}
                        </Badge>
                        <button
                          onClick={async () => {
                            try {
                              await deleteTarget(t.id);
                              reload();
                            } catch {
                              // row stays; error is non-critical for this list
                            }
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-danger-500/15 hover:text-danger-400"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <SectionHeader
              title="Kalender Kejuaraan Umum"
              subtitle="Acara rutin pencak silat di Indonesia — dapat disesuaikan"
              action={
                <button onClick={() => { setEditingEvent(null); setEventModalOpen(true); }} className="btn-primary text-xs">
                  <CalendarPlus className="h-4 w-4" /> Tambah Kejuaraan
                </button>
              }
            />
            {eventsError && <ErrorState message={eventsError} />}
            {eventsLoading ? (
              <Spinner label="Memuat kalender…" />
            ) : events.length === 0 ? (
              <Card>
                <EmptyState icon={<Trophy className="h-7 w-7" />} title="Belum ada kejuaraan umum" hint="Tambahkan kejuaraan rutin untuk referensi periodisasi." />
              </Card>
            ) : (
              <Card>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {events.map((e) => (
                    <li key={e.id} className="glass-soft flex items-center justify-between gap-2 p-3 text-sm">
                      <span className="min-w-0 truncate text-slate-300">{e.name}</span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <Badge color="slate">{e.level}</Badge>
                        <button
                          onClick={() => { setEditingEvent(e); setEventModalOpen(true); }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-accent-500/15 hover:text-accent-300"
                          aria-label={`Edit ${e.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await deletePublicEvent(e.id);
                              await loadEvents();
                            } catch {
                              setEventsError('Gagal menghapus kejuaraan');
                            }
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-danger-500/15 hover:text-danger-400"
                          aria-label={`Hapus ${e.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          <div>
            <SectionHeader title="Peta Fase Periodisasi" subtitle="Distribusi tahap menuju tanggal target" />
            {windows.length ? (
              <Card>
                <div className="flex h-3 overflow-hidden rounded-full">
                  {windows.map((w) => {
                    const colors: Record<PhaseKey, string> = {
                      TPU: 'bg-accent-500', TPK: 'bg-gold-500', TPP: 'bg-warning-500',
                      TPUT: 'bg-danger-500', TRANSISI: 'bg-success-500',
                    };
                    return <div key={w.key} className={colors[w.key]} style={{ flexGrow: w.weeks }} title={`${PHASES[w.key].name} — ${w.weeks} minggu`} />;
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PHASE_ORDER.map((k) => (
                    <span key={k} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className={`h-2 w-2 rounded-full ${k === 'TPU' ? 'bg-accent-500' : k === 'TPK' ? 'bg-gold-500' : k === 'TPP' ? 'bg-warning-500' : k === 'TPUT' ? 'bg-danger-500' : 'bg-success-500'}`} />
                      {PHASES[k].short}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Total {windows.reduce((s, w) => s + w.weeks, 0)} minggu dari sekarang. Tingkat kompetisi tersedia: {COMPETITION_LEVELS.join(', ')}.
                </p>
              </Card>
            ) : (
              <Card><p className="text-sm text-slate-400">Atur target kejuaraan untuk melihat peta fase.</p></Card>
            )}
          </div>
        </>
      )}

      <TargetModal open={targetOpen} onClose={() => setTargetOpen(false)} onSaved={reload} />

      <Modal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        title={editingEvent ? 'Edit Kejuaraan Umum' : 'Tambah Kejuaraan Umum'}
      >
        <EventForm
          event={editingEvent}
          onDone={async () => {
            setEventModalOpen(false);
            setEditingEvent(null);
            await loadEvents();
          }}
          onCancel={() => setEventModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function EventForm({
  event,
  onDone,
  onCancel,
}: {
  event: PublicEvent | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(event?.name ?? '');
  const [level, setLevel] = useState(event?.level ?? 'Provinsi');
  const [monthHint, setMonthHint] = useState(event?.month_hint ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (event) {
        await updatePublicEvent(event.id, { name: name.trim(), level, month_hint: monthHint.trim() || null });
      } else {
        await createPublicEvent({ id: `ev_${Date.now().toString(36)}`, name: name.trim(), level, month_hint: monthHint.trim() || null, sort_order: 99 });
      }
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan kejuaraan');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div>
        <label className="label">Nama Kejuaraan</label>
        <input className="input" placeholder="mis. Kejurda Jatim" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tingkat</label>
          <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
            {COMPETITION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Waktu Biasa (opsional)</label>
          <input className="input" placeholder="mis. Maret / tiap 2 tahun" value={monthHint} onChange={(e) => setMonthHint(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="btn-ghost flex-1 justify-center" disabled={saving}>Batal</button>
        <button onClick={submit} disabled={saving || !name.trim()} className="btn-primary flex-1 justify-center">
          <CalendarPlus className="h-4 w-4" /> {saving ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}
