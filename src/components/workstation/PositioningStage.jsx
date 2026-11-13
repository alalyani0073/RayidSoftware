import { Check, Crosshair, Loader2, Radiation, SlidersHorizontal } from 'lucide-react';
import ProjectionReference from '@/components/workstation/ProjectionReference';
import PositioningDialog from '@/components/workstation/PositioningDialog';

export default function PositioningStage({ ws }) {
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex min-h-0 flex-1 flex-col"><ProjectionReference ws={ws} /></div>
    <div className="flex flex-wrap items-center gap-2 border-t border-border bg-ws-toolbar px-3 py-2">
      <button onClick={() => ws.setSimOpen(true)} className="flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent"><SlidersHorizontal className="h-3.5 w-3.5" />POSITIONING CONTROLS</button>
      {ws.rayidOn && <button onClick={ws.autoCenter} disabled={ws.centering || ws.busy} className="flex items-center gap-1.5 rounded-sm border border-rayid bg-rayid/10 px-3 py-1.5 text-[11px] font-semibold text-rayid disabled:opacity-50">{ws.centering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}AUTO-CENTERING</button>}
      <button onClick={ws.confirmPosition} disabled={ws.busy || ws.centering || ws.confirmed} className="ml-auto flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-3 py-1.5 text-[11px] font-semibold disabled:opacity-50">{ws.confirmed && <Check className="h-3.5 w-3.5" />}{ws.confirmed ? 'POSITION CONFIRMED' : 'CONFIRM POSITIONING'}</button>
      <button onClick={ws.requestExposure} disabled={!ws.confirmed || ws.busy || ws.centering} className="flex items-center gap-2 rounded-sm bg-chart-3 px-4 py-1.5 text-[11px] font-bold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground">{ws.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radiation className="h-4 w-4" />}EXPOSE</button>
    </div>
    <PositioningDialog ws={ws} open={ws.simOpen} onOpenChange={ws.setSimOpen} />
  </div>;
}