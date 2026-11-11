import { Image } from '@/components/ui/image';
import TubeGeometry from '@/components/workstation/TubeGeometry';
import CenteringOverlay from '@/components/workstation/CenteringOverlay';
export default function ProjectionReference({ ws, referenceOnly = false }) {
  if (!ws.rayidOn) return null;
  const p = ws.projection;
  return <section className="border-b border-border">
    <div className="flex justify-between gap-2 bg-ws-toolbar px-3 py-2 text-xs"><strong className="text-primary">TUBE-MOUNTED CAMERA · {p.label}</strong><span className="text-muted-foreground">SIMULATED INPUT</span></div>
    <TubeGeometry projection={p} />
    <div className="relative aspect-[4/3] overflow-hidden bg-ws-canvas">
      <Image src={p.reference} alt={`Illustrative patient positioning from the X-ray tube housing: ${p.label}. ${p.cameraDirection}`} fittingType="fit" className="h-full w-full" style={{ transform: p.flexion && ws.exam.laterality === 'right' ? 'scaleX(-1)' : undefined }} />
      {!referenceOnly && ws.position.visible && <CenteringOverlay projection={p} position={ws.position} recommendation={ws.centerResult} busy={ws.centering} />}
      {!referenceOnly && !ws.position.visible && <span className="absolute bottom-2 left-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-xs text-chart-3">Landmark obscured in simulated input; centering overlay withheld.</span>}
    </div>
    <div className="border-t border-border bg-ws-surface px-3 py-2 text-[10px] leading-relaxed text-muted-foreground"><p>{p.cameraDirection}</p><p>Posed illustrative photograph, not the selected patient's camera feed. Overlay responds to simulated tube offsets; it does not measure anatomy.</p></div>
  </section>;
}