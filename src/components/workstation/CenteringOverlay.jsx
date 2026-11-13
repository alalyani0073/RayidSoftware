import { collimation, requiredEdges } from '@/components/workstation/simulation';

const shade = 'hsl(var(--ws-canvas) / 0.3)';

export default function CenteringOverlay({ projection, position, recommendation, busy, onCollimate }) {
  const x = projection.focus.x * 100;
  const y = projection.focus.y * 100;
  const cx = x + position.x * 0.22;
  const cy = y + position.y * 0.22;
  const c = collimation(position, projection);
  const req = requiredEdges(projection);
  const draggable = Boolean(onCollimate) && !busy;
  const fw = c.r - c.l;
  const fh = c.b - c.t;

  const startDrag = (edge, event) => {
    if (!draggable) return;
    const frame = event.currentTarget.closest('[data-camera-frame]');
    if (!frame) return;
    event.preventDefault();
    const box = frame.getBoundingClientRect();
    const vertical = edge === 'l' || edge === 'r';
    const move = (e) => {
      const fraction = vertical ? (e.clientX - box.left) / box.width : (e.clientY - box.top) / box.height;
      onCollimate(edge, Math.round(Math.min(98, Math.max(2, fraction * 100)) * 10) / 10);
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

  const grip = (edge) => {
    const vertical = edge === 'l' || edge === 'r';
    const style = vertical
      ? { left: `${edge === 'l' ? c.l : c.r}%`, top: `${c.t}%`, height: `${fh}%` }
      : { top: `${edge === 't' ? c.t : c.b}%`, left: `${c.l}%`, width: `${fw}%` };
    return <div
      key={edge}
      role="slider"
      aria-label={`${edge === 't' ? 'Superior' : edge === 'b' ? 'Inferior' : edge === 'l' ? 'Left' : 'Right'} collimation border`}
      aria-valuenow={Math.round(edge === 'l' || edge === 'r' ? (edge === 'l' ? c.l : c.r) : (edge === 't' ? c.t : c.b))}
      aria-valuemin={0}
      aria-valuemax={100}
      onPointerDown={e => startDrag(edge, e)}
      className={`pointer-events-auto absolute flex touch-none items-center justify-center ${vertical ? 'w-5 -translate-x-1/2 cursor-ew-resize' : 'h-5 -translate-y-1/2 cursor-ns-resize'} ${draggable ? 'rounded-sm bg-rayid/15 hover:bg-rayid/30' : ''}`}
      style={style}
    >
      <span className={`rounded-full bg-rayid shadow-[0_0_10px_hsl(var(--rayid))] ${vertical ? 'h-8 w-[3px]' : 'h-[3px] w-8'}`} />
    </div>;
  };

  return <div className="absolute inset-0">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none h-full w-full text-rayid">
      <rect x="0" y="0" width="100" height={c.t} fill={shade} />
      <rect x="0" y={c.b} width="100" height={100 - c.b} fill={shade} />
      <rect x="0" y={c.t} width={c.l} height={fh} fill={shade} />
      <rect x={c.r} y={c.t} width={100 - c.r} height={fh} fill={shade} />
      <rect x={req.l} y={req.t} width={req.r - req.l} height={req.b - req.t} fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 1.4" opacity="0.75" />
      <rect x={c.l} y={c.t} width={fw} height={fh} fill="none" stroke="currentColor" strokeWidth="0.55" />
      <path d={`M ${cx} ${c.t} V ${c.b} M ${c.l} ${cy} H ${c.r}`} stroke="currentColor" strokeWidth="0.15" opacity="0.5" />
      <g className="text-chart-3"><circle cx={cx} cy={cy} r="1.8" fill="none" stroke="currentColor" strokeWidth="0.5" /></g>
      {position.visible && recommendation && <g className="text-chart-2"><path d={`M ${cx} ${cy} L ${x} ${y}`} stroke="currentColor" strokeWidth="0.6" /><circle cx={x} cy={y} r="3" fill="none" stroke="currentColor" strokeWidth="0.6" /><path d={`M ${x - 5} ${y} H ${x + 5} M ${x} ${y - 5} V ${y + 5}`} stroke="currentColor" strokeWidth="0.4" /></g>}
    </svg>
    {draggable && ['t', 'b', 'l', 'r'].map(grip)}
  </div>;
}