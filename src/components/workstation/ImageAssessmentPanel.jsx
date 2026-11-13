import { Loader2, Check, AlertTriangle } from 'lucide-react';
export default function ImageAssessmentPanel({ ws }) {
  const a = ws.assessment;
  return <section className="bg-ws-surface p-2.5">
    <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-rayid">RAYID · IMAGE QUALITY FINDINGS</h2>
    {ws.evaluating ? <p className="mt-3 flex items-center gap-2 text-xs text-rayid"><Loader2 className="h-4 w-4 animate-spin" /> Analysing image quality…</p> : a && <>
      <div className="mt-2 flex items-end justify-between gap-2"><strong className={`font-mono text-3xl leading-none ${a.accepted ? 'text-chart-2' : 'text-rayid'}`}>{a.quality_score}%</strong><span className="pb-0.5 text-[10px] text-muted-foreground">Threshold 90%</span></div>
      <p className={`mt-1.5 border px-2 py-1 text-[11px] font-bold ${a.accepted ? 'border-chart-2/40 text-chart-2' : 'border-rayid/50 text-rayid'}`}>{a.accepted ? 'ACCEPTED · CRITERIA MET' : 'NEEDS CORRECTION'}</p>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{a.summary}</p>
      <div className="mt-2 space-y-2">{a.findings.map(f => <div key={f.label} className="border-t border-border pt-1.5"><div className="flex items-center gap-1.5 text-[11px] font-medium">{f.pass ? <Check className="h-3 w-3 shrink-0 text-chart-2" /> : <AlertTriangle className="h-3 w-3 shrink-0 text-rayid" />} {f.label}{f.critical && <span className="text-[9px] text-rayid">CRITICAL</span>}</div><p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{f.note}</p></div>)}</div>
    </>}
  </section>;
}