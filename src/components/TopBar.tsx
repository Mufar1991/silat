import { useLocation } from 'react-router-dom';
import { Swords, Sun, Moon } from 'lucide-react';
import { AthleteSelector } from './AthleteSelector';
import { useTheme } from '@/lib/theme-context';

const TITLES: Record<string, string> = {
  '/': 'Beranda',
  '/prestasi': 'Indeks Struktur Prestasi',
  '/periodisasi': 'Periodisasi & Pentahapan',
  '/program': 'Program Latihan',
  '/log': 'Log & Perkembangan Atlet',
  '/arsip': 'Arsip Laporan',
  '/kejuaraan': 'Championship Hub',
  '/video': 'Video Analisis Teknik',
  '/kesiapan': 'Ceklis Kesiapan Harian',
  '/pengaturan': 'Pengaturan',
};

export function TopBar() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const title = TITLES[pathname] ?? 'Periodisasi Silat';

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/70 pt-safe backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300 shadow-glow">
            <Swords strokeWidth={2.75} className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold leading-tight text-white">{title}</h1>
            <p className="text-[10px] text-slate-400">Periodisasi Silat</p>
          </div>
        </div>
        <div className="hidden lg:block">
          <h1 className="font-display text-lg font-bold text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <AthleteSelector />
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:bg-white/[0.12] hover:text-white active:scale-95"
          >
            {theme === 'dark' ? <Sun strokeWidth={2.75} className="h-5 w-5" /> : <Moon strokeWidth={2.75} className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
