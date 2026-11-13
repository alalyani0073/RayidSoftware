import { collimation, fieldSizeCm, centeringOffset } from '@/components/workstation/simulation';

const shade = 'rgba(4, 10, 14, 0.72)';

export default function CenteringOverlay({ projection, position, recommendation, busy, onCollimate }) {
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
  const draggable = Boolean(onCollimate) && !busy;
  const wide = c.w > projection.field.w + 5 || c.h > projection.field.h + 5;
  const tight = projection.field.w - c.w > 5 || projection.field.h - c.h > 5;
  const off = centeringOffset(position, projection);

  const startDrag = (axis, event) => {
    if (!draggable) return;
    const frame = event.currentTarget.closest('[data-camera-frame]');
    if (!frame) return;
    event.preventDefault();
    const box = frame.getBoundingClientRect();
    const centre = axis === 'w' ? cx / 100 : cy / 100;
    const move = e => {
      const f = axis === 'w' ? (e.clientX - box.left) / box.width : (e.clientY - box.top) / box.height;
      onCollimate(axis, Math.min(100, Math.max(6, Math.round(Math.abs(f - centre) * 200))));
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };

  const grip = (axis, at, key) => {
    const vertical = axis === 'w';
    const style = vertical ? { left: `${at}%`, top: `${top}%`, height: `${fh}%` } : { top: `${at}%`, left: `${left}%`, width: `${fw}%` };
    return <div key={key} onPointerDown={e => startDrag(axis, e)} aria-hidden="true" className={`absolute flex touch-none items-center justify-center ${vertical ? 'w-5 -translate-x-1/2 cursor-ew-resize' : 'h-5 -translate-y-1/2 cursor-ns-resize'} ${draggable ? 'rounded-sm bg-rayid/15 hover:bg-rayid/30' : ''}`} style={style}>
      <span className={`rounded-full bg-rayid shadow-[0_0_10px_hsl(var(--rayid))] ${vertical ? 'h-8 w-[3px]' : 'h-[3px] w-8'}`} />
    </div>;
  };

  return <div className="absolute inset-0">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none h-full w-full text-rayid">
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
    <span className="pointer-events-none absolute left-2 top-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[11px] text-rayid">{busy ? 'Locating anatomical landmark…' : `Field ${fieldSizeCm(position, projection).join(' × ')} cm`}</span>
    {draggable && <span className="pointer-events-none absolute right-2 top-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[10px] text-rayid">Drag the bright shutter edges</span>}
    {draggable && <>{grip('w', left, 'left')}{grip('w', left + fw, 'right')}{grip('h', top, 'top')}{grip('h', top + fh, 'bottom')}</>}
    <div className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-col items-start gap-1">
      {wide && <span className="rounded-sm bg-ws-canvas/90 px-2 py-1 text-[10px] font-semibold text-rayid">Field wider than required · close the shutters</span>}
      {tight && <span className="rounded-sm bg-ws-canvas/90 px-2 py-1 text-[10px] font-semibold text-rayid">Field tighter than required · check coverage</span>}
      {off && <span className="rounded-sm bg-ws-canvas/90 px-2 py-1 text-[10px] font-semibold text-rayid">Central ray {Math.abs(position.x)} mm {position.x >= 0 ? 'lateral' : 'medial'} of {projection.centring}</span>}
      {recommendation && <span className="rounded-sm bg-ws-canvas/90 px-2 py-1 text-[11px] text-chart-2">Green: recommended landmark · {projection.centring}</span>}
    </div>
  </div>;
}