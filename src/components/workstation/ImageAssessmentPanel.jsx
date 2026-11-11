import { Loader2, Check, AlertTriangle } from 'lucide-react';
export default function ImageAssessmentPanel({ ws }) {
  const a = ws.assessment;
  return <section className="bg-ws-surface p-3">
    <h2 className="text-xs font-semibold text-primary">RAYID IMAGE ASSESSMENT</h2>
    {ws.evaluating ? <p className="mt-4 flex items-center gap-2 text-sm text-primary"><Loader2 className="h-4 w-4 animate-spin" /> Running scripted assessment…</p> : a && <>
      <div className="mt-3 flex items-end justify-between gap-2"><strong className={`font-mono text-4xl ${a.accepted ? 'text-chart-2' : 'text-chart-3'}`}>{a.quality_score}%</strong><span className="pb-1 text-[11px] text-muted-foreground">Threshold 75%</span></div>
      <p className={`mt-2 border px-2 py-2 text-xs font-bold ${a.accepted ? 'border-chart-2/40 text-chart-2' : 'border-destructive/40 text-destructive'}`}>{a.accepted ? 'ACCEPTED · CRITICAL CRITERIA MET' : 'NEEDS CORRECTION'}</p>
      {a.critical && <p className="mt-2 text-xs font-semibold text-destructive">Critical criterion missing. A score ≥75% does not permit automatic acceptance.</p>}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{a.summary}</p>
      <div className="mt-3 space-y-3">{a.findings.map(f => <div key={f.label} className="border-t border-border pt-2"><div className="flex items-center gap-2 text-xs font-medium">{f.pass ? <Check className="h-3.5 w-3.5 shrink-0 text-chart-2" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-chart-3" />} {f.label}{f.critical && <span className="text-[10px] text-destructive">CRITICAL</span>}</div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.note}</p></div>)}</div>
      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed">{a.recommendation}</p>
    </>}
    <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">Preset simulation based on selected sample faults and recorded inputs. No real AI image analysis or diagnosis. Acceptance always requires the radiographer's decision.</p>
  </section>;
}