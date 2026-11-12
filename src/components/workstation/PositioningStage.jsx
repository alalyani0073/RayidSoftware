import { Check, Crosshair, Loader2, Radiation, SlidersHorizontal } from 'lucide-react';
import ProjectionReference from '@/components/workstation/ProjectionReference';
import WorkstationIdle from '@/components/workstation/WorkstationIdle';
import PositioningDialog from '@/components/workstation/PositioningDialog';

export default function PositioningStage({ ws }) {
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex justify-between gap-2 border-b border-border bg-ws-toolbar px-3 py-1.5 text-xs"><strong>{ws.projection.label} · PATIENT POSITIONING</strong><span className={ws.confirmed ? 'text-chart-2' : 'text-muted-foreground'}>{ws.confirmed ? 'Position confirmed' : 'Awaiting operator confirmation'}</span></div>
    {ws.rayidOn ? <div className="flex min-h-0 flex-1 flex-col"><ProjectionReference ws={ws} /></div> : <div className="min-h-0 flex-1 overflow-y-auto"><WorkstationIdle patientSelected projection={ws.projection} /></div>}
    <div className="border-t border-border bg-ws-toolbar px-3 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">Sample<select value={ws.scenario} onChange={e => ws.setScenario(e.target.value)} disabled={ws.busy} className="h-7 rounded-sm border border-input bg-ws-canvas px-1.5 text-[11px] normal-case tracking-normal text-foreground"><option value="auto">From positioning</option><option value="motion">Motion blur</option><option value="cutoff">Anatomical cut-off</option><option value="artifact">External artifact</option></select></label>
        <span className="hidden text-[10px] text-muted-foreground sm:inline">No radiation emitted · added faults stay visible in both modes</span>
        <button onClick={() => ws.setSimOpen(true)} className="ml-auto flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-accent"><SlidersHorizontal className="h-3.5 w-3.5" />SIMULATION &amp; REFERENCE</button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">{ws.rayidOn && <button onClick={ws.autoCenter} disabled={ws.centering || ws.busy} className="flex items-center gap-1.5 rounded-sm border border-primary bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50">{ws.centering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}AUTO-CENTERING</button>}<button onClick={ws.confirmPosition} disabled={ws.busy || ws.centering || ws.confirmed} className="flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-3 py-2 text-xs font-semibold disabled:opacity-50">{ws.confirmed && <Check className="h-3.5 w-3.5" />}{ws.confirmed ? 'POSITION CONFIRMED' : 'CONFIRM POSITIONING'}</button><button onClick={ws.requestExposure} disabled={!ws.confirmed || ws.busy || ws.centering} className="flex items-center gap-2 rounded-sm bg-chart-3 px-4 py-2 text-xs font-bold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground">{ws.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radiation className="h-4 w-4" />}EXPOSE · SIMULATED</button></div>
    </div>
    <PositioningDialog ws={ws} open={ws.simOpen} onOpenChange={ws.setSimOpen} />
  </div>;
}