import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ChromeBar from '@/components/workstation/ChromeBar';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const { pathname } = useLocation();
  const consoleView = pathname === '/';
  const [rayidOn, setRayidOn] = useState(false);

  return (
    <div className="min-h-screen text-foreground">
      <ChromeBar rayidOn={rayidOn} onToggleRayid={() => setRayidOn(value => !value)} />
      <main
        className={cn(
          consoleView ? 'w-full' : 'mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 md:px-10 md:py-10'
        )}
      >
        <Outlet context={{ rayidOn, setRayidOn }} />
      </main>
    </div>
  );
}