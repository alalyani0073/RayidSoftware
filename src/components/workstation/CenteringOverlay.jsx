export default function CenteringOverlay({ projection, position, recommendation, busy }) {
  const x = projection.focus.x * 100;
  const y = projection.focus.y * 100;
  const cx = x + position.x * 0.22;
  const cy = y + position.y * 0.22;
  return <div className="pointer-events-none absolute inset-0">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full text-primary">
      <rect x={cx - projection.field.w / 2} y={cy - projection.field.h / 2} width={projection.field.w} height={projection.field.h} fill="none" stroke="currentColor" strokeWidth="0.35" strokeDasharray="1.5 1" />
      <path d={`M ${cx} 5 V 95 M 5 ${cy} H 95`} stroke="currentColor" strokeWidth="0.15" opacity="0.55" />
      <g className="text-chart-3"><circle cx={cx} cy={cy} r="2" fill="none" stroke="currentColor" strokeWidth="0.5" /></g>
      {recommendation && <g className="text-chart-2"><path d={`M ${cx} ${cy} L ${x} ${y}`} stroke="currentColor" strokeWidth="0.6" /><circle cx={x} cy={y} r="3" fill="none" stroke="currentColor" strokeWidth="0.6" /><path d={`M ${x - 5} ${y} H ${x + 5} M ${x} ${y - 5} V ${y + 5}`} stroke="currentColor" strokeWidth="0.4" /></g>}
    </svg>
    <span className="absolute left-2 top-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[11px] text-primary">{busy ? 'Locating anatomical landmark…' : 'Amber: selected beam center'}</span>
    {recommendation && <span className="absolute bottom-2 left-2 right-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[11px] text-chart-2">Green: recommended landmark · {projection.centring}</span>}
  </div>;
}