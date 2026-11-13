import PositionInput from '@/components/workstation/PositionInput';

const BORDERS = [
  { edge: 't', label: 'Superior border' },
  { edge: 'b', label: 'Inferior border' },
  { edge: 'l', label: 'Left border' },
  { edge: 'r', label: 'Right border' },
];

export default function CollimationControl({ ws }) {
  const p = ws.projection;
  const [cmW, cmH] = p.field_cm;
  const borders = ws.collimationBorders;
  return <div className="border-t border-border bg-ws-surface px-2.5 py-2">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-mono text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Collimation · {ws.collimationCm.join(' × ')} cm · req. {cmW} × {cmH} cm
        {ws.adjusted && ws.collimationErrors.length > 0 && <span className="ml-1 text-rayid">· outside required field</span>}
      </h3>
      <button onClick={ws.matchCollimation} disabled={ws.busy || ws.centering} className="rounded-sm border border-border px-2 py-0.5 text-[10px] font-semibold text-rayid disabled:opacity-50">MATCH {cmW} × {cmH} cm</button>
    </div>
    <div className="mt-1.5 grid gap-x-4 gap-y-1 sm:grid-cols-2">
      {BORDERS.map(({ edge, label }) => {
        const vertical = edge === 'l' || edge === 'r';
        const span = vertical ? cmW : cmH;
        return <PositionInput
          key={edge}
          label={label}
          value={borders[edge]}
          min={1}
          max={Math.round(span)}
          unit=" cm"
          onChange={value => ws.setCollimationBorder(edge, value)}
        />;
      })}
    </div>
    <p className="mt-1 text-[9px] leading-snug text-muted-foreground">Borders measured from the central ray. Required: {p.borders.t}; {p.borders.b}; {p.borders.l}; {p.borders.r}.</p>
  </div>;
}