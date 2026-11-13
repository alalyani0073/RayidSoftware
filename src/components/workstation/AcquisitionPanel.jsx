import ExposureField from '@/components/workstation/ExposureField';
import { exposureTime } from '@/components/workstation/simulation';
export default function AcquisitionPanel({ ws }) {
  const locked = ws.stage === 'review' || ws.busy;
  const t = ws.stage === 'review' ? ws.capture.technique : ws.technique;
  const r = ws.rayidOn && !locked && ws.recommendationStatus !== 'dismissed' ? ws.plan : null;
  const fields = [{ key: 'kvp', label: 'kVp', unit: 'kV', min: 40, max: 150 }, { key: 'ma', label: 'mA', unit: 'mA', min: 50, max: 800, step: 10 }, { key: 'mas', label: t.aec_mode === 'on' ? 'mAs target / backup' : 'mAs', unit: 'mAs', min: 0.1, max: 200, step: 0.1 }, { key: 'sid_cm', label: 'SID', unit: 'cm', min: 80, max: 200 }];
  return <section id="exposure-controls" className="border-b border-border bg-ws-surface p-2.5">
    <div className="mb-2 flex justify-between text-[11px]"><h2 className="font-semibold uppercase tracking-wide">{locked ? 'ACQUIRED TECHNIQUE' : 'GENERATOR / EXPOSURE'}</h2><span className="text-[10px] text-muted-foreground">{locked ? 'Recorded' : 'Operator control'}</span></div>
    {locked
      ? <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">{fields.map(f => <div key={f.key} className="flex justify-between border-b border-border/60 pb-0.5"><span className="text-muted-foreground">{f.label}</span><span>{t[f.key]} {f.unit}</span></div>)}<div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{exposureTime(t)} ms</span></div><div className="flex justify-between"><span className="text-muted-foreground">AEC</span><span>{t.aec_mode.toUpperCase()}</span></div></div>
      : <div className="grid grid-cols-2 gap-3">{fields.map(f => <ExposureField key={f.key} {...f} value={t[f.key]} disabled={false} recommended={r?.[f.key]} onChange={v => ws.changeTechnique(f.key, v)} />)}</div>}
    {!locked && <><div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[11px]"><span className="text-muted-foreground">Exposure time = mAs / mA</span><strong className="font-mono text-sm">{exposureTime(t)} ms</strong></div>
      {r && <p className="mt-0.5 text-right text-[10px] text-rayid">RAYID recommended: {r.exposure_time_ms} ms</p>}
      <label className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">AEC<select aria-label="Automatic exposure control" disabled={!ws.projection.aec} value={t.aec_mode} onChange={e => ws.changeTechnique('aec_mode', e.target.value)} className="h-7 rounded-sm border border-input bg-ws-canvas px-2 text-foreground disabled:opacity-50"><option value="off">OFF · manual</option>{ws.projection.aec && <option value="on">ON · AEC</option>}</select></label>
      <p className="mt-1 text-[9px] leading-snug text-muted-foreground">{!ws.projection.aec ? 'AEC not available for this receptor / projection.' : t.aec_mode === 'on' ? 'AEC active; values shown are target / backup.' : 'AEC available; manual exposure selected.'} Grid: {ws.projection.grid}.</p></>}
  </section>;
}