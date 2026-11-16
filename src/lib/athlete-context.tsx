import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Athlete } from './types';
import { fetchAthletes, createAthlete } from './api';

interface AthleteContextValue {
  athletes: Athlete[];
  selectedId: string | null;
  selected: Athlete | null;
  loading: boolean;
  error: string | null;
  select: (id: string) => void;
  refresh: () => Promise<void>;
  addAthlete: (input: Partial<Athlete>) => Promise<Athlete>;
}

const AthleteContext = createContext<AthleteContextValue | null>(null);

export function AthleteProvider({ children }: { children: ReactNode }) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAthletes();
      setAthletes(list);
      setSelectedId((prev) => {
        if (prev && list.some((a) => a.id === prev)) return prev;
        const saved = localStorage.getItem('silat.selectedAthlete');
        if (saved && list.some((a) => a.id === saved)) return saved;
        return list[0]?.id ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data atlet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    localStorage.setItem('silat.selectedAthlete', id);
  };

  const addAthlete = async (input: Partial<Athlete>) => {
    const a = await createAthlete(input);
    setAthletes((prev) => [...prev, a]);
    select(a.id);
    return a;
  };

  const selected = athletes.find((a) => a.id === selectedId) ?? null;

  return (
    <AthleteContext.Provider
      value={{ athletes, selectedId, selected, loading, error, select, refresh: load, addAthlete }}
    >
      {children}
    </AthleteContext.Provider>
  );
}

export function useAthletes() {
  const ctx = useContext(AthleteContext);
  if (!ctx) throw new Error('useAthletes must be used within AthleteProvider');
  return ctx;
}
