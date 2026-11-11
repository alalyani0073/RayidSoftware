import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Workstation', end: true },
  { to: '/overview', label: 'Unit overview' },
  { to: '/archive', label: 'Archive' },
];

export default function ChromeBar() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(timer);
  }, []);

  const clock = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#080B0E]">
      <div className="flex h-11 items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <div className="flex shrink-0 items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-[4px] bg-cyan-400/15 font-heading text-[10px] font-bold text-cyan-300 ring-1 ring-cyan-300/30">
            R
          </span>
          <span className="font-heading text-[12px] font-semibold tracking-[0.22em] text-white">RAYID</span>
          <span className="hidden rounded-[3px] border border-cyan-300/30 bg-cyan-400/10 px-1.5 py-[1px] font-mono text-[8px] uppercase tracking-[0.14em] text-cyan-300 sm:inline">
            AI layer
          </span>
        </div>

        <span className="hidden h-5 w-px bg-white/10 md:block" />

        <div className="hidden items-center gap-2 md:flex">
          <span className="text-[11px] text-slate-400">DigitalDiagnost · DR Room 2</span>
          <span className="rounded-[3px] border border-emerald-400/25 bg-emerald-400/[0.07] px-1.5 py-[1px] font-mono text-[8px] uppercase tracking-[0.12em] text-emerald-300">
            Detector ready
          </span>
        </div>

        <nav className="no-scrollbar ml-auto flex items-center gap-0.5 overflow-x-auto">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'shrink-0 rounded-[3px] px-2 py-1 text-[11px] transition-colors',
                  isActive ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-slate-200'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 pl-2 lg:flex">
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
            <Wifi className="h-3 w-3" strokeWidth={1.8} /> DICOM
          </span>
          <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
            <Activity className="h-3 w-3" strokeWidth={1.8} /> Tube 41°
          </span>
          <span className="num font-mono text-[10.5px] text-slate-400">{clock}</span>
          <span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-white/[0.05] font-mono text-[9px] text-slate-300">
            SA
          </span>
        </div>

        <span className="num font-mono text-[10px] text-slate-500 lg:hidden">{clock}</span>
      </div>
    </header>
  );
}