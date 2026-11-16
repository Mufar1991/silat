import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { Sidebar, BottomNav, AppFooter } from './Navigation';

export function AppLayout() {
  return (
    <div className="app-bg flex min-h-screen flex-col">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <TopBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
        <div className="pb-20 lg:pb-0">
          <AppFooter />
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
