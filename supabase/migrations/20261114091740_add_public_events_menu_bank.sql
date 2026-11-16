/*
# Add public championship calendar and editable training menu bank

1. New Tables
- `public_events`: the general/routine pencak silat championship calendar shown on the Championship Hub.
  - `id` (text, primary key) — stable slug so seeded rows are idempotent
  - `name` (text, not null) — championship name
  - `level` (text, not null) — competition level (e.g. Provinsi, Regional, Nasional)
  - `month_hint` (text, nullable) — optional note about usual month/timing
  - `sort_order` (integer, not null, default 0) — display ordering
  - `created_at` (timestamptz, default now())
- `menu_bank`: coach-editable training menu items used on the Programs page ("Bank Menu Latihan Silat").
  - `id` (text, primary key) — stable slug matching the previously hard-coded items
  - `label` (text, not null) — menu name
  - `category` (text, not null) — Tanding | Seni | Umum
  - `sub_category` (text, nullable) — Tunggal | Ganda | Regu (for Seni)
  - `type` (text, not null) — Fisik | Teknik
  - `phase` (text, not null) — TPU | TPK | TPP | TPUT | TRANSISI | ALL
  - `detail` (text, not null) — dosage/duration/reps/movement description
  - `created_at` (timestamptz, default now())

2. Seeded Data
- `public_events` seeded with the 6 previously hard-coded preset events (O2SN, Popda, Popwil,
  Kejurnas, PON, Kejurda) using stable ids and ON CONFLICT DO NOTHING.
- `menu_bank` seeded with all previously hard-coded menu items from the front-end constants,
  keeping their existing ids, so nothing changes visually on first load and every item becomes editable.

3. Security
- Enable RLS on both tables.
- Grant SELECT, INSERT, UPDATE, DELETE to anon + authenticated (single-tenant app, no sign-in).
- Four separate policies per table (SELECT/INSERT/UPDATE/DELETE) allowing anon + authenticated,
  because the data is intentionally shared across the perguruan's coaches.
*/

