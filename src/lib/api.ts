import { supabase } from './supabase';
import type {
  Athlete,
  ChampionshipTarget,
  PerformanceAssessment,
  TrainingLog,
  RpeLog,
  InjuryLog,
  WeeklyProgram,
  ReadinessLog,
  TechniqueVideo,
  ReportArchiveEntry,
  PublicEvent,
  MenuBankEntry,
} from './types';

// Athletes
export async function fetchAthletes(): Promise<Athlete[]> {
  const { data, error } = await supabase.from('athletes').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createAthlete(input: Partial<Athlete>): Promise<Athlete> {
  const { data, error } = await supabase.from('athletes').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateAthlete(id: string, input: Partial<Athlete>): Promise<Athlete> {
  const { data, error } = await supabase.from('athletes').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAthlete(id: string): Promise<void> {
  const { error } = await supabase.from('athletes').delete().eq('id', id);
  if (error) throw error;
}

// Championship targets
export async function fetchTargets(athleteId: string): Promise<ChampionshipTarget[]> {
  const { data, error } = await supabase
    .from('championship_targets')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('target_date');
  if (error) throw error;
  return data ?? [];
}

export async function createTarget(input: Partial<ChampionshipTarget>): Promise<ChampionshipTarget> {
  const { data, error } = await supabase.from('championship_targets').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTarget(id: string): Promise<void> {
  const { error } = await supabase.from('championship_targets').delete().eq('id', id);
  if (error) throw error;
}

// Performance assessments
export async function fetchAssessments(athleteId: string): Promise<PerformanceAssessment[]> {
  const { data, error } = await supabase
    .from('performance_assessments')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('assessment_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAssessment(input: Partial<PerformanceAssessment>): Promise<PerformanceAssessment> {
  const { data, error } = await supabase.from('performance_assessments').insert(input).select().single();
  if (error) throw error;
  return data;
}

// Training logs
export async function fetchTrainingLogs(athleteId: string): Promise<TrainingLog[]> {
  const { data, error } = await supabase
    .from('training_logs')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('log_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTrainingLog(input: Partial<TrainingLog>): Promise<TrainingLog> {
  const { data, error } = await supabase.from('training_logs').insert(input).select().single();
  if (error) throw error;
  return data;
}

// RPE logs
export async function fetchRpeLogs(athleteId: string): Promise<RpeLog[]> {
  const { data, error } = await supabase
    .from('rpe_logs')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('log_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createRpeLog(input: Partial<RpeLog>): Promise<RpeLog> {
  const { data, error } = await supabase.from('rpe_logs').insert(input).select().single();
  if (error) throw error;
  return data;
}

// Injury logs
export async function fetchInjuryLogs(athleteId: string): Promise<InjuryLog[]> {
  const { data, error } = await supabase
    .from('injury_logs')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('injury_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createInjuryLog(input: Partial<InjuryLog>): Promise<InjuryLog> {
  const { data, error } = await supabase.from('injury_logs').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateInjuryLog(id: string, input: Partial<InjuryLog>): Promise<InjuryLog> {
  const { data, error } = await supabase.from('injury_logs').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Weekly programs
export async function fetchWeeklyPrograms(athleteId: string): Promise<WeeklyProgram[]> {
  const { data, error } = await supabase
    .from('weekly_programs')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('week_number');
  if (error) throw error;
  return data ?? [];
}

export async function saveWeeklyProgram(input: Partial<WeeklyProgram>): Promise<WeeklyProgram> {
  const { data, error } = await supabase.from('weekly_programs').insert(input).select().single();
  if (error) throw error;
  return data;
}

// Readiness check-ins
export async function fetchReadinessLogs(athleteId: string): Promise<ReadinessLog[]> {
  const { data, error } = await supabase
    .from('readiness_logs')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('check_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReadinessLog(input: Partial<ReadinessLog>): Promise<ReadinessLog> {
  const { data, error } = await supabase.from('readiness_logs').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function fetchAllReadinessLogs(): Promise<ReadinessLog[]> {
  const { data, error } = await supabase
    .from('readiness_logs')
    .select('*')
    .order('check_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Technique videos
export async function fetchVideos(athleteId: string): Promise<TechniqueVideo[]> {
  const { data, error } = await supabase
    .from('technique_videos')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createVideo(input: Partial<TechniqueVideo>): Promise<TechniqueVideo> {
  const { data, error } = await supabase.from('technique_videos').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteVideo(id: string): Promise<void> {
  const { error } = await supabase.from('technique_videos').delete().eq('id', id);
  if (error) throw error;
}

// Report archive
export async function fetchArchive(athleteId?: string): Promise<ReportArchiveEntry[]> {
  let q = supabase.from('report_archive').select('*').order('report_date', { ascending: false });
  if (athleteId) q = q.eq('athlete_id', athleteId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createArchiveEntry(input: Partial<ReportArchiveEntry>): Promise<ReportArchiveEntry> {
  const { data, error } = await supabase.from('report_archive').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function deleteArchiveEntry(id: string): Promise<void> {
  const { error } = await supabase.from('report_archive').delete().eq('id', id);
  if (error) throw error;
}

// Public championship calendar
export async function fetchPublicEvents(): Promise<PublicEvent[]> {
  const { data, error } = await supabase
    .from('public_events')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function createPublicEvent(input: Partial<PublicEvent>): Promise<PublicEvent> {
  const { data, error } = await supabase.from('public_events').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updatePublicEvent(id: string, input: Partial<PublicEvent>): Promise<PublicEvent> {
  const { data, error } = await supabase.from('public_events').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deletePublicEvent(id: string): Promise<void> {
  const { error } = await supabase.from('public_events').delete().eq('id', id);
  if (error) throw error;
}

// Training menu bank
export async function fetchMenuBank(): Promise<MenuBankEntry[]> {
  const { data, error } = await supabase.from('menu_bank').select('*').order('label');
  if (error) throw error;
  return data ?? [];
}

export async function createMenuBankEntry(input: Partial<MenuBankEntry>): Promise<MenuBankEntry> {
  const { data, error } = await supabase.from('menu_bank').insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function updateMenuBankEntry(id: string, input: Partial<MenuBankEntry>): Promise<MenuBankEntry> {
  const { data, error } = await supabase.from('menu_bank').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMenuBankEntry(id: string): Promise<void> {
  const { error } = await supabase.from('menu_bank').delete().eq('id', id);
  if (error) throw error;
}

// Backup / restore — fetch every table (no athlete filter)
export async function fetchAllForBackup() {
  const tables = [
    'athletes',
    'championship_targets',
    'performance_assessments',
    'training_logs',
    'rpe_logs',
    'injury_logs',
    'weekly_programs',
    'readiness_logs',
    'technique_videos',
    'report_archive',
    'public_events',
    'menu_bank',
  ] as const;
  const results = await Promise.all(
    tables.map(async (t) => {
      const { data, error } = await supabase.from(t).select('*');
      if (error) throw error;
      return data ?? [];
    }),
  );
  const [athletes, championship_targets, performance_assessments, training_logs, rpe_logs, injury_logs, weekly_programs, readiness_logs, technique_videos, report_archive, public_events, menu_bank] = results;
  return { athletes, championship_targets, performance_assessments, training_logs, rpe_logs, injury_logs, weekly_programs, readiness_logs, technique_videos, report_archive, public_events, menu_bank };
}

// Restore inserts rows table-by-table; athletes first (parents before children).
export async function restoreBackup(bundle: Record<string, unknown[]>) {
  const order = [
    'athletes',
    'championship_targets',
    'performance_assessments',
    'training_logs',
    'rpe_logs',
    'injury_logs',
    'weekly_programs',
    'readiness_logs',
    'technique_videos',
    'report_archive',
    'public_events',
    'menu_bank',
  ] as const;
  for (const table of order) {
    const rows = bundle[table];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const clean = rows.map((r) => {
      const row = { ...(r as Record<string, unknown>) };
      delete row.created_at;
      return row;
    });
    const { error } = await supabase.from(table).upsert(clean, { ignoreDuplicates: true });
    if (error) throw error;
  }
}
