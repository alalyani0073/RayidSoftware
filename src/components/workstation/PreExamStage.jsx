import { REGIONS, projectionsInRegion } from '@/lib/protocols';
import ProjectionReference from '@/components/workstation/ProjectionReference';
import PositionGuidelines from '@/components/workstation/PositionGuidelines';
export default function PreExamStage({ ws }) {
  const p = ws.projection;
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="border-b border-border bg-ws-surface p-3">
      <h2 className="mb-3 text-xs font-semibold text-muted-foreground">EXAMINATION / ACQUISITION PROTOCOL</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-muted-foreground">Anatomical region<select aria-label="Anatomical region" value={p.region} onChange={e => ws.chooseProjection(projectionsInRegion(e.target.value)[0].key)} className="mt-1 h-9 w-full rounded-sm border border-input bg-ws-canvas px-2 text-foreground">{REGIONS.map(r => <option key={r}>{r}</option>)}</select></label>
        <label className="text-xs text-muted-foreground">Examination<select aria-label="Examination" value={p.name} onChange={e => ws.chooseProjection(projectionsInRegion(p.region).find(item => item.name === e.target.value).key)} className="mt-1 h-9 w-full rounded-sm border border-input bg-ws-canvas px-2 text-foreground">{[...new Set(projectionsInRegion(p.region).map(item => item.name))].map(n => <option key={n}>{n}</option>)}</select></label>
        <label className="text-xs text-muted-foreground">Projection<select aria-label="Projection" value={p.key} onChange={e => ws.chooseProjection(e.target.value)} className="mt-1 h-9 w-full rounded-sm border border-input bg-ws-canvas px-2 text-foreground">{projectionsInRegion(p.region).filter(item => item.name === p.name).map(item => <option key={item.key} value={item.key}>{item.view}</option>)}</select></label>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{p.detector}</span><span>Grid: {p.grid}</span><span>SID: {ws.technique.sid_cm} cm</span><span>Side: {ws.exam.laterality === 'not_applicable' ? 'Midline' : ws.exam.laterality}</span></div>
    </div>
    <div className={`min-h-0 flex-1 overflow-y-auto lg:grid lg:grid-rows-[minmax(0,1fr)] lg:overflow-hidden ${ws.rayidOn ? 'lg:grid-cols-[minmax(0,1fr)_270px]' : 'lg:grid-cols-[minmax(0,1fr)]'}`}>
      <ProjectionReference ws={ws} referenceOnly />
      {ws.rayidOn && <div className="min-h-0 border-t border-border lg:overflow-y-auto lg:border-l lg:border-t-0"><PositionGuidelines projection={p} /></div>}
    </div>
    <div className="flex items-center justify-between gap-3 border-t border-border bg-ws-toolbar p-3"><span className="text-xs text-muted-foreground">Verify identity, projection and technique.</span><button onClick={ws.prepare} disabled={ws.busy} className="rounded-sm bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent">CONFIRM TECHNIQUE / POSITION PATIENT</button></div>
  </div>;
}