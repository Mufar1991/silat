import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Shield, Trophy, CalendarRange, Swords, HeartPulse, Swords as Logo,
  Archive, Video, ClipboardCheck, Settings, LayoutGrid, X, ChevronRight,
} from 'lucide-react';

// Bold, sporty stroke weight used across all nav icons.
export const NAV_STROKE = 2.75;

const PRIMARY_NAV = [
  { to: '/', label: 'Beranda', icon: Shield, end: true },
  { to: '/periodisasi', label: 'Periodisasi', icon: CalendarRange, end: false },
  { to: '/program', label: 'Program', icon: Swords, end: false },
  { to: '/log', label: 'Log Atlet', icon: HeartPulse, end: false },
];

const SECONDARY_NAV = [
  { to: '/prestasi', label: 'Indeks Prestasi', icon: Trophy, desc: 'Struktur prestasi 4 pilar' },
  { to: '/kejuaraan', label: 'Kejuaraan', icon: Trophy, desc: 'Kalender & countdown puncak' },
  { to: '/kesiapan', label: 'Kesiapan Harian', icon: ClipboardCheck, desc: 'Check-in cegah overtraining' },
  { to: '/video', label: 'Video Analisis', icon: Video, desc: 'Evaluasi teknik & titik lemah' },
  { to: '/arsip', label: 'Arsip Laporan', icon: Archive, desc: 'Riwayat laporan latihan' },
  { to: '/pengaturan', label: 'Pengaturan', icon: Settings, desc: 'Backup & pulihkan data' },
];

const ALL_NAV: { to: string; label: string; icon: typeof Shield; end: boolean }[] = [
  ...PRIMARY_NAV,
  ...SECONDARY_NAV.map((n) => ({ to: n.to, label: n.label, icon: n.icon, end: false })),
];

const NAV = ALL_NAV;

function navIconProps(active: boolean) {
  return active
    ? 'text-gold-400 drop-shadow-[0_0_7px_rgba(246,196,83,0.65)]'
    : 'text-slate-400';
}

function activePill(active: boolean) {
  return active
    ? 'bg-gradient-to-br from-gold-500/30 via-accent-500/20 to-transparent shadow-[0_0_18px_rgba(246,196,83,0.45),0_0_30px_rgba(37,164,255,0.25)]'
    : 'bg-transparent';
}

function activeLabel(active: boolean) {
  return active ? 'text-gold-400' : 'text-slate-400';
}

function activeDot(active: boolean) {
  return active ? (
    <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-400 shadow-[0_0_8px_rgba(246,196,83,0.9)]" />
  ) : null;
}

export function BottomNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the sheet whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-900/95 backdrop-blur-2xl pb-safe lg:hidden">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
          {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-bold"
            >
              {({ isActive }) => (
                <>
                  <span className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${activePill(isActive)}`}>
                    <Icon strokeWidth={NAV_STROKE} className={`h-[22px] w-[22px] transition-all duration-300 ${navIconProps(isActive)} ${isActive ? 'scale-110' : ''}`} />
                    {activeDot(isActive)}
                  </span>
                  <span className={`leading-none transition-colors duration-300 ${activeLabel(isActive)}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* More menu trigger */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-bold"
          >
            <span
              className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 ${
                SECONDARY_NAV.some((n) => n.to === pathname)
                  ? activePill(true)
                  : 'bg-transparent'
              }`}
            >
              <LayoutGrid
                strokeWidth={NAV_STROKE}
                className={`h-[22px] w-[22px] transition-all duration-300 ${
                  SECONDARY_NAV.some((n) => n.to === pathname) ? navIconProps(true) : 'text-slate-400'
                }`}
              />
              {activeDot(SECONDARY_NAV.some((n) => n.to === pathname))}
            </span>
            <span className={`leading-none transition-colors duration-300 ${SECONDARY_NAV.some((n) => n.to === pathname) ? activeLabel(true) : 'text-slate-400'}`}>
              Menu
            </span>
          </button>
        </div>
      </nav>

      {/* Bottom sheet drawer — extra menus */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-ink-900/95 pb-safe shadow-[0_-8px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-transform duration-300 ease-out ${
            open ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="sticky top-0 z-10 flex items-center justify-between bg-ink-900/95 px-5 pb-3 pt-4 backdrop-blur-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-500/25 to-accent-500/25 shadow-[0_0_14px_rgba(37,164,255,0.4)]">
                <Logo strokeWidth={NAV_STROKE} className="h-5 w-5 text-accent-300" />
              </span>
              <div>
                <p className="font-display text-sm font-bold leading-tight text-white">Semua Menu</p>
                <p className="text-[10px] text-slate-400">Periodisasi Silat</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300 transition active:scale-90"
            >
              <X strokeWidth={NAV_STROKE} className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 px-4 pb-6 pt-1">
            {SECONDARY_NAV.map(({ to, label, icon: Icon, desc }) => (
              <NavLink
                key={to}
                to={to}
                className={`flex items-center gap-3.5 rounded-2xl border p-3.5 transition active:scale-[0.98] ${
                  pathname === to
                    ? 'border-gold-500/40 bg-gradient-to-r from-gold-500/15 to-accent-500/10 shadow-[0_0_14px_rgba(246,196,83,0.25)]'
                    : 'border-white/10 bg-white/[0.04]'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                    pathname === to ? activePill(true) : 'bg-white/[0.06]'
                  }`}
                >
                  <Icon strokeWidth={NAV_STROKE} className={`h-6 w-6 ${pathname === to ? navIconProps(true) : 'text-slate-300'}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-bold ${pathname === to ? 'text-gold-400' : 'text-white'}`}>{label}</span>
                  <span className="block truncate text-[11px] text-slate-400">{desc}</span>
                </span>
                <ChevronRight strokeWidth={NAV_STROKE} className="h-5 w-5 shrink-0 text-slate-500" />
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto border-r border-white/10 bg-ink-900/60 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500/20 to-gold-500/20 text-accent-300 shadow-[0_0_18px_rgba(37,164,255,0.4)]">
          <Logo strokeWidth={NAV_STROKE} className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-base font-bold leading-tight text-white">Periodisasi Silat</h1>
          <p className="text-[11px] text-slate-400">Training Periodization</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 pb-4">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300"
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-gold-500/30 to-accent-500/20 shadow-[0_0_14px_rgba(246,196,83,0.4)]'
                      : 'bg-transparent'
                  }`}
                >
                  <Icon
                    strokeWidth={NAV_STROKE}
                    className={`h-[18px] w-[18px] transition-all duration-300 ${navIconProps(isActive)}`}
                  />
                </span>
                <span
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-gold-400 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-[11px] text-slate-500">
        <p>Model Schroeter &amp; Bauersfeld</p>
        <p className="mt-0.5">Pencak Silat Performance</p>
      </div>
    </aside>
  );
}

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 py-4 text-center text-[11px] text-slate-500 lg:pb-4">
      © 2026. Muhammad Farid | v1. Periodisasi Silat
    </footer>
  );
}
