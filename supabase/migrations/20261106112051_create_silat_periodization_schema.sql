/*
# Pencak Silat Training Periodization Schema

1. New Tables
- `athletes`: master list of athletes (name, category, age, weight, belt_level)
- `championship_targets`: target competition dates used to compute peak performance
- `performance_assessments`: Schroeter & Bauersfeld achievement structure index scores (4 pillars + external/internal factors)
- `training_logs`: daily training records (phase, physical vs technique portion)
- `rpe_logs`: daily Rate of Perceived Exertion entries per session
- `injury_logs`: medical/injury records per athlete
- `weekly_programs`: weekly microcycle training programs (stored as JSON matrix)

2. Security
- Single-tenant, no auth. Enable RLS on all tables.
- Grant CRUD to anon + authenticated so the anon-key frontend can read/write.
- Policies allow all rows (USING true / WITH CHECK true) since data is intentionally shared.

3. Notes
- All id columns are uuid DEFAULT gen_random_uuid().
- Timestamps default to now().
- JSONB used for flexible structured data (assessment pillars, weekly matrices, training menus).
*/

CREATE TABLE IF NOT EXISTS athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Tanding',
  sub_category text,
  age int,
  weight numeric,
  belt_level text DEFAULT 'Dasar',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON athletes TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_athletes_sel" ON athletes;
CREATE POLICY "anon_crud_athletes_sel" ON athletes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_athletes_ins" ON athletes;
CREATE POLICY "anon_crud_athletes_ins" ON athletes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_athletes_upd" ON athletes;
CREATE POLICY "anon_crud_athletes_upd" ON athletes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_athletes_del" ON athletes;
CREATE POLICY "anon_crud_athletes_del" ON athletes FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS championship_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_date date NOT NULL,
  location text,
  level text DEFAULT 'Regional',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE championship_targets ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON championship_targets TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_ct_sel" ON championship_targets;
CREATE POLICY "anon_crud_ct_sel" ON championship_targets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_ct_ins" ON championship_targets;
CREATE POLICY "anon_crud_ct_ins" ON championship_targets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_ct_upd" ON championship_targets;
CREATE POLICY "anon_crud_ct_upd" ON championship_targets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_ct_del" ON championship_targets;
CREATE POLICY "anon_crud_ct_del" ON championship_targets FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS performance_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  physical_score int NOT NULL DEFAULT 0,
  technique_score int NOT NULL DEFAULT 0,
  tactical_score int NOT NULL DEFAULT 0,
  psychological_score int NOT NULL DEFAULT 0,
  external_notes text,
  internal_notes text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE performance_assessments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON performance_assessments TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_pa_sel" ON performance_assessments;
CREATE POLICY "anon_crud_pa_sel" ON performance_assessments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_pa_ins" ON performance_assessments;
CREATE POLICY "anon_crud_pa_ins" ON performance_assessments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_pa_upd" ON performance_assessments;
CREATE POLICY "anon_crud_pa_upd" ON performance_assessments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_pa_del" ON performance_assessments;
CREATE POLICY "anon_crud_pa_del" ON performance_assessments FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS training_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  phase text NOT NULL,
  session_type text,
  physical_minutes int DEFAULT 0,
  technique_minutes int DEFAULT 0,
  description text,
  intensity text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE training_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON training_logs TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_tl_sel" ON training_logs;
CREATE POLICY "anon_crud_tl_sel" ON training_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_tl_ins" ON training_logs;
CREATE POLICY "anon_crud_tl_ins" ON training_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_tl_upd" ON training_logs;
CREATE POLICY "anon_crud_tl_upd" ON training_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_tl_del" ON training_logs;
CREATE POLICY "anon_crud_tl_del" ON training_logs FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS rpe_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  training_log_id uuid REFERENCES training_logs(id) ON DELETE CASCADE,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  rpe_value int NOT NULL DEFAULT 5,
  duration_minutes int DEFAULT 0,
  session_load int GENERATED ALWAYS AS (rpe_value * duration_minutes) STORED,
  fatigue_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rpe_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON rpe_logs TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_rpe_sel" ON rpe_logs;
CREATE POLICY "anon_crud_rpe_sel" ON rpe_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_rpe_ins" ON rpe_logs;
CREATE POLICY "anon_crud_rpe_ins" ON rpe_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_rpe_upd" ON rpe_logs;
CREATE POLICY "anon_crud_rpe_upd" ON rpe_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_rpe_del" ON rpe_logs;
CREATE POLICY "anon_crud_rpe_del" ON rpe_logs FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS injury_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  injury_date date NOT NULL DEFAULT CURRENT_DATE,
  body_part text NOT NULL,
  injury_type text,
  severity text DEFAULT 'Ringan',
  status text DEFAULT 'Aktif',
  treatment text,
  recovery_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE injury_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON injury_logs TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_il_sel" ON injury_logs;
CREATE POLICY "anon_crud_il_sel" ON injury_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_il_ins" ON injury_logs;
CREATE POLICY "anon_crud_il_ins" ON injury_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_il_upd" ON injury_logs;
CREATE POLICY "anon_crud_il_upd" ON injury_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_il_del" ON injury_logs;
CREATE POLICY "anon_crud_il_del" ON injury_logs FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS weekly_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES athletes(id) ON DELETE CASCADE,
  phase text NOT NULL,
  week_number int NOT NULL DEFAULT 1,
  matrix jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_programs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON weekly_programs TO anon, authenticated;
DROP POLICY IF EXISTS "anon_crud_wp_sel" ON weekly_programs;
CREATE POLICY "anon_crud_wp_sel" ON weekly_programs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_wp_ins" ON weekly_programs;
CREATE POLICY "anon_crud_wp_ins" ON weekly_programs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_wp_upd" ON weekly_programs;
CREATE POLICY "anon_crud_wp_upd" ON weekly_programs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_wp_del" ON weekly_programs;
CREATE POLICY "anon_crud_wp_del" ON weekly_programs FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_athletes_name ON athletes(name);
CREATE INDEX IF NOT EXISTS idx_ct_athlete ON championship_targets(athlete_id);
CREATE INDEX IF NOT EXISTS idx_pa_athlete ON performance_assessments(athlete_id);
CREATE INDEX IF NOT EXISTS idx_tl_athlete ON training_logs(athlete_id);
CREATE INDEX IF NOT EXISTS idx_rpe_athlete ON rpe_logs(athlete_id);
CREATE INDEX IF NOT EXISTS idx_il_athlete ON injury_logs(athlete_id);
CREATE INDEX IF NOT EXISTS idx_wp_athlete ON weekly_programs(athlete_id);