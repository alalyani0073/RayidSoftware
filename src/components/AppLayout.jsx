import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Waypoints, ScanEye, Microscope, History } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';

const MOBILE_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pre-exam', label: 'Pre-Exam', icon: Waypoints },
  { to: '/live', label: 'During', icon: ScanEye },
  { to: '/post-exam', label: 'Post-Exam', icon: Microscope },
  { to: '/history', label: 'History', icon: History },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen text-foreground">
      <Sidebar />

      <div className="md:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#070B11]/85 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 font-heading text-[11px] font-semibold text-cyan-300">
                R
              </span>
              <span className="font-heading text-[13px] font-semibold tracking-[0.2em] text-white">RAYID</span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300/80">Live</span>
          </div>
          <nav className="no-scrollbar flex gap-1 overflow-x-auto px-2.5 pb-2.5">
            {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-[10px] font-medium transition-colors',
                    isActive ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400'
                  )
                }
              >
                <Icon className="h-2.5 w-2.5" strokeWidth={1.8} />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 md:px-10 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}