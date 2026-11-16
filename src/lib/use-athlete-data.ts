import { useCallback, useEffect, useState } from 'react';
import { useAthletes } from './athlete-context';
import {
  fetchTargets,
  fetchAssessments,
  fetchTrainingLogs,
  fetchRpeLogs,
  fetchInjuryLogs,
  fetchWeeklyPrograms,
} from './api';
import type {
  ChampionshipTarget,
  PerformanceAssessment,
  TrainingLog,
  RpeLog,
  InjuryLog,
  WeeklyProgram,
} from './types';

interface AthleteData {
  targets: ChampionshipTarget[];
  assessments: PerformanceAssessment[];
  trainingLogs: TrainingLog[];
  rpeLogs: RpeLog[];
  injuryLogs: InjuryLog[];
  weeklyPrograms: WeeklyProgram[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useAthleteData(): AthleteData {
  const { selected } = useAthletes();
  const [targets, setTargets] = useState<ChampionshipTarget[]>([]);
  const [assessments, setAssessments] = useState<PerformanceAssessment[]>([]);
  const [trainingLogs, setTrainingLogs] = useState<TrainingLog[]>([]);
  const [rpeLogs, setRpeLogs] = useState<RpeLog[]>([]);
  const [injuryLogs, setInjuryLogs] = useState<InjuryLog[]>([]);
  const [weeklyPrograms, setWeeklyPrograms] = useState<WeeklyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!selected) {
      setTargets([]); setAssessments([]); setTrainingLogs([]); setRpeLogs([]); setInjuryLogs([]); setWeeklyPrograms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [t, a, tl, r, i, w] = await Promise.all([
        fetchTargets(selected.id),
        fetchAssessments(selected.id),
        fetchTrainingLogs(selected.id),
        fetchRpeLogs(selected.id),
        fetchInjuryLogs(selected.id),
        fetchWeeklyPrograms(selected.id),
      ]);
      setTargets(t);
      setAssessments(a);
      setTrainingLogs(tl);
      setRpeLogs(r);
      setInjuryLogs(i);
      setWeeklyPrograms(w);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { targets, assessments, trainingLogs, rpeLogs, injuryLogs, weeklyPrograms, loading, error, reload };
}
