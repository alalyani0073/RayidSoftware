import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Monitor, Wifi } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
const NAV = [{ to: '/', label: 'Acquisition', end: true }, { to: '/archive', label: 'Exam archive' }];
const RAYID_LOGO = 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/aff78ad46_rayid-logo.jpg';
export default function ChromeBar({ rayidOn = false, onToggleRayid }) {
  const [now, setNow] = useState(() => new Date());
  const { pathname } = useLocation();
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 20000); return () => clearInterval(timer); }, []);
  return <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-ws-toolbar">
    <div className="flex min-h-12 flex-wrap items-center gap-3 px-3 py-1.5">
      <div className="flex items-center gap-2"><Monitor className="h-5 w-5 text-muted-foreground" /><span className="text-sm font-semibold tracking-wide">DR ACQUISITION</span><span className="hidden border-l border-border pl-3 text-xs text-muted-foreground sm:inline">Room 2</span></div>
      <nav className="flex items-center gap-1">{NAV.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => cn('rounded-sm px-3 py-1.5 text-xs', isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground')}>{item.label}</NavLink>)}</nav>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground lg:flex"><Wifi className="h-3.5 w-3.5" /> DICOM connected</span>
        {pathname === '/' && <button type="button" onClick={onToggleRayid} aria-label={`RAYID ${rayidOn ? 'ON' : 'OFF'}, click to ${rayidOn ? 'disable' : 'enable'} assistance`} aria-pressed={rayidOn}
          className={cn('flex items-center gap-2 rounded-sm border px-2 py-1 transition-colors', rayidOn ? 'border-rayid bg-rayid/12 text-rayid shadow-[0_0_18px_-6px_hsl(var(--rayid))]' : 'border-border bg-secondary text-muted-foreground')}>
          <Image src={RAYID_LOGO} alt="RAYID" fittingType="fit" className={cn('h-7 w-7 rounded-[3px] object-contain', !rayidOn && 'opacity-45 saturate-0')} />
          <span className={cn('text-xs font-semibold tracking-wide', rayidOn && 'text-rayid')}>RAYID</span><span className={cn('rounded-sm px-1.5 py-0.5 text-[10px] font-bold', rayidOn ? 'bg-rayid text-rayid-foreground' : 'bg-muted text-muted-foreground')}>{rayidOn ? 'ON' : 'OFF'}</span>
        </button>}
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  </header>;
}