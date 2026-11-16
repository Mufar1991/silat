import { useEffect, useMemo, useState } from 'react';
import { Archive as ArchiveIcon, Filter, Trash2, Users, User, MessageCircle, Send, AlertCircle } from 'lucide-react';
import { useAthletes } from '@/lib/athlete-context';
import { Card, SectionHeader, Spinner, EmptyState, ErrorState, Badge } from '@/components/ui';
import { Modal } from '@/components/Modal';
import { PHASES, formatDate } from '@/lib/constants';
import { PhaseBadge } from '@/lib/phase-ui';
import { fetchArchive, fetchAthletes, deleteArchiveEntry } from '@/lib/api';
import type { ReportArchiveEntry, Athlete, PhaseKey } from '@/lib/types';

export default function Archive() {
  const { selected } = useAthletes();
  const [entries, setEntries] = useState<ReportArchiveEntry[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scope, setScope] = useState<'all' | 'one'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [waEntry, setWaEntry] = useState<ReportArchiveEntry | null>(null);
  const [waPhone, setWaPhone] = useState('');
  const [waError, setWaError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [entriesData, athletesData] = await Promise.all([
        fetchArchive(scope === 'one' && selected ? selected.id : undefined),
        fetchAthletes(),
      ]);
      setEntries(entriesData);
      setAthletes(athletesData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat arsip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, selected?.id]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (from && e.report_date < from) return false;
      if (to && e.report_date > to) return false;
      return true;
    });
  }, [entries, from, to]);

  const athleteName = (id: string) => athletes.find((a) => a.id === id)?.name ?? 'Atlet terhapus';

  const remove = async (id: string) => {
    try {
      await deleteArchiveEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus arsip');
    }
  };

  const sendWa = (e: ReportArchiveEntry) => {
    const digits = waPhone.replace(/\D/g, '');
    if (digits.length < 8) {
      setWaError('Masukkan nomor WhatsApp yang valid, mis. 0812xxxx atau 62812xxxx.');
      return;
    }
    const intl = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
    const phaseName = e.phase && PHASES[e.phase as PhaseKey] ? PHASES[e.phase as PhaseKey].name : (e.phase ?? '-');
    const text = [
      '*LAPORAN LATIHAN PENCAK SILAT*',
      '',
      `Atlet: ${athleteName(e.athlete_id)}`,
      `Fase Latihan: ${phaseName}`,
      `Tanggal Laporan: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      '',
      '*Rekap RPE & Beban*',
      `• Jumlah sesi tercatat: ${e.sessions ?? 0}`,
      `• Rata-rata RPE: ${e.avg_rpe ?? '-'}`,
      `• Total beban latihan: ${(e.total_load ?? 0).toLocaleString('id-ID')} AU`,
      '',
      e.notes ? `*Catatan Pelatih*\n${e.notes}\n` : '',
      'Dikirim via aplikasi Periodisasi Silat',
    ].join('\n');
    window.open(`https://wa.me/${intl}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    setWaEntry(null);
    setWaPhone('');
    setWaError(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Arsip Laporan Latihan"
        subtitle="Riwayat seluruh laporan yang pernah dibuat / dikirim"
      />

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Filter</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setScope('all')}
              className={`chip border ${scope === 'all' ? 'border-accent-500/40 bg-accent-500/15 text-accent-300' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}
            >
              <Users className="h-3.5 w-3.5" /> Keseluruhan
            </button>
            <button
              onClick={() => setScope('one')}
              disabled={!selected}
              className={`chip border disabled:opacity-40 ${scope === 'one' ? 'border-accent-500/40 bg-accent-500/15 text-accent-300' : 'border-white/10 bg-white/[0.04] text-slate-400'}`}
            >
              <User className="h-3.5 w-3.5" /> {selected ? selected.name : 'Per Atlet'}
            </button>
          </div>
          <div className="w-36">
            <label className="label">Dari</label>
            <input type="date" className="input !py-2" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="w-36">
            <label className="label">Sampai</label>
            <input type="date" className="input !py-2" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          {(from || to) && (
            <button onClick={() => { setFrom(''); setTo(''); }} className="btn-ghost text-xs">
              Reset
            </button>
          )}
        </div>
      </Card>

      {error && <ErrorState message={error} />}

      {loading ? (
        <Spinner label="Memuat arsip…" />
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ArchiveIcon className="h-7 w-7" />}
            title="Belum ada laporan di arsip"
            hint="Laporan otomatis tercatat setiap kali Anda mengirim laporan via WhatsApp atau mengunduh PDF."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <Card key={e.id} className="card-hover !p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-white">{athleteName(e.athlete_id)}</p>
                    {e.phase && <PhaseBadge phase={e.phase as PhaseKey} />}
                    <Badge color={e.channel === 'pdf' ? 'gold' : e.channel === 'whatsapp' ? 'success' : 'slate'}>
                      {e.channel === 'pdf' ? 'PDF' : e.channel === 'whatsapp' ? 'WhatsApp' : 'Manual'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(e.report_date)} · {e.sessions ?? 0} sesi · RPE {e.avg_rpe ?? '-'} · Beban{' '}
                    {(e.total_load ?? 0).toLocaleString('id-ID')} AU
                  </p>
                  {e.notes && <p className="mt-1 max-w-2xl text-xs text-slate-500">"{e.notes}"</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setWaEntry(e); setWaError(null); }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-success-500/15 hover:text-success-400"
                    aria-label="Kirim via WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(e.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-danger-500/15 hover:text-danger-400"
                    aria-label="Hapus arsip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal kirim ulang via WhatsApp */}
      <Modal open={waEntry !== null} onClose={() => setWaEntry(null)} title="Kirim Ulang via WhatsApp" size="md">
        {waEntry && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Laporan arsip {formatDate(waEntry.report_date)} — {athleteName(waEntry.athlete_id)} akan dikirim sebagai pesan WhatsApp.
            </p>
            <div>
              <label className="label">Nomor WhatsApp Tujuan</label>
              <input
                className="input"
                inputMode="tel"
                placeholder="mis. 081234567890"
                value={waPhone}
                onChange={(e) => setWaPhone(e.target.value)}
                autoFocus
              />
            </div>
            {waError && (
              <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{waError}</span>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setWaEntry(null)} className="btn-ghost flex-1 justify-center">Batal</button>
              <button onClick={() => sendWa(waEntry)} className="btn-gold flex-1 justify-center">
                <Send strokeWidth={2.75} className="h-4 w-4" /> Kirim Sekarang
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
