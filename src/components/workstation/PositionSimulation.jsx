import PositionInput from '@/components/workstation/PositionInput';
export default function PositionSimulation({ ws }) {
  const p = ws.projection;
  const s = ws.position;
  const fields = [{ key: 'x', label: 'Beam horizontal offset', min: -50, max: 50, unit: ' mm' }, { key: 'y', label: 'Beam longitudinal offset', min: -50, max: 50, unit: ' mm' }, { key: 'rotation', label: 'Patient rotation', min: -15, max: 15, step: 0.5, unit: '°' }, { key: 'angle', label: 'Tube angle (+ cephalad)', min: -10, max: 15, step: 0.5, unit: '°' }, ...(p.flexion ? [{ key: 'flexion', label: 'Knee flexion', min: 0, max: 60, unit: '°' }] : [])];
  const checks = [{ key: 'visible', label: 'Anatomical landmark visible' }, { key: 'limb', label: p.limbLabel }, { key: 'coverage', label: 'Required anatomy inside collimation' }, ...(!p.flexion ? [{ key: 'breathing', label: p.region === 'Thorax' ? 'Adequate inspiration / breath held' : 'Suspended expiration' }] : [])];
  return <fieldset disabled={ws.centering || ws.busy} className="border-t border-border bg-ws-surface p-3 disabled:opacity-60">
    <div className="flex justify-between gap-2"><h3 className="font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Patient / tube positioning</h3><button onClick={ws.introduceError} className="text-[11px] text-rayid underline">Introduce positioning error</button></div>
    <div className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-2">{fields.map(f => <PositionInput key={f.key} {...f} value={s[f.key]} onChange={v => ws.changePosition(f.key, v)} />)}</div>
    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">{checks.map(c => <label key={c.key} className="flex items-start gap-2"><input type="checkbox" className="mt-0.5 accent-primary" checked={s[c.key]} onChange={e => ws.changePosition(c.key, e.target.checked)} />{c.label}</label>)}</div>
  </fieldset>;
}