import { useRef, useState } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle, Database, BookOpen, ChevronDown } from 'lucide-react';
import { Card, SectionHeader } from '@/components/ui';
import { fetchAllForBackup, restoreBackup } from '@/lib/api';
import type { BackupBundle } from '@/lib/types';
import { useAthletes } from '@/lib/athlete-context';
import { BookOpenCheck, UserPlus, Target, CalendarClock, LineChart, FileDown, MessageCircle } from 'lucide-react';

type GuideSection = { title: string; icon: typeof BookOpen; steps: string[] };

const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: '1. Input Data Atlet', icon: UserPlus,
    steps: [
      'Buka <b>Athlete Selector</b> di kanan atas, lalu tekan tombol tambah atlet.',
      'Isi nama, kategori (<b>Tanding</b> atau <b>Seni</b>), dan sub-kategori untuk atlet seni (Tunggal/Ganda/Regu).',
      'Lengkapi usia, berat badan, dan sabuk bila ada — data ini membantu penyesuaian kelas tanding.',
      'Semua log latihan, asesmen, dan program yang dibuat setelahnya akan terikat pada atlet yang sedang dipilih.',
    ],
  },
  {
    title: '2. Menentukan Target Kejuaraan & Fase Periodisasi', icon: Target,
    steps: [
      'Buka halaman <b>Championship Hub</b>, tekan <b>Target Baru</b>, lalu isi nama, tanggal puncak, lokasi, dan tingkat kejuaraan.',
      'Aplikasi otomatis menghitung countdown dan membagi waktu menjadi 5 fase: <b>TPU</b> (persiapan umum), <b>TPK</b> (persiapan khusus), <b>TPP</b> (pra-kompetisi), <b>TPUT</b> (puncak), dan <b>Transisi</b>.',
      'Fase aktif saat ini tampil sebagai badge pada kartu target terdekat.',
      'Gunakan <b>Peta Fase Periodisasi</b> di bawah untuk melihat proporsi setiap tahap menuju tanggal target.',
    ],
  },
  {
    title: '3. Menyusun Program Latihan Mingguan', icon: CalendarClock,
    steps: [
      'Buka halaman <b>Program Latihan</b>, pilih tab Mikrosiklus, pilih tahap, dan tekan <b>Isi Template</b> untuk mengisi kerangka harian secara otomatis.',
      'Sesuaikan porsi fisik dan teknik tiap hari, lalu tekan <b>Simpan Program Mingguan</b>.',
      'Di tab Mesosiklus dan Makrosiklus, lihat ringkasan blok tahap dan distribusi minggu menuju kejuaraan.',
      'Pada <b>Bank Menu Latihan Silat</b>, klik kartu menu untuk melihat detail takaran/durasi/repetisi; gunakan tombol <b>Menu Baru</b> untuk menambahkan materi latihan khas perguruan.',
    ],
  },
  {
    title: '4. Membaca Grafik Indeks Prestasi', icon: LineChart,
    steps: [
      'Buka halaman <b>Indeks Prestasi</b> setelah minimal satu asesmen diinput (fisik, teknik, taktik, psikologis).',
      'Grafik menampilkan perkembangan skor dari waktu ke waktu — garis menanjak berarti peningkatan menjelang kompetisi.',
      'Perhatikan catatan eksternal ( hasil observasi ) dan internal ( keluhan atlet ) untuk konteks di balik angka.',
      'Bandingkan tren dengan fase aktif: peningkatan tajam biasanya terjadi pada fase TPP menuju TPUT.',
    ],
  },
  {
    title: '5. Mengekspor Laporan PDF & Mengirim via WhatsApp', icon: MessageCircle,
    steps: [
      'Buka <b>Dashboard</b> atau halaman atlet, lalu cari tombol <b>Laporan WhatsApp</b>.',
      'Ringkasan laporan (fase, RPE rata-rata, beban latihan, sesi) dibuat otomatis dari data minggu terakhir.',
      'Tekan tombol <b>Ekspor PDF</b> untuk mengunduh laporan siap cetak/arsip.',
      'Tekan tombol <b>Kirim WhatsApp</b> — aplikasi membuka WhatsApp dengan pesan ringkasan yang sudah terisi; tinggal pilih penerima dan kirim.',
      'Laporan terkirim/ekspor otomatis tersimpan di halaman <b>Arsip</b> untuk dokumentasi.',
    ],
  },
  {
    title: '6. Memantau Kesiapan, Cedera & Cadangan Data', icon: FileDown,
    steps: [
      'Gunakan <b>Readiness Checklist</b> tiap pagi: atlet mengisi kondisi kebugaran, jam tidur, dan level stres.',
      'Catat setiap cedera pada log cedera agar beban latihan bisa dikurangi saat pemulihan.',
      'Di halaman <b>Pengaturan</b>, lakukan <b>Export JSON</b> secara berkala sebagai cadangan, dan <b>Import JSON</b> untuk memulihkan data di perangkat baru.',
    ],
  },
];

