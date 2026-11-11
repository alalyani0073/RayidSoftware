import { Check, Crosshair, Loader2, Radiation } from 'lucide-react';
import ProjectionReference from '@/components/workstation/ProjectionReference';
import PositionGuidelines from '@/components/workstation/PositionGuidelines';
import PositionSimulation from '@/components/workstation/PositionSimulation';
import WorkstationIdle from '@/components/workstation/WorkstationIdle';
export default function PositioningStage({ ws }) {
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex justify-between gap-2 border-b border-border bg-ws-toolbar px-3 py-2 text-xs"><strong>{ws.projection.label} · PATIENT POSITIONING</strong><span className={ws.confirmed ? 'text-chart-2' : 'text-muted-foreground'}>{ws.confirmed ? 'Position confirmed' : 'Awaiting operator confirmation'}</span></div>
    <div className="min-h-0 flex-1 overflow-y-auto">{ws.rayidOn ? <><ProjectionReference ws={ws} /><PositionSimulation ws={ws} /><PositionGuidelines projection={ws.projection} /></> : <WorkstationIdle patientSelected projection={ws.projection} />}</div>
    <div className="border-t border-border bg-ws-toolbar p-3">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">Simulation image scenario<select value={ws.scenario} onChange={e => ws.setScenario(e.target.value)} disabled={ws.busy} className="h-8 min-w-0 flex-1 rounded-sm border border-input bg-ws-canvas px-2 text-foreground"><option value="auto">From current positioning</option><option value="motion">Added motion blur</option><option value="cutoff">Added critical anatomical cut-off</option><option value="artifact">Added external artifact</option></select></label>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">{ws.rayidOn && <button onClick={ws.autoCenter} disabled={ws.centering || ws.busy} className="flex items-center gap-1.5 rounded-sm border border-primary bg-primary/10 px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50">{ws.centering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5" />}AUTO-CENTERING</button>}<button onClick={ws.confirmPosition} disabled={ws.busy || ws.centering || ws.confirmed} className="flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-3 py-2 text-xs font-semibold disabled:opacity-50">{ws.confirmed && <Check className="h-3.5 w-3.5" />}{ws.confirmed ? 'POSITION CONFIRMED' : 'CONFIRM POSITIONING'}</button><button onClick={ws.requestExposure} disabled={!ws.confirmed || ws.busy || ws.centering} className="flex items-center gap-2 rounded-sm bg-chart-3 px-4 py-2 text-xs font-bold text-primary-foreground disabled:bg-muted disabled:text-muted-foreground">{ws.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radiation className="h-4 w-4" />}EXPOSE · SIMULATED</button></div>
      <p className="mt-2 text-[10px] text-muted-foreground">No radiation emitted. Added sample faults remain visible in both operating modes.</p>
    </div>
  </div>;
}