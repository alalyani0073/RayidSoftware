import { useRef } from 'react';
import { ArrowDown, ArrowRight, Camera } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useSize } from '@/hooks/use-size';
import { referenceFor } from '@/lib/protocols';
import CenteringOverlay from '@/components/workstation/CenteringOverlay';

export default function ProjectionReference({ ws, referenceOnly = false }) {
  const stageRef = useRef(null);
  const size = useSize(stageRef);
  if (!ws.rayidOn) return null;
  const p = ws.projection;
  const source = referenceFor(p, ws.exam?.sex);
  const mirrored = p.key.startsWith('knee') && ws.exam?.laterality === 'left';
  const editable = !referenceOnly && !ws.centering && !ws.busy;
  const [cmW, cmH] = p.field_cm;
  const [aw, ah] = String(p.cameraAspect || '1 / 1').split('/').map(v => Number(v.trim()) || 1);
  const ratio = aw / ah;
  const availW = Math.max(120, (size?.width || 360) - 4);
  const availH = Math.max(120, (size?.height || 360) - 4);
  const frameW = Math.round(Math.min(availW, availH * ratio));
  const frameH = Math.round(frameW / ratio);
  const horizontal = p.key === 'chest_pa';
  const Arrow = horizontal ? ArrowRight : ArrowDown;
  return <section className={`flex min-h-0 flex-col bg-ws-surface ${referenceOnly ? '' : 'flex-1'}`}>
    <div className="flex items-center gap-2 border-b border-border bg-ws-toolbar px-3 py-1 text-[10px] text-muted-foreground">
      <strong className="font-mono text-rayid">TUBE-MOUNTED CAMERA · {p.label}</strong>
      <span className="hidden items-center gap-1.5 lg:inline-flex"><Camera className="h-3 w-3 text-primary" /><Arrow className="h-3 w-3" />Patient {horizontal ? '(back toward tube)' : '(table)'}<Arrow className="h-3 w-3" />Receptor</span>
      <span className="ml-auto uppercase tracking-wide">{horizontal ? 'Horizontal beam' : 'Overhead beam'} · {p.default_sid_cm} cm SID</span>
    </div>
    <div id="collimation-controls" ref={stageRef} className={`relative flex items-center justify-center overflow-hidden bg-ws-canvas p-1.5 ${referenceOnly ? 'h-[34vh]' : 'min-h-0 flex-1'}`}>
      <div data-camera-frame className="relative bg-black/40 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" style={{ width: frameW, height: frameH }}>
        <Image src={source} alt={`Posed patient positioning from the X-ray tube housing: ${p.label}. ${p.cameraDirection}`} fittingType="fit" className="h-full w-full" style={{ transform: mirrored ? 'scaleX(-1)' : undefined }} />
        {!referenceOnly && ws.position.visible && <CenteringOverlay projection={p} position={ws.position} recommendation={ws.centerResult} busy={ws.centering} onCollimate={editable ? ws.changeCollimation : undefined} />}
        {!referenceOnly && !ws.position.visible && <span className="absolute bottom-2 left-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-xs text-rayid">Landmark obscured; overlay withheld.</span>}
        {referenceOnly && <span className="absolute left-2 top-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[10px] text-muted-foreground">Reference view</span>}
      </div>
    </div>
    <div className="flex items-center gap-x-3 gap-y-0.5 overflow-hidden border-t border-border px-3 py-1 text-[10px] text-muted-foreground">
      <span className="whitespace-nowrap font-mono font-semibold text-rayid">Field {ws.collimationCm.join(' × ')} cm</span>
      <span className="whitespace-nowrap">Required {cmW} × {cmH} cm</span>
      {ws.collimationErrors.length > 0 ? <span className="whitespace-nowrap font-semibold text-rayid">Outside required field</span> : <span className="whitespace-nowrap text-chart-2">Within tolerance</span>}
      <span className="hidden min-w-0 truncate xl:inline" title={`Centring: ${p.centring}. ${p.cameraDirection}.`}>Centring: {p.centring}</span>
      {editable && <button onClick={ws.matchCollimation} className="ml-auto shrink-0 rounded-sm border border-border px-2 py-0.5 font-semibold text-rayid hover:bg-accent">MATCH FIELD</button>}
    </div>
  </section>;
}