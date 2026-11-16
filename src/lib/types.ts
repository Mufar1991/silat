export interface Athlete {
  id: string;
  name: string;
  category: string; // Tanding | Seni
  sub_category?: string | null; // Tunggal | Ganda | Regu (for Seni)
  age?: number | null;
  weight?: number | null;
  belt_level?: string | null;
  created_at?: string;
}

export interface ChampionshipTarget {
  id: string;
  athlete_id: string;
  name: string;
  target_date: string;
  location?: string | null;
  level?: string | null;
  created_at?: string;
}

export interface PerformanceAssessment {
  id: string;
  athlete_id: string;
  assessment_date: string;
  physical_score: number;
  technique_score: number;
  tactical_score: number;
  psychological_score: number;
  external_notes?: string | null;
  internal_notes?: string | null;
  details?: Record<string, unknown> | null;
  created_at?: string;
}

export interface TrainingLog {
  id: string;
  athlete_id: string;
  log_date: string;
  phase: string;
  session_type?: string | null;
  physical_minutes?: number | null;
  technique_minutes?: number | null;
  description?: string | null;
  intensity?: string | null;
  created_at?: string;
}

export interface RpeLog {
  id: string;
  athlete_id: string;
  training_log_id?: string | null;
  log_date: string;
  rpe_value: number;
  duration_minutes: number;
  session_load?: number | null;
  fatigue_notes?: string | null;
  created_at?: string;
}

export interface InjuryLog {
  id: string;
  athlete_id: string;
  injury_date: string;
  body_part: string;
  injury_type?: string | null;
  severity?: string | null;
  status?: string | null;
  treatment?: string | null;
  recovery_notes?: string | null;
  created_at?: string;
}

export interface WeeklyProgram {
  id: string;
  athlete_id: string;
  phase: string;
  week_number: number;
  matrix: DayProgram[];
  created_at?: string;
}

export interface DayProgram {
  day: string;
  physical: string;
  technique: string;
  intensity: string;
}

export interface ReadinessLog {
  id: string;
  athlete_id: string;
  check_date: string;
  fitness_status: string;
  sleep_hours?: number | null;
  stress_level?: number | null;
  notes?: string | null;
  created_at?: string;
}

export interface TechniqueVideo {
  id: string;
  athlete_id: string;
  title: string;
  video_url: string;
  category?: string | null;
  weakness_notes?: string | null;
  recorded_at?: string | null;
  created_at?: string;
}

export interface ReportArchiveEntry {
  id: string;
  athlete_id: string;
  report_date: string;
  phase?: string | null;
  avg_rpe?: number | null;
  total_load?: number | null;
  sessions?: number | null;
  notes?: string | null;
  channel?: string | null;
  created_at?: string;
}

export interface PublicEvent {
  id: string;
  name: string;
  level: string;
  month_hint?: string | null;
  sort_order?: number;
  created_at?: string;
}

export interface MenuBankEntry {
  id: string;
  label: string;
  category: 'Tanding' | 'Seni' | 'Umum';
  sub_category?: string | null;
  type: 'Fisik' | 'Teknik';
  phase: PhaseKey | 'ALL';
  detail: string;
  created_at?: string;
}

export interface BackupBundle {
  version: 1;
  exported_at: string;
  athletes: Athlete[];
  championship_targets: ChampionshipTarget[];
  performance_assessments: PerformanceAssessment[];
  training_logs: TrainingLog[];
  rpe_logs: RpeLog[];
  injury_logs: InjuryLog[];
  weekly_programs: WeeklyProgram[];
  readiness_logs: ReadinessLog[];
  technique_videos: TechniqueVideo[];
  report_archive: ReportArchiveEntry[];
  public_events?: PublicEvent[];
  menu_bank?: MenuBankEntry[];
}

export type PhaseKey = 'TPU' | 'TPK' | 'TPP' | 'TPUT' | 'TRANSISI';

export interface PhaseInfo {
  key: PhaseKey;
  name: string;
  short: string;
  duration: string;
  focus: string;
  color: string;
  description: string;
  physicalMenu: string[];
  techniqueMenu: string[];
}
