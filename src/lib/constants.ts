import type { PhaseInfo, PhaseKey } from './types';

export const PHASES: Record<PhaseKey, PhaseInfo> = {
  TPU: {
    key: 'TPU',
    name: 'Tahap Persiapan Umum',
    short: 'TPU',
    duration: '6–8 minggu',
    focus: 'Fondasi Fisik Aerobik & Teknik Dasar',
    color: 'accent',
    description:
      'Membangun fondasi daya tahan aerobik dan penguasaan teknik dasar pencak silat. Volume tinggi, intensitas rendah–sedang.',
    physicalMenu: [
      'Lari jarak menengah (5–8 km)',
      'Skipping interval (3x3 menit)',
      'Renang 30–45 menit',
      'Circuit training kekuatan inti',
      'Mobilitas & peregangan dinamis',
    ],
    techniqueMenu: [
      'Langkah dasar (geser, maju, mundur)',
      'Sikap pasang & kuda-kuda',
      'Pukulan dasar (depan, melingkar, bandul)',
      'Tendangan dasar (depan, T, sabit, jejek)',
      'Pola serang tangkapan dasar',
    ],
  },
  TPK: {
    key: 'TPK',
    name: 'Tahap Persiapan Khusus',
    short: 'TPK',
    duration: '4–6 minggu',
    focus: 'Daya Tahan Anaerobik & Power Eksplosif',
    color: 'gold',
    description:
      'Transisi ke energi anaerobik, kekuatan eksplosif, agility, dan penyempurnaan teknik lanjutan spesifik silat.',
    physicalMenu: [
      'Interval anaerobik 30s on / 30s off',
      'Pliometrik (box jump, depth jump)',
      'Sprint 20–40 m berulang',
      'Agility ladder & cone drill',
      'Kettlebell swing & medicine ball',
    ],
    techniqueMenu: [
      'Kombinasi serangan maju-mundur',
      'Tangkisan elakan & bantingan',
      'Tendangan lompat & tendangan beruntun',
      'Serangan balik (counter attack)',
      'Bioteknik perorangan',
    ],
  },
  TPP: {
    key: 'TPP',
    name: 'Tahap Pra-Kompetisi',
    short: 'TPP',
    duration: '3–4 minggu',
    focus: 'Stamina Cepat, Sparring & Taktik',
    color: 'warning',
    description:
      'Peningkatan stamina kecepatan, pliometrik intensif, sparring/try-out, dan penyempurnaan taktik pertandingan.',
    physicalMenu: [
      'Stamina cepat: shuttle run 4x15m',
      'Pliometrik intensif (burpee, jump squat)',
      'Speed bag & reflex drill',
      'Sparring terkontrol 3x2 menit',
      'Recovery & cold therapy',
    ],
    techniqueMenu: [
      'Sparring try-out dengan atlet undangan',
      'Simulasi taktik lawan (southpaw, aggressor)',
      'Penyempurnaan strategi bingkai/jurus',
      'Analisis video pertandingan',
      'Mental rehearsal & visualisasi',
    ],
  },
  TPUT: {
    key: 'TPUT',
    name: 'Tahap Pertandingan Utama',
    short: 'TPUT',
    duration: '1–2 minggu',
    focus: 'Tapering (Unloading) & Maintenance Puncak',
    color: 'danger',
    description:
      'Menu tapering untuk menurunkan beban (unloading) sambil menjaga ketajaman performa. Penjagaan ketat kondisi puncak.',
    physicalMenu: [
      'Tapering: volume turun 40–60%',
      'Maintenance ringan (shadow, footwork)',
      'Jogging ringan & peregangan aktif',
      'Sauna / pemulihan aktif',
      'Tidur & nutrisi terjaga',
    ],
    techniqueMenu: [
      'Latihan teknik ringan & spesifik',
      'Shadow sparring fokus timing',
      'Review strategi pertandingan',
      'Warm-up match simulation',
      'Fokus mental & konsentrasi',
    ],
  },
  TRANSISI: {
    key: 'TRANSISI',
    name: 'Tahap Transisi (Active Recovery)',
    short: 'Transisi',
    duration: '2–4 minggu',
    focus: 'Pemulihan Pasca-Kompetisi',
    color: 'success',
    description:
      'Pemulihan aktif setelah kejuaraan. Istirahat terstruktur, rehabilitasi cedera, dan evaluasi makro program.',
    physicalMenu: [
      'Active recovery: jalan santai, renang',
      'Latihan mobilitas & Yoga',
      'Rehabilitasi cedera terjadwal',
      'Aktivitas rekreasi (sepeda, hiking)',
      'Pemulihan tidur & mental',
    ],
    techniqueMenu: [
      'Evaluasi video pertandingan',
      'Review kelemahan & kekuatan',
      'Refres teknik ringan (opsional)',
      'Perencanaan siklus berikutnya',
      'Istirahat mental dari kompetisi',
    ],
  },
};