CREATE TABLE IF NOT EXISTS public_events (
  id text PRIMARY KEY,
  name text NOT NULL,
  level text NOT NULL DEFAULT 'Provinsi',
  month_hint text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS menu_bank (
  id text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL,
  sub_category text,
  type text NOT NULL,
  phase text NOT NULL DEFAULT 'ALL',
  detail text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

INSERT INTO public_events (id, name, level, sort_order) VALUES
  ('ev_o2sn', 'O2SN (Olimpiade Sains Nasional/Siswa Nasional)', 'Provinsi', 1),
  ('ev_popda', 'Popda (Pekan Olahraga Pelajar Daerah)', 'Provinsi', 2),
  ('ev_popwil', 'Popwil (Pekan Olahraga Pelajar Wilayah)', 'Regional', 3),
  ('ev_kejurnas', 'Kejurnas (Kejuaraan Nasional IPSI)', 'Nasional', 4),
  ('ev_pon', 'PON (Pekan Olahraga Nasional)', 'Nasional', 5),
  ('ev_kejurda', 'Kejurda (Kejuaraan Daerah IPSI)', 'Provinsi', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_bank (id, label, category, sub_category, type, phase, detail) VALUES
  ('p1', 'Lari Aerobik', 'Umum', NULL, 'Fisik', 'TPU', 'Lari 5–8 km, denyut nadi 60–75% MHR'),
  ('p2', 'Skipping Interval', 'Umum', NULL, 'Fisik', 'TPU', '3x3 menit, ritme bergantian cepat-lambat'),
  ('p3', 'Renang Pemulihan', 'Umum', NULL, 'Fisik', 'TPU', '30–45 menit gaya bebas, low impact'),
  ('p3b', 'Circuit Training Inti', 'Umum', NULL, 'Fisik', 'TPU', '5 stasiun: plank, sit-up, push-up, back, squat — 3 putaran'),
  ('p3c', 'Mobilitas & Peregangan', 'Umum', NULL, 'Fisik', 'TPU', 'Peregangan dinamis seluruh sendi, 15 menit'),
  ('p4', 'Interval Anaerobik', 'Umum', NULL, 'Fisik', 'TPK', '30s sprint / 30s jalan, 10–12 set'),
  ('p5', 'Pliometrik Box Jump', 'Umum', NULL, 'Fisik', 'TPK', '4x8 reps, tinggi 40–60 cm'),
  ('p6', 'Agility Ladder', 'Umum', NULL, 'Fisik', 'TPK', 'Pola Ickey shuffle, in-out, 6 set'),
  ('p6b', 'Cone Drill Zigzag', 'Umum', NULL, 'Fisik', 'TPK', 'Belokan cepat antar cone 5m, 8 set'),
  ('p6c', 'Kettlebell Swing', 'Umum', NULL, 'Fisik', 'TPK', '4x15 reps, kekuatan eksplosif pinggul'),
  ('p6d', 'Medicine Ball Slam', 'Umum', NULL, 'Fisik', 'TPK', '4x10 reps, power otot inti'),
  ('p7', 'Shuttle Run Stamina', 'Umum', NULL, 'Fisik', 'TPP', '4x15m bolak-balik, 3 set dengan istirahat 90s'),
  ('p8', 'Burpee Jump Squat', 'Umum', NULL, 'Fisik', 'TPP', '5x10 reps, eksplosif'),
  ('p8b', 'Speed Bag Reflex', 'Umum', NULL, 'Fisik', 'TPP', 'Reflex & kecepatan tangan, 3x1 menit'),
  ('p8c', 'Depth Jump', 'Umum', NULL, 'Fisik', 'TPP', 'Melompat dari box lalu melompat naik, 4x6 reps'),
  ('p9', 'Tapering Shadow', 'Umum', NULL, 'Fisik', 'TPUT', 'Shadow 3x2 menit, intensitas 50%'),
  ('p9b', 'Jogging Ringan Taper', 'Umum', NULL, 'Fisik', 'TPUT', '15–20 menit, detak nadi < 60% MHR'),
  ('p9c', 'Pemulihan Aktif Sauna', 'Umum', NULL, 'Fisik', 'TPUT', 'Sauna/kontras air panas-dingin 15 menit'),
  ('p10', 'Active Recovery Jog', 'Umum', NULL, 'Fisik', 'TRANSISI', 'Jogging santai 20–30 menit'),
  ('p10b', 'Yoga & Mobilitas', 'Umum', NULL, 'Fisik', 'TRANSISI', 'Sesi yoga 30 menit, fokus kelenturan & relaksasi'),
  ('p10c', 'Rekreasi Sepeda/Hiking', 'Umum', NULL, 'Fisik', 'TRANSISI', 'Aktivitas ringan menjaga kebugaran tanpa stres'),
  ('t1', 'Langkah & Sikap Pasang', 'Tanding', NULL, 'Teknik', 'TPU', 'Drill langkah maju-mundur, sikap pasang'),
  ('t2', 'Tendangan Dasar', 'Tanding', NULL, 'Teknik', 'TPU', 'Tendangan depan, T, sabit, jejek'),
  ('t2b', 'Pukulan Dasar', 'Tanding', NULL, 'Teknik', 'TPU', 'Pukulan depan, melingkar, bandul, tegak'),
  ('t2c', 'Tangkisan & Elakan', 'Tanding', NULL, 'Teknik', 'TPU', 'Tangkisan luar, dalam, bawah, elakan bawah'),
  ('t2d', 'Kuda-kuda & Posisi', 'Tanding', NULL, 'Teknik', 'TPU', 'Kuda-kuda depan, samping, belakang, silang'),
  ('t2e', 'Pola Serang Dasar', 'Tanding', NULL, 'Teknik', 'TPU', 'Serang maju 1-2-3 dengan kontrol jarak'),
  ('t3', 'Kombinasi Serang', 'Tanding', NULL, 'Teknik', 'TPK', 'Pukul-tendang-tangkis beruntun'),
  ('t4', 'Counter Attack', 'Tanding', NULL, 'Teknik', 'TPK', 'Tangkisan-elakan-serangan balik'),
  ('t4b', 'Tendangan Lompat', 'Tanding', NULL, 'Teknik', 'TPK', 'Tendangan lompat sabit & jejek, 3x8 reps'),
  ('t4c', 'Tendangan Beruntun', 'Tanding', NULL, 'Teknik', 'TPK', '2–3 tendangan beruntun tanpa berhenti'),
  ('t4d', 'Bantingan & Jatuhan', 'Tanding', NULL, 'Teknik', 'TPK', 'Teknik bantingan dasar & jatuhan terkontrol'),
  ('t4e', 'Bioteknik Perorangan', 'Tanding', NULL, 'Teknik', 'TPK', 'Drill bioteknik mandiri fokus kecepatan'),
  ('t5', 'Sparring Try-Out', 'Tanding', NULL, 'Teknik', 'TPP', 'Sparring 3x2 menit dengan lawan undangan'),
  ('t5b', 'Simulasi Lawan Agresor', 'Tanding', NULL, 'Teknik', 'TPP', 'Hadapi lawan agresif, fokus pertahanan & balasan'),
  ('t5c', 'Analisis Video Pertandingan', 'Tanding', NULL, 'Teknik', 'TPP', 'Review taktik lawan & kelemahan diri'),
  ('t5d', 'Mental Rehearsal', 'Tanding', NULL, 'Teknik', 'TPP', 'Visualisasi skenario pertandingan, 15 menit'),
  ('t6', 'Match Simulation', 'Tanding', NULL, 'Teknik', 'TPUT', 'Simulasi pertandingan sesuai aturan'),
  ('t6b', 'Shadow Sparring Timing', 'Tanding', NULL, 'Teknik', 'TPUT', 'Shadow fokus timing & ritme tanpa lawan'),
  ('t6c', 'Review Strategi Bertanding', 'Tanding', NULL, 'Teknik', 'TPUT', 'Konfirmasi strategi & skenario lawan'),
  ('t6d', 'Warm-up Match Simulation', 'Tanding', NULL, 'Teknik', 'TPUT', 'Pemanasan spesifik menjelang tanding'),
  ('s1', 'Jurusan Tunggal', 'Seni', 'Tunggal', 'Teknik', 'TPU', 'Penguasaan bingkai jurus tunggal'),
  ('s2', 'Ketepatan Jurus Tunggal', 'Seni', 'Tunggal', 'Teknik', 'TPK', 'Presisi gerakan & ritme jurus tunggal'),
  ('s2b', 'Senjata Golok Tunggal', 'Seni', 'Tunggal', 'Teknik', 'TPK', 'Penggunaan golok dengan presisi & irama'),
  ('s2c', 'Senjata Toya Tunggal', 'Seni', 'Tunggal', 'Teknik', 'TPK', 'Penggunaan toya: pukulan, tangkisan, putaran'),
  ('s2d', 'Ekspresi & Wiraga Tunggal', 'Seni', 'Tunggal', 'Teknik', 'TPP', 'Penyempurnaan ekspresi & wiraga jurus tunggal'),
  ('s2e', 'Full Run Tunggal', 'Seni', 'Tunggal', 'Teknik', 'TPP', 'Tampil penuh jurus tunggal dengan timing'),
  ('s2f', 'Polishing Tunggal', 'Seni', 'Tunggal', 'Teknik', 'TPUT', 'Penyempurnaan akhir detail jurus tunggal'),
  ('s3', 'Sinron Ganda', 'Seni', 'Ganda', 'Teknik', 'TPU', 'Koordinasi & kompak 2 pesilat'),
  ('s4', 'Tempo Ganda', 'Seni', 'Ganda', 'Teknik', 'TPK', 'Penyelarasan tempo serang-tangkis ganda'),
  ('s4b', 'Kompak Sinron Ganda', 'Seni', 'Ganda', 'Teknik', 'TPK', 'Sinkronisasi serang-tangkis tanpa kontak penuh'),
  ('s4c', 'Senjata Ganda (Golok)', 'Seni', 'Ganda', 'Teknik', 'TPK', 'Penggunaan sepasang golok berpasangan'),
  ('s4d', 'Ekspresi & Wirama Ganda', 'Seni', 'Ganda', 'Teknik', 'TPP', 'Penyempurnaan wirama & keserasian pasangan'),
  ('s4e', 'Full Run Ganda', 'Seni', 'Ganda', 'Teknik', 'TPP', 'Tampil penuh jurus ganda dengan musik'),
  ('s5', 'Kompak Regu', 'Seni', 'Regu', 'Teknik', 'TPU', 'Formasi & urutan jurus 3 pesilat'),
  ('s5b', 'Urutan Jurus Regu', 'Seni', 'Regu', 'Teknik', 'TPK', 'Hafalan & transisi urutan jurus regu'),
  ('s5c', 'Sinron Regu', 'Seni', 'Regu', 'Teknik', 'TPK', 'Sinkronisasi 3 pesilat, serang-tangkis bergantian'),
  ('s5d', 'Ekspresi & Wirama Regu', 'Seni', 'Regu', 'Teknik', 'TPP', 'Keserasian ekspresi 3 pesilat dengan musik'),
  ('s5e', 'Full Run Regu', 'Seni', 'Regu', 'Teknik', 'TPP', 'Tampil penuh jurus regu dengan timing & musik'),
  ('s6', 'Durasi Waktu Seni', 'Seni', NULL, 'Teknik', 'TPP', 'Latihan kepatuhan durasi jurus sesuai regulasi IPSI'),
  ('s6b', 'Pola Irama & Musik', 'Seni', NULL, 'Teknik', 'TPK', 'Penyelarasan gerak dengan iringan gendang/musik'),
  ('s6c', 'Evaluasi Video Seni', 'Seni', NULL, 'Teknik', 'TPP', 'Review rekaman tampilan untuk perbaikan detail'),
  ('s6d', 'Polishing Seni', 'Seni', NULL, 'Teknik', 'TPUT', 'Penyempurnaan akhir seluruh detail tampilan seni'),
  ('s6e', 'Refres Jurus Ringan', 'Seni', NULL, 'Teknik', 'TRANSISI', 'Refres teknik ringan tanpa tekanan kompetisi')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_bank ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public_events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON menu_bank TO anon, authenticated;

DROP POLICY IF EXISTS "anon_crud_pe_sel" ON public_events;
CREATE POLICY "anon_crud_pe_sel" ON public_events FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_pe_ins" ON public_events;
CREATE POLICY "anon_crud_pe_ins" ON public_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_pe_upd" ON public_events;
CREATE POLICY "anon_crud_pe_upd" ON public_events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_pe_del" ON public_events;
CREATE POLICY "anon_crud_pe_del" ON public_events FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_mb_sel" ON menu_bank;
CREATE POLICY "anon_crud_mb_sel" ON menu_bank FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_mb_ins" ON menu_bank;
CREATE POLICY "anon_crud_mb_ins" ON menu_bank FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_mb_upd" ON menu_bank;
CREATE POLICY "anon_crud_mb_upd" ON menu_bank FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_mb_del" ON menu_bank;
CREATE POLICY "anon_crud_mb_del" ON menu_bank FOR DELETE TO anon, authenticated USING (true);
