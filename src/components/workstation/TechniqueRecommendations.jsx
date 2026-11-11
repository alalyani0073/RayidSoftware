export default function TechniqueRecommendations({ ws }) {
  if (!ws.plan) return null;
  const dismissed = ws.recommendationStatus === 'dismissed';
  return <section className="border-b border-border bg-ws-surface p-3">
    <h2 className="text-xs font-semibold text-primary">RAYID · EXPOSURE OPTIMIZATION</h2>
    {dismissed ? <><p className="mt-2 text-xs text-muted-foreground">Recommendations rejected. Selected settings retained.</p><button onClick={() => ws.setRecommendationStatus('available')} className="mt-2 text-xs text-primary underline">SHOW RECOMMENDATIONS</button></> : <>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ws.plan.reason}</p>
      <p className="mt-2 font-mono text-xs text-primary">{ws.plan.kvp} kVp · {ws.plan.ma} mA · {ws.plan.mas} mAs · {ws.plan.exposure_time_ms} ms</p>
      <button onClick={ws.applyRecommendations} disabled={ws.busy} className="mt-3 w-full rounded-sm border border-primary bg-primary/10 px-2 py-2 text-xs font-semibold text-primary disabled:opacity-50">APPLY RECOMMENDATIONS</button>
      <div className="mt-2 flex items-center justify-between gap-2"><span className="text-[10px] text-muted-foreground">{ws.recommendationStatus === 'applied' ? 'Applied by operator' : ws.recommendationStatus === 'modified' ? 'Operator modified settings' : 'Awaiting operator decision'}</span><button onClick={() => ws.setRecommendationStatus('dismissed')} className="text-[11px] text-muted-foreground underline">Reject / keep selected</button></div>
    </>}
    <p className="mt-3 border-t border-border pt-2 text-[10px] leading-relaxed text-muted-foreground">SIMULATED VALUES ONLY. Not a clinically validated technique chart; no measured habitus or dose optimization.</p>
  </section>;
}