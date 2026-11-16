import { useState } from 'react';
import { MessageCircle, Send, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { openWhatsAppReport, type ReportData } from '@/lib/report';
import { createArchiveEntry } from '@/lib/api';

/**
 * Tombol + modal kirim laporan via WhatsApp.
 * Setiap pengiriman otomatis tercatat ke Arsip Laporan (channel: whatsapp).
 */
export function WhatsAppReportButton({ data }: { data: ReportData }) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Masukkan nomor WhatsApp yang valid, mis. 0812xxxx atau 62812xxxx.');
      return;
    }
    setError(null);
    openWhatsAppReport({ ...data, coachNotes: notes }, phone);

    const sessions = data.rpeLogs.length;
    const avgRpe = sessions ? data.rpeLogs.reduce((s, r) => s + r.rpe_value, 0) / sessions : null;
    const totalLoad = data.rpeLogs.reduce((s, r) => s + (r.session_load ?? r.rpe_value * r.duration_minutes), 0);
    createArchiveEntry({
      athlete_id: data.athlete.id,
      report_date: new Date().toISOString().slice(0, 10),
      phase: data.phase,
      avg_rpe: avgRpe != null ? Math.round(avgRpe * 10) / 10 : null,
      total_load: totalLoad,
      sessions,
      notes: notes.trim() || null,
      channel: 'whatsapp',
    }).catch(() => undefined);

    setOpen(false);
    setNotes('');
  };

  return (
    <>
      <button onClick={() => { setError(null); setOpen(true); }} className="btn-gold text-xs">
        <MessageCircle strokeWidth={2.75} className="h-4 w-4" /> Kirim via WhatsApp
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Kirim Laporan via WhatsApp" size="md">
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Laporan berisi nama atlet, fase latihan, rekap RPE &amp; beban, struktur prestasi, dan catatan
            pelatih akan dibuka langsung di WhatsApp tujuan.
          </p>
          <div>
            <label className="label">Nomor WhatsApp Tujuan</label>
            <input
              className="input"
              inputMode="tel"
              placeholder="mis. 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoFocus
            />
            <p className="mt-1 text-[11px] text-slate-500">Nomor atlet atau orang tua/wali. Format 08xx atau 62xxx.</p>
          </div>
          <div>
            <label className="label">Catatan Pelatih (opsional)</label>
            <textarea
              className="input min-h-[70px]"
              placeholder="mis. Fokus pekan ini perbaikan tendangan sabit & jaga berat badan…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setOpen(false)} className="btn-ghost flex-1 justify-center">Batal</button>
            <button onClick={send} className="btn-gold flex-1 justify-center">
              <Send strokeWidth={2.75} className="h-4 w-4" /> Kirim Sekarang
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
