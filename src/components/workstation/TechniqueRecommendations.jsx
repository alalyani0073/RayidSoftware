export default function TechniqueRecommendations({ ws }) {
  if (!ws.plan) return null;
  const dismissed = ws.recommendationStatus === 'dismissed';
  return <section className="border-b border-border bg-ws-surface p-2.5">
    <h2 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-rayid">RAYID · EXPOSURE OPTIMIZATION</h2>
    {dismissed ? <><p className="mt-1.5 text-[11px] text-muted-foreground">Recommendations rejected. Selected settings retained.</p><button onClick={() => ws.setRecommendationStatus('available')} className="mt-1 text-[11px] text-rayid underline">SHOW RECOMMENDATIONS</button></> : <>
      <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-muted-foreground" title={ws.plan.reason}>{ws.plan.reason}</p>
      <p className="mt-1.5 font-mono text-[11px] text-rayid">{ws.plan.kvp} kVp · {ws.plan.ma} mA · {ws.plan.mas} mAs · {ws.plan.exposure_time_ms} ms</p>
      <button onClick={ws.applyRecommendations} disabled={ws.busy} className="mt-2 w-full rounded-sm border border-rayid bg-rayid/10 px-2 py-1.5 text-[11px] font-semibold text-rayid disabled:opacity-50">APPLY RECOMMENDATIONS</button>
      <div className="mt-1 flex items-center justify-between gap-2"><span className="text-[10px] text-muted-foreground">{ws.recommendationStatus === 'applied' ? 'Applied by operator' : ws.recommendationStatus === 'modified' ? 'Operator modified settings' : 'Awaiting operator decision'}</span><button onClick={() => ws.setRecommendationStatus('dismissed')} className="text-[10px] text-muted-foreground underline">Reject</button></div>
    </>}
  </section>;
}