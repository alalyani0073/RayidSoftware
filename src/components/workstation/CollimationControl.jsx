import PositionInput from '@/components/workstation/PositionInput';

export default function CollimationControl({ ws }) {
  const p = ws.projection;
  const c = ws.position.collimation || p.field;
  const [cmW, cmH] = p.field_cm;
  const widthCm = Math.round((c.w / p.field.w) * cmW);
  const heightCm = Math.round((c.h / p.field.h) * cmH);
  const toPercent = (value, axis) => (axis === 'w' ? (value / cmW) * p.field.w : (value / cmH) * p.field.h);
  return <div className="border-t border-border bg-ws-surface px-3 py-2">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Camera collimation · field {ws.collimationCm.join(' × ')} cm
        {ws.collimationErrors.length > 0 && <span className="ml-1 text-chart-3">· outside required field</span>}
      </h3>
      <button onClick={ws.matchCollimation} disabled={ws.busy || ws.centering} className="rounded-sm border border-border px-2 py-1 text-[10px] font-semibold text-primary disabled:opacity-50">MATCH RECOMMENDED {cmW} × {cmH} cm</button>
    </div>
    <div className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
      <PositionInput label="Vertical shutters (width)" value={widthCm} min={Math.round(cmW * 0.3)} max={Math.round(cmW * 1.4)} unit=" cm" onChange={v => ws.changeCollimation('w', toPercent(v, 'w'))} />
      <PositionInput label="Horizontal shutters (height)" value={heightCm} min={Math.round(cmH * 0.3)} max={Math.round(cmH * 1.4)} unit=" cm" onChange={v => ws.changeCollimation('h', toPercent(v, 'h'))} />
    </div>
  </div>;
}