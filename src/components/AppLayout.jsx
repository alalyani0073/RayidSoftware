import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ChromeBar from '@/components/workstation/ChromeBar';
import ResetStudiesButton from '@/components/ResetStudiesButton';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const { pathname } = useLocation();
  const consoleView = pathname === '/';
  const [rayidOn, setRayidOn] = useState(false);

  return (
    <div className={cn('text-foreground', consoleView ? 'flex min-h-screen flex-col lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden' : 'min-h-screen')}>
      <ChromeBar rayidOn={rayidOn} onToggleRayid={() => setRayidOn(value => !value)} />
      <main
        className={cn(
          consoleView ? 'flex min-h-0 w-full flex-1 flex-col' : 'mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 md:px-10 md:py-10'
        )}
      >
        <Outlet context={{ rayidOn, setRayidOn }} />
      </main>
      <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-white/[0.06] bg-[#070A0D] px-3 py-1">
        <span className="hidden font-mono text-[8px] uppercase tracking-[0.18em] text-slate-600 sm:inline">Room 2 · Modality worklist</span>
        <ResetStudiesButton />
      </footer>
    </div>
  );
}