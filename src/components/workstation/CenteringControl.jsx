import { Loader2 } from 'lucide-react';
export default function CenteringControl({ ws }) {
  const r = ws.centerResult;
  return <section className="border-t border-border bg-ws-surface p-3">
    <h2 className="flex items-center gap-2 text-xs font-semibold text-primary">{ws.centering && <Loader2 className="h-4 w-4 animate-spin" />}RAYID · CENTERING ANALYSIS</h2>
    <dl className="mt-3 space-y-2 text-xs"><div className="flex justify-between gap-3"><dt className="text-muted-foreground">Current beam center</dt><dd className="font-mono">H {ws.position.x > 0 ? '+' : ''}{ws.position.x} / L {ws.position.y > 0 ? '+' : ''}{ws.position.y} mm</dd></div><div><dt className="text-muted-foreground">Recommended anatomical point</dt><dd className="mt-1">{ws.projection.centring}</dd></div><div><dt className="text-muted-foreground">Central ray / angulation</dt><dd className="mt-1">{ws.projection.cr} · {ws.projection.angulation}</dd></div></dl>
    {r && <div className="mt-3 border border-primary/30 bg-primary/5 p-2.5 text-xs"><p className="font-semibold text-primary">{r.applied ? 'CENTERING ADJUSTMENT CONFIRMED' : 'PROPOSED ADJUSTMENT · REVIEW BEFORE APPLYING'}</p><p className="mt-2">Horizontal: {r.dx} mm · Longitudinal: {r.dy} mm</p><p className="mt-1">Tube angle: {r.angle}° cephalad. Patient rotation is not corrected automatically.</p>{!r.applied && <button onClick={ws.applyCentering} className="mt-3 w-full rounded-sm bg-primary px-2 py-2 font-semibold text-primary-foreground">CONFIRM CENTERING ADJUSTMENT</button>}</div>}
    <p className={`mt-3 text-xs ${ws.positionErrors.length ? 'text-chart-3' : 'text-chart-2'}`}>{ws.positionErrors.length ? `Positioning: ${ws.positionErrors.length} criterion/criteria need correction` : 'Positioning: criteria met in simulation'}</p>
    {ws.positionErrors.map(line => <p key={line} className="mt-1 text-xs leading-relaxed text-muted-foreground">{line}</p>)}
  </section>;
}