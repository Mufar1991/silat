/*
# Add readiness logs, technique videos, and report archive tables

1. New Tables
- `readiness_logs`: daily pre-training athlete readiness check-ins —
  `athlete_id` (athlete this check-in belongs to), `check_date` (date of check-in),
  `fitness_status` (energy/fitness feeling, e.g. "Segar"/"Lelah"), `sleep_hours` (numeric),
  `stress_level` (int 1-10), `notes` (free text), `created_at`.
- `technique_videos`: coach video analysis links for each athlete —
  `athlete_id`, `title`, `video_url` (YouTube/Google Drive link), `category`
  (e.g. "Sparring"/"Seni"/"Teknik"), `weakness_notes` (coach evaluation of weak points),
  `recorded_at` (date, optional), `created_at`.
- `report_archive`: records of generated/shared progress reports —
  `athlete_id`, `report_date` (date the report covers), `phase` (training phase snapshot),
  `avg_rpe` (numeric), `total_load` (int, accumulated session load AU),
  `sessions` (int, session count), `notes` (coach notes snapshot), `channel`
  (how the report was delivered: "whatsapp"/"pdf"/"manual"), `created_at`.

2. Modified Tables
- none.

3. Security
- Enable RLS on all three tables.
- Grant SELECT/INSERT/UPDATE/DELETE to anon + authenticated (single-tenant app, no sign-in).
- Policies allow all rows (USING true / WITH CHECK true) since data is intentionally shared,
  matching the existing schema convention.

4. Notes
- All id columns are uuid DEFAULT gen_random_uuid().
- Indexes on athlete_id + date columns for archive filtering and dashboard queries.
*/

CREATE TABLE IF NOT EXISTS readiness_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  check_date date NOT NULL DEFAULT CURRENT_DATE,
  fitness_status text NOT NULL DEFAULT 'Segar',
  sleep_hours numeric DEFAULT 0,
  stress_level int DEFAULT 5,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS technique_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text NOT NULL,
  category text DEFAULT 'Sparring',
  weakness_notes text,
  recorded_at date,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_archive (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  phase text,
  avg_rpe numeric,
  total_load int,
  sessions int,
  notes text,
  channel text DEFAULT 'whatsapp',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE readiness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE technique_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_archive ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON readiness_logs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON technique_videos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON report_archive TO anon, authenticated;

DROP POLICY IF EXISTS "anon_crud_rl_sel" ON readiness_logs;
CREATE POLICY "anon_crud_rl_sel" ON readiness_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_rl_ins" ON readiness_logs;
CREATE POLICY "anon_crud_rl_ins" ON readiness_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_rl_upd" ON readiness_logs;
CREATE POLICY "anon_crud_rl_upd" ON readiness_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_rl_del" ON readiness_logs;
CREATE POLICY "anon_crud_rl_del" ON readiness_logs FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_tv_sel" ON technique_videos;
CREATE POLICY "anon_crud_tv_sel" ON technique_videos FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_tv_ins" ON technique_videos;
CREATE POLICY "anon_crud_tv_ins" ON technique_videos FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_tv_upd" ON technique_videos;
CREATE POLICY "anon_crud_tv_upd" ON technique_videos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_tv_del" ON technique_videos;
CREATE POLICY "anon_crud_tv_del" ON technique_videos FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_crud_ra_sel" ON report_archive;
CREATE POLICY "anon_crud_ra_sel" ON report_archive FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_ra_ins" ON report_archive;
CREATE POLICY "anon_crud_ra_ins" ON report_archive FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_ra_upd" ON report_archive;
CREATE POLICY "anon_crud_ra_upd" ON report_archive FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_ra_del" ON report_archive;
CREATE POLICY "anon_crud_ra_del" ON report_archive FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_rl_athlete ON readiness_logs(athlete_id);
CREATE INDEX IF NOT EXISTS idx_rl_date ON readiness_logs(check_date);
CREATE INDEX IF NOT EXISTS idx_tv_athlete ON technique_videos(athlete_id);
CREATE INDEX IF NOT EXISTS idx_ra_athlete ON report_archive(athlete_id);
CREATE INDEX IF NOT EXISTS idx_ra_date ON report_archive(report_date);
