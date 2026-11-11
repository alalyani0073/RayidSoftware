import { Camera, ArrowDown, ArrowRight } from 'lucide-react';
export default function TubeGeometry({ projection }) {
  const horizontal = projection.key === 'chest_pa';
  const Arrow = horizontal ? ArrowRight : ArrowDown;
  return <div className="flex flex-wrap items-center gap-2 border-b border-border bg-ws-toolbar px-3 py-2 text-[11px] text-muted-foreground">
    <span className="inline-flex items-center gap-2 rounded-sm border border-primary/40 px-2 py-1 text-primary"><Camera className="h-3.5 w-3.5" /> Tube housing + fixed camera</span>
    <Arrow className="h-3.5 w-3.5" /><span>Patient {horizontal ? '(back toward tube)' : '(table)'}</span><Arrow className="h-3.5 w-3.5" /><span>Receptor</span>
    <span className="ml-auto">{horizontal ? 'Horizontal beam' : 'Overhead beam'} · {projection.default_sid_cm} cm SID</span>
  </div>;
}