export default function Settings() {
  const { refresh } = useAthletes();
  const [guideOpen, setGuideOpen] = useState(false);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    setBusy('export');
    setMessage(null);
    try {
      const data = await fetchAllForBackup();
      const bundle: BackupBundle = { version: 1, exported_at: new Date().toISOString(), ...data };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-periodisasi-silat-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ kind: 'ok', text: 'Backup berhasil diunduh ke perangkat.' });
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : 'Gagal membuat backup' });
    } finally {
      setBusy(null);
    }
  };

  const doImport = async (file: File) => {
    setBusy('import');
    setMessage(null);
    try {
      const text = await file.text();
      const bundle = JSON.parse(text);
      if (!bundle || bundle.version !== 1 || !Array.isArray(bundle.athletes)) {
        throw new Error('Format file backup tidak valid');
      }
      await restoreBackup(bundle);
      await refresh();
      setMessage({ kind: 'ok', text: `Restore selesai — ${bundle.athletes.length} atlet diproses.` });
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : 'Gagal memulihkan data' });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Pengaturan"
        subtitle="Cadangkan & pulihkan data aplikasi untuk mencegah kehilangan data"
      />

      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
            <Database className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-white">Cadangkan &amp; Pulihkan Data</h3>
            <p className="mt-1 text-xs text-slate-400">
              Export menyimpan seluruh data atlet, target kejuaraan, asesmen, log latihan, RPE, cedera,
              program mingguan, kesiapan harian, video analisis, dan arsip laporan ke satu file JSON.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={doExport} disabled={busy !== null} className="btn-primary text-xs">
                <Download className="h-4 w-4" />
                {busy === 'export' ? 'Menyiapkan…' : 'Export JSON'}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={busy !== null}
                className="btn-ghost text-xs"
              >
                <Upload className="h-4 w-4" />
                {busy === 'import' ? 'Memulihkan…' : 'Import JSON'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) doImport(f);
                }}
              />
            </div>
            {message && (
              <div
                className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
                  message.kind === 'ok'
                    ? 'border-success-500/30 bg-success-500/10 text-success-400'
                    : 'border-danger-500/30 bg-danger-500/10 text-danger-400'
                }`}
              >
                {message.kind === 'ok'
                  ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <button
          onClick={() => setGuideOpen(!guideOpen)}
          className="flex w-full items-center justify-between gap-3 text-left"
          aria-expanded={guideOpen}
        >
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-400">
              <BookOpen className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold text-white">Buku Panduan Penggunaan Aplikasi</span>
              <span className="mt-0.5 block text-xs text-slate-400">Petunjuk operasional lengkap untuk pelatih</span>
            </span>
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${guideOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`grid transition-all duration-300 ${guideOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="space-y-5 border-t border-white/10 pt-4">
              {GUIDE_SECTIONS.map((s) => (
                <div key={s.title}>
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-accent-300">
                    <s.icon className="h-4 w-4" /> {s.title}
                  </h4>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-6 text-xs leading-relaxed text-slate-400">
                    {s.steps.map((step, i) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-white">Tentang Aplikasi</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-400">
          Periodisasi Silat v1 — Sistem manajemen dan perencanaan latihan pencak silat berbasis
          saintifik untuk mengoptimalkan peak performance atlet kategori tanding dan seni.
        </p>
      </Card>
    </div>
  );
}
