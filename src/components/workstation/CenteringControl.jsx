import { Loader2 } from 'lucide-react';
export default function CenteringControl({ ws }) {
  const r = ws.centerResult;
  const p = ws.projection;
  return <section className="border-t border-border bg-ws-surface p-2.5">
    <h2 className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-rayid">{ws.centering && <Loader2 className="h-3.5 w-3.5 animate-spin" />}RAYID · CENTERING ANALYSIS</h2>
    <dl className="mt-2 space-y-1.5 text-[11px]">
      <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Beam centre</dt><dd className="font-mono">H {ws.position.x > 0 ? '+' : ''}{ws.position.x} / L {ws.position.y > 0 ? '+' : ''}{ws.position.y} mm</dd></div>
      <div><dt className="text-muted-foreground">Recommended landmark</dt><dd>{p.centring}</dd></div>
      <div><dt className="text-muted-foreground">Central ray</dt><dd>{p.cr}</dd></div>
      <div><dt className="text-muted-foreground">Angulation</dt><dd>{p.angulation}</dd></div>
      <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Detector field</dt><dd className="font-mono">{p.detector}</dd></div>
    </dl>
    {r && <div className="mt-2 border border-rayid/40 bg-rayid/5 p-2 text-[11px]"><p className="font-semibold text-rayid">{r.applied ? 'CENTERING ADJUSTMENT CONFIRMED' : 'PROPOSED ADJUSTMENT · REVIEW BEFORE APPLYING'}</p><p className="mt-1">Horizontal: {r.dx} mm · Longitudinal: {r.dy} mm</p><p className="mt-0.5">Tube angle: {r.angle}°. Patient rotation is not corrected automatically.</p>{!r.applied && <button onClick={ws.applyCentering} className="mt-2 w-full rounded-sm bg-rayid px-2 py-1.5 font-semibold text-rayid-foreground">CONFIRM CENTERING ADJUSTMENT</button>}</div>}
    <p className={`mt-2 text-[11px] ${ws.positionErrors.length ? 'text-rayid' : 'text-chart-2'}`}>{ws.positionErrors.length ? `Positioning: ${ws.positionErrors.length} criterion/criteria need correction` : 'Positioning: criteria met in simulation'}</p>
    {ws.positionErrors.length > 0 && <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{ws.positionErrors[0]}</p>}
  </section>;
}