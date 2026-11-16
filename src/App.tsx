import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AthleteProvider } from '@/lib/athlete-context';
import { ThemeProvider } from '@/lib/theme-context';
import { AppLayout } from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import PerformanceIndex from '@/pages/PerformanceIndex';
import Periodization from '@/pages/Periodization';
import Programs from '@/pages/Programs';
import AthleteLogs from '@/pages/AthleteLogs';
import Archive from '@/pages/Archive';
import ChampionshipHub from '@/pages/ChampionshipHub';
import VideoAnalysis from '@/pages/VideoAnalysis';
import ReadinessChecklist from '@/pages/ReadinessChecklist';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AthleteProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prestasi" element={<PerformanceIndex />} />
              <Route path="/periodisasi" element={<Periodization />} />
              <Route path="/program" element={<Programs />} />
              <Route path="/log" element={<AthleteLogs />} />
              <Route path="/arsip" element={<Archive />} />
              <Route path="/kejuaraan" element={<ChampionshipHub />} />
              <Route path="/video" element={<VideoAnalysis />} />
              <Route path="/kesiapan" element={<ReadinessChecklist />} />
              <Route path="/pengaturan" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AthleteProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
