import { collimation, fieldSizeCm } from '@/components/workstation/simulation';

export default function CenteringOverlay({ projection, position, recommendation, busy }) {
  const x = projection.focus.x * 100;
  const y = projection.focus.y * 100;
  const cx = x + position.x * 0.22;
  const cy = y + position.y * 0.22;
  const c = collimation(position, projection);
  const fw = Math.min(c.w, 100);
  const fh = Math.min(c.h, 100);
  const left = Math.max(0, cx - fw / 2);
  const top = Math.max(0, cy - fh / 2);
  const right = Math.max(0, 100 - (left + fw));
  const bottom = Math.max(0, 100 - (top + fh));
  const shade = 'rgba(4, 10, 14, 0.72)';
  return <div className="pointer-events-none absolute inset-0">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full text-primary">
      <rect x="0" y="0" width="100" height={top} fill={shade} />
      <rect x="0" y={100 - bottom} width="100" height={bottom} fill={shade} />
      <rect x="0" y={top} width={left} height={fh} fill={shade} />
      <rect x={100 - right} y={top} width={right} height={fh} fill={shade} />
      <rect x={x - projection.field.w / 2} y={y - projection.field.h / 2} width={projection.field.w} height={projection.field.h} fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 1.4" opacity="0.75" />
      <rect x={left} y={top} width={fw} height={fh} fill="none" stroke="currentColor" strokeWidth="0.55" />
      <path d={`M ${cx} ${top} V ${top + fh} M ${left} ${cy} H ${left + fw}`} stroke="currentColor" strokeWidth="0.15" opacity="0.5" />
      <g className="text-chart-3"><circle cx={cx} cy={cy} r="1.8" fill="none" stroke="currentColor" strokeWidth="0.5" /></g>
      {recommendation && <g className="text-chart-2"><path d={`M ${cx} ${cy} L ${x} ${y}`} stroke="currentColor" strokeWidth="0.6" /><circle cx={x} cy={y} r="3" fill="none" stroke="currentColor" strokeWidth="0.6" /><path d={`M ${x - 5} ${y} H ${x + 5} M ${x} ${y - 5} V ${y + 5}`} stroke="currentColor" strokeWidth="0.4" /></g>}
    </svg>
    <span className="absolute left-2 top-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[11px] text-primary">{busy ? 'Locating anatomical landmark…' : `Beam centre · field ${fieldSizeCm(position, projection).join(' × ')} cm`}</span>
    <span className="absolute right-2 top-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[10px] text-muted-foreground">dashed = recommended field</span>
    {recommendation && <span className="absolute bottom-2 left-2 right-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[11px] text-chart-2">Green: recommended landmark · {projection.centring}</span>}
  </div>;
}