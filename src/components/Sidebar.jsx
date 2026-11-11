import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Waypoints, ScanEye, Microscope, History, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', hint: 'Unit overview', icon: LayoutDashboard },
  { to: '/pre-exam', label: 'Pre-Exam', hint: 'Protocol fit', icon: Waypoints },
  { to: '/live', label: 'During Exam', hint: 'Positioning', icon: ScanEye },
  { to: '/post-exam', label: 'Post-Exam', hint: 'Image evaluation', icon: Microscope },
  { to: '/history', label: 'Exam History', hint: 'Audit trail', icon: History },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-white/[0.06] bg-[#070B11]/90 backdrop-blur-xl md:flex">
      <div className="px-6 pb-6 pt-7">
        <div className="flex items-center gap-3">
          <RayidMark />
          <div className="leading-none">
            <div className="font-heading text-[17px] font-semibold tracking-[0.18em] text-white">RAYID</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-slate-500">Imaging intelligence</div>
          </div>
        </div>
      </div>

      <div className="hairline" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 font-mono text-[9px] uppercase tracking-[0.24em] text-slate-600">Workflow</p>
        {NAV.map(({ to, label, hint, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200',
                isActive
                  ? 'bg-cyan-400/[0.09] text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-cyan-300 transition-opacity',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <Icon className={cn('h-[17px] w-[17px] shrink-0', isActive ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300')} strokeWidth={1.6} />
                <span className="flex-1">
                  <span className="block text-[13px] font-medium leading-tight">{label}</span>
                  <span className="block text-[10.5px] leading-tight text-slate-500">{hint}</span>
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-rayid-pulse rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/90">System nominal</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
            <Activity className="h-3 w-3" strokeWidth={1.8} />
            <span>Depth sensor · 30 fps</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Vendor-neutral · Room 2</div>
        </div>
      </div>
    </aside>
  );
}

function RayidMark() {
  return (
    <div className="relative grid h-10 w-10 place-items-center rounded-[11px] border border-cyan-300/30 bg-cyan-400/[0.08]">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" strokeLinecap="round" />
        <path d="M9 15l2.6-3 1.9 1.6L16 10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute inset-0 rounded-[11px] bg-cyan-400/10 blur-md" />
    </div>
  );
}