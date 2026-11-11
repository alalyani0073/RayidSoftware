import ExposureField from '@/components/workstation/ExposureField';
import { exposureTime } from '@/components/workstation/simulation';
export default function AcquisitionPanel({ ws }) {
  const locked = ws.stage === 'review' || ws.busy;
  const t = ws.stage === 'review' ? ws.capture.technique : ws.technique;
  const r = ws.rayidOn && !locked && ws.recommendationStatus !== 'dismissed' ? ws.plan : null;
  const fields = [{ key: 'kvp', label: 'kVp', unit: 'kV', min: 40, max: 150 }, { key: 'ma', label: 'mA', unit: 'mA', min: 50, max: 800, step: 10 }, { key: 'mas', label: t.aec_mode === 'on' ? 'mAs target / backup' : 'mAs', unit: 'mAs', min: 0.1, max: 200, step: 0.1 }, { key: 'sid_cm', label: 'SID', unit: 'cm', min: 80, max: 200 }];
  return <section id="exposure-controls" className="border-b border-border bg-ws-surface p-3">
    <div className="mb-3 flex justify-between text-xs"><h2 className="font-semibold">{locked ? 'ACQUIRED TECHNIQUE' : 'GENERATOR / EXPOSURE'}</h2><span className="text-muted-foreground">{locked ? 'Recorded' : 'Operator control'}</span></div>
    <div className="grid grid-cols-2 gap-3">{fields.map(f => <ExposureField key={f.key} {...f} value={t[f.key]} disabled={locked} recommended={r?.[f.key]} onChange={v => ws.changeTechnique(f.key, v)} />)}</div>
    <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs"><span className="text-muted-foreground">Exposure time = mAs / mA</span><strong className="font-mono text-base">{exposureTime(t)} ms</strong></div>
    {r && <p className="mt-1 text-right text-xs text-primary">Recommended: {r.exposure_time_ms} ms</p>}
    <label className="mt-3 flex items-center justify-between text-xs text-muted-foreground">AEC<select aria-label="Automatic exposure control" disabled={locked || !ws.projection.aec} value={t.aec_mode} onChange={e => ws.changeTechnique('aec_mode', e.target.value)} className="h-8 rounded-sm border border-input bg-ws-canvas px-2 text-foreground disabled:opacity-50"><option value="off">OFF · manual</option>{ws.projection.aec && <option value="on">ON · simulated</option>}</select></label>
    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">{!ws.projection.aec ? 'AEC not modeled for this receptor / projection.' : t.aec_mode === 'on' ? 'AEC cutoff is not modeled. Displayed mAs and time are illustrative target / backup values.' : 'AEC available on the selected Bucky; manual exposure currently selected.'} Grid: {ws.projection.grid}.</p>
  </section>;
}