export const PHASE_ORDER: PhaseKey[] = ['TPU', 'TPK', 'TPP', 'TPUT', 'TRANSISI'];

// Phase distribution ratios (sum = 1.0) used to auto-compute phase windows
// from total weeks until championship.
export const PHASE_RATIOS: Record<PhaseKey, number> = {
  TPU: 0.34,
  TPK: 0.24,
  TPP: 0.18,
  TPUT: 0.08,
  TRANSISI: 0.16,
};

export const CATEGORIES = [
  { value: 'Tanding', label: 'Tanding (Match)' },
  { value: 'Seni', label: 'Seni (Art)' },
];

export const SENI_SUBCATEGORIES = [
  { value: 'Tunggal', label: 'Tunggal (Solo)' },
  { value: 'Ganda', label: 'Ganda (Duo)' },
  { value: 'Regu', label: 'Regu (Team)' },
];

export const BELT_LEVELS = ['Dasar', 'Kuning', 'Hijau', 'Biru', 'Merah', 'Hitam', 'Hitam 1-7'];

export const COMPETITION_LEVELS = ['Sekolah', 'Klub', 'Regional', 'Provinsi', 'Nasional', 'Internasional'];

export const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const INTENSITY_LEVELS = ['Rendah', 'Sedang', 'Tinggi', 'Maksimal'];

// Schroeter & Bauersfeld Achievement Structure pillars
export interface Pillar {
  key: string;
  name: string;
  description: string;
  subFactors: string[];
  color: string;
  icon: string;
}

export const PILLARS: Pillar[] = [
  {
    key: 'physical',
    name: 'Kemampuan Fisik',
    description: 'Kondisi fisik dasar dan spesifik yang menopang performa silat.',
    subFactors: ['Daya tahan (aerobik & anaerobik)', 'Kekuatan & power eksplosif', 'Kecepatan & quickness', 'Kelenturan & mobilitas', 'Agility & koordinasi'],
    color: 'accent',
    icon: 'Dumbbell',
  },
  {
    key: 'technique',
    name: 'Keterampilan Teknik',
    description: 'Penguasaan teknik dasar dan lanjutan pencak silat.',
    subFactors: ['Teknik tendangan', 'Teknik pukulan', 'Teknik tangkisan & elakan', 'Teknik bantingan & jatuhan', 'Kombinasi jurus (seni)'],
    color: 'gold',
    icon: 'Swords',
  },
  {
    key: 'tactical',
    name: 'Pemahaman Taktik/Strategis',
    description: 'Kemampuan membaca permainan lawan dan menyusun strategi.',
    subFactors: ['Pola serang & pertahanan', 'Pembacaan lawan', 'Manajemen tempo & ring', 'Strategi bingkai/jurus (seni)', 'Adaptasi situasi pertandingan'],
    color: 'warning',
    icon: 'Brain',
  },
  {
    key: 'psychological',
    name: 'Keadaan Psikologis',
    description: 'Kesiapan mental, motivasi, dan ketahanan psikis atlet.',
    subFactors: ['Motivasi & komitmen', 'Konsentrasi & fokus', 'Manajemen stres & cemas', 'Kepercayaan diri', 'Ketahanan mental saat tertinggal'],
    color: 'danger',
    icon: 'Heart',
  },
];

export const EXTERNAL_FACTORS = [
  'Sarana & prasarana latihan (lapangan, matras, peralatan)',
  'Sistem kompetisi & kalender pertandingan',
  'Kualitas pelatih & tenaga pendukung',
  'Dukungan organisasi (pengurus, PSDI, perguruan)',
  'Fasilitas medis & pemulihan',
  'Kondisi lingkungan (cuaca, altitude, ketinggian tempat)',
];

export const INTERNAL_FACTORS = [
  'Genetik & potensi bawaan atlet',
  'Status gizi & hidrasi',
  'Pola tidur & istirahat',
  'Riwayat cedera & kondisi medis',
  'Beban sekolah/pekerjaan & sosial',
  'Motivasi intrinsik & disiplin pribadi',
];

// Training menu bank — silat specific, indexed by category + phase
export interface MenuBankItem {
  id: string;
  label: string;
  category: 'Tanding' | 'Seni' | 'Umum';
  subCategory?: string;
  type: 'Fisik' | 'Teknik';
  phase: PhaseKey | 'ALL';
  detail: string;
}

export const MENU_BANK: MenuBankItem[] = [
  // Physical — general
  { id: 'p1', label: 'Lari Aerobik', category: 'Umum', type: 'Fisik', phase: 'TPU', detail: 'Lari 5–8 km, denyut nadi 60–75% MHR' },
  { id: 'p2', label: 'Skipping Interval', category: 'Umum', type: 'Fisik', phase: 'TPU', detail: '3x3 menit, ritme bergantian cepat-lambat' },
  { id: 'p3', label: 'Renang Pemulihan', category: 'Umum', type: 'Fisik', phase: 'TPU', detail: '30–45 menit gaya bebas, low impact' },
  { id: 'p3b', label: 'Circuit Training Inti', category: 'Umum', type: 'Fisik', phase: 'TPU', detail: '5 stasiun: plank, sit-up, push-up, back, squat — 3 putaran' },
  { id: 'p3c', label: 'Mobilitas & Peregangan', category: 'Umum', type: 'Fisik', phase: 'TPU', detail: 'Peregangan dinamis seluruh sendi, 15 menit' },
  { id: 'p4', label: 'Interval Anaerobik', category: 'Umum', type: 'Fisik', phase: 'TPK', detail: '30s sprint / 30s jalan, 10–12 set' },
  { id: 'p5', label: 'Pliometrik Box Jump', category: 'Umum', type: 'Fisik', phase: 'TPK', detail: '4x8 reps, tinggi 40–60 cm' },
  { id: 'p6', label: 'Agility Ladder', category: 'Umum', type: 'Fisik', phase: 'TPK', detail: 'Pola Ickey shuffle, in-out, 6 set' },
  { id: 'p6b', label: 'Cone Drill Zigzag', category: 'Umum', type: 'Fisik', phase: 'TPK', detail: 'Belokan cepat antar cone 5m, 8 set' },
  { id: 'p6c', label: 'Kettlebell Swing', category: 'Umum', type: 'Fisik', phase: 'TPK', detail: '4x15 reps, kekuatan eksplosif pinggul' },
  { id: 'p6d', label: 'Medicine Ball Slam', category: 'Umum', type: 'Fisik', phase: 'TPK', detail: '4x10 reps, power otot inti' },
  { id: 'p7', label: 'Shuttle Run Stamina', category: 'Umum', type: 'Fisik', phase: 'TPP', detail: '4x15m bolak-balik, 3 set dengan istirahat 90s' },
  { id: 'p8', label: 'Burpee Jump Squat', category: 'Umum', type: 'Fisik', phase: 'TPP', detail: '5x10 reps, eksplosif' },
  { id: 'p8b', label: 'Speed Bag Reflex', category: 'Umum', type: 'Fisik', phase: 'TPP', detail: 'Reflex & kecepatan tangan, 3x1 menit' },
  { id: 'p8c', label: 'Depth Jump', category: 'Umum', type: 'Fisik', phase: 'TPP', detail: 'Melompat dari box lalu melompat naik, 4x6 reps' },
  { id: 'p9', label: 'Tapering Shadow', category: 'Umum', type: 'Fisik', phase: 'TPUT', detail: 'Shadow 3x2 menit, intensitas 50%' },
  { id: 'p9b', label: 'Jogging Ringan Taper', category: 'Umum', type: 'Fisik', phase: 'TPUT', detail: '15–20 menit, detak nadi < 60% MHR' },
  { id: 'p9c', label: 'Pemulihan Aktif Sauna', category: 'Umum', type: 'Fisik', phase: 'TPUT', detail: 'Sauna/kontras air panas-dingin 15 menit' },
  { id: 'p10', label: 'Active Recovery Jog', category: 'Umum', type: 'Fisik', phase: 'TRANSISI', detail: 'Jogging santai 20–30 menit' },
  { id: 'p10b', label: 'Yoga & Mobilitas', category: 'Umum', type: 'Fisik', phase: 'TRANSISI', detail: 'Sesi yoga 30 menit, fokus kelenturan & relaksasi' },
  { id: 'p10c', label: 'Rekreasi Sepeda/Hiking', category: 'Umum', type: 'Fisik', phase: 'TRANSISI', detail: 'Aktivitas ringan menjaga kebugaran tanpa stres' },
  // ===== Technique — Tanding (all phases) =====
  { id: 't1', label: 'Langkah & Sikap Pasang', category: 'Tanding', type: 'Teknik', phase: 'TPU', detail: 'Drill langkah maju-mundur, sikap pasang' },
  { id: 't2', label: 'Tendangan Dasar', category: 'Tanding', type: 'Teknik', phase: 'TPU', detail: 'Tendangan depan, T, sabit, jejek' },
  { id: 't2b', label: 'Pukulan Dasar', category: 'Tanding', type: 'Teknik', phase: 'TPU', detail: 'Pukulan depan, melingkar, bandul, tegak' },
  { id: 't2c', label: 'Tangkisan & Elakan', category: 'Tanding', type: 'Teknik', phase: 'TPU', detail: 'Tangkisan luar, dalam, bawah, elakan bawah' },
  { id: 't2d', label: 'Kuda-kuda & Posisi', category: 'Tanding', type: 'Teknik', phase: 'TPU', detail: 'Kuda-kuda depan, samping, belakang, silang' },
  { id: 't2e', label: 'Pola Serang Dasar', category: 'Tanding', type: 'Teknik', phase: 'TPU', detail: 'Serang maju 1-2-3 dengan kontrol jarak' },
  { id: 't3', label: 'Kombinasi Serang', category: 'Tanding', type: 'Teknik', phase: 'TPK', detail: 'Pukul-tendang-tangkis beruntun' },
  { id: 't4', label: 'Counter Attack', category: 'Tanding', type: 'Teknik', phase: 'TPK', detail: 'Tangkisan-elakan-serangan balik' },
  { id: 't4b', label: 'Tendangan Lompat', category: 'Tanding', type: 'Teknik', phase: 'TPK', detail: 'Tendangan lompat sabit & jejek, 3x8 reps' },
  { id: 't4c', label: 'Tendangan Beruntun', category: 'Tanding', type: 'Teknik', phase: 'TPK', detail: '2–3 tendangan beruntun tanpa berhenti' },
  { id: 't4d', label: 'Bantingan & Jatuhan', category: 'Tanding', type: 'Teknik', phase: 'TPK', detail: 'Teknik bantingan dasar & jatuhan terkontrol' },
  { id: 't4e', label: 'Bioteknik Perorangan', category: 'Tanding', type: 'Teknik', phase: 'TPK', detail: 'Drill bioteknik mandiri fokus kecepatan' },
  { id: 't5', label: 'Sparring Try-Out', category: 'Tanding', type: 'Teknik', phase: 'TPP', detail: 'Sparring 3x2 menit dengan lawan undangan' },
  { id: 't5b', label: 'Simulasi Lawan Agresor', category: 'Tanding', type: 'Teknik', phase: 'TPP', detail: 'Hadapi lawan agresif, fokus pertahanan & balasan' },
  { id: 't5c', label: 'Analisis Video Pertandingan', category: 'Tanding', type: 'Teknik', phase: 'TPP', detail: 'Review taktik lawan & kelemahan diri' },
  { id: 't5d', label: 'Mental Rehearsal', category: 'Tanding', type: 'Teknik', phase: 'TPP', detail: 'Visualisasi skenario pertandingan, 15 menit' },
  { id: 't6', label: 'Match Simulation', category: 'Tanding', type: 'Teknik', phase: 'TPUT', detail: 'Simulasi pertandingan sesuai aturan' },
  { id: 't6b', label: 'Shadow Sparring Timing', category: 'Tanding', type: 'Teknik', phase: 'TPUT', detail: 'Shadow fokus timing & ritme tanpa lawan' },
  { id: 't6c', label: 'Review Strategi Bertanding', category: 'Tanding', type: 'Teknik', phase: 'TPUT', detail: 'Konfirmasi strategi & skenario lawan' },
  { id: 't6d', label: 'Warm-up Match Simulation', category: 'Tanding', type: 'Teknik', phase: 'TPUT', detail: 'Pemanasan spesifik menjelang tanding' },
  // ===== Technique — Seni Tunggal =====
  { id: 's1', label: 'Jurusan Tunggal', category: 'Seni', subCategory: 'Tunggal', type: 'Teknik', phase: 'TPU', detail: 'Penguasaan bingkai jurus tunggal' },
  { id: 's2', label: 'Ketepatan Jurus Tunggal', category: 'Seni', subCategory: 'Tunggal', type: 'Teknik', phase: 'TPK', detail: 'Presisi gerakan & ritme jurus tunggal' },
  { id: 's2b', label: 'Senjata Golok Tunggal', category: 'Seni', subCategory: 'Tunggal', type: 'Teknik', phase: 'TPK', detail: 'Penggunaan golok dengan presisi & irama' },
  { id: 's2c', label: 'Senjata Toya Tunggal', category: 'Seni', subCategory: 'Tunggal', type: 'Teknik', phase: 'TPK', detail: 'Penggunaan toya: pukulan, tangkisan, putaran' },
  { id: 's2d', label: 'Ekspresi & Wiraga Tunggal', category: 'Seni', subCategory: 'Tunggal', type: 'Teknik', phase: 'TPP', detail: 'Penyempurnaan ekspresi & wiraga jurus tunggal' },
  { id: 's2e', label: 'Full Run Tunggal', category: 'Seni', subCategory: 'Tunggal', type: 'Teknik', phase: 'TPP', detail: 'Tampil penuh jurus tunggal dengan timing' },
  { id: 's2f', label: 'Polishing Tunggal', category: 'Seni', subCategory: 'Tunggal', type: 'Teknik', phase: 'TPUT', detail: 'Penyempurnaan akhir detail jurus tunggal' },
  // ===== Technique — Seni Ganda =====
  { id: 's3', label: 'Sinron Ganda', category: 'Seni', subCategory: 'Ganda', type: 'Teknik', phase: 'TPU', detail: 'Koordinasi & kompak 2 pesilat' },
  { id: 's4', label: 'Tempo Ganda', category: 'Seni', subCategory: 'Ganda', type: 'Teknik', phase: 'TPK', detail: 'Penyelarasan tempo serang-tangkis ganda' },
  { id: 's4b', label: 'Kompak Sinron Ganda', category: 'Seni', subCategory: 'Ganda', type: 'Teknik', phase: 'TPK', detail: 'Sinkronisasi serang-tangkis tanpa kontak penuh' },
  { id: 's4c', label: 'Senjata Ganda (Golok)', category: 'Seni', subCategory: 'Ganda', type: 'Teknik', phase: 'TPK', detail: 'Penggunaan sepasang golok berpasangan' },
  { id: 's4d', label: 'Ekspresi & Wirama Ganda', category: 'Seni', subCategory: 'Ganda', type: 'Teknik', phase: 'TPP', detail: 'Penyempurnaan wirama & keserasian pasangan' },
  { id: 's4e', label: 'Full Run Ganda', category: 'Seni', subCategory: 'Ganda', type: 'Teknik', phase: 'TPP', detail: 'Tampil penuh jurus ganda dengan musik' },
  // ===== Technique — Seni Regu =====
  { id: 's5', label: 'Kompak Regu', category: 'Seni', subCategory: 'Regu', type: 'Teknik', phase: 'TPU', detail: 'Formasi & urutan jurus 3 pesilat' },
  { id: 's5b', label: 'Urutan Jurus Regu', category: 'Seni', subCategory: 'Regu', type: 'Teknik', phase: 'TPK', detail: 'Hafalan & transisi urutan jurus regu' },
  { id: 's5c', label: 'Sinron Regu', category: 'Seni', subCategory: 'Regu', type: 'Teknik', phase: 'TPK', detail: 'Sinkronisasi 3 pesilat, serang-tangkis bergantian' },
  { id: 's5d', label: 'Ekspresi & Wirama Regu', category: 'Seni', subCategory: 'Regu', type: 'Teknik', phase: 'TPP', detail: 'Keserasian ekspresi 3 pesilat dengan musik' },
  { id: 's5e', label: 'Full Run Regu', category: 'Seni', subCategory: 'Regu', type: 'Teknik', phase: 'TPP', detail: 'Tampil penuh jurus regu dengan timing & musik' },
  // ===== Technique — Seni (umum, semua sub-kategori) =====
  { id: 's6', label: 'Durasi Waktu Seni', category: 'Seni', type: 'Teknik', phase: 'TPP', detail: 'Latihan kepatuhan durasi jurus sesuai regulasi IPSI' },
  { id: 's6b', label: 'Pola Irama & Musik', category: 'Seni', type: 'Teknik', phase: 'TPK', detail: 'Penyelarasan gerak dengan iringan gendang/musik' },
  { id: 's6c', label: 'Evaluasi Video Seni', category: 'Seni', type: 'Teknik', phase: 'TPP', detail: 'Review rekaman tampilan untuk perbaikan detail' },
  { id: 's6d', label: 'Polishing Seni', category: 'Seni', type: 'Teknik', phase: 'TPUT', detail: 'Penyempurnaan akhir seluruh detail tampilan seni' },
  { id: 's6e', label: 'Refres Jurus Ringan', category: 'Seni', type: 'Teknik', phase: 'TRANSISI', detail: 'Refres teknik ringan tanpa tekanan kompetisi' },
];

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function weeksUntil(dateStr: string): number {
  return Math.max(1, Math.round(daysUntil(dateStr) / 7));
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export interface PhaseWindow {
  key: PhaseKey;
  start: Date;
  end: Date;
  weeks: number;
}

export function computePhaseWindows(targetDate: string): PhaseWindow[] {
  const total = weeksUntil(targetDate);
  const windows: PhaseWindow[] = [];
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const key of PHASE_ORDER) {
    const w = Math.max(1, Math.round(total * PHASE_RATIOS[key]));
    const end = new Date(cursor);
    end.setDate(end.getDate() + w * 7);
    windows.push({ key, start: new Date(cursor), end, weeks: w });
    cursor = new Date(end);
  }
  // Ensure last phase ends at target
  if (windows.length) {
    const last = windows[windows.length - 1];
    const tgt = new Date(targetDate + 'T00:00:00');
    if (last.end < tgt) last.end = tgt;
  }
  return windows;
}

export function currentPhase(windows: PhaseWindow[]): PhaseKey | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (const w of windows) {
    if (now >= w.start && now < w.end) return w.key;
  }
  if (windows.length && now >= windows[windows.length - 1].end) return 'TRANSISI';
  return null;
}
