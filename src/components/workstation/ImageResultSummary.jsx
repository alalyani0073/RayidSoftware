import { Check, AlertTriangle } from 'lucide-react';
export default function ImageResultSummary({ ws }) {
  const a = ws.assessment;
  if (!ws.rayidOn) return null;
  if (ws.evaluating || !a) return <div className="border-t border-border bg-ws-surface px-3 py-2 text-[11px] text-rayid">Running RAYID assessment…</div>;
  return <div className="border-t border-border bg-ws-surface px-3 py-2">
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="font-mono text-xl font-bold leading-none text-rayid">{a.quality_score}%</span>
      <span className={`flex items-center gap-1 border px-2 py-0.5 text-[10px] font-bold ${a.accepted ? 'border-chart-2/50 text-chart-2' : 'border-destructive/60 text-destructive'}`}>{a.accepted ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}{a.accepted ? 'ACCEPTED' : 'NEEDS CORRECTION'}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">RAYID image assessment · {ws.simCase?.label}</span>
    </div>
    {a.detected.length > 0 && <p className="mt-1 text-[11px] leading-snug"><b className="text-destructive">DETECTED ERROR:</b> <span className="text-foreground">{a.detected[0].title} — {a.detected[0].detail}</span></p>}
    <p className="text-[11px] leading-snug"><b className="text-foreground">RECOMMENDATION:</b> <span className="text-muted-foreground">{a.recommendation}</span></p>
  </div>;
}