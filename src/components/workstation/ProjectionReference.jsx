import { Image } from '@/components/ui/image';
import { referenceFor } from '@/lib/protocols';
import TubeGeometry from '@/components/workstation/TubeGeometry';
import CenteringOverlay from '@/components/workstation/CenteringOverlay';
import CollimationControl from '@/components/workstation/CollimationControl';
export default function ProjectionReference({ ws, referenceOnly = false }) {
  if (!ws.rayidOn) return null;
  const p = ws.projection;
  const source = referenceFor(p, ws.exam?.sex);
  const mirrored = p.key.startsWith('knee') && ws.exam?.laterality === 'left';
  return <section className="border-b border-border">
    <div className="flex justify-between gap-2 bg-ws-toolbar px-3 py-2 text-xs"><strong className="text-primary">TUBE-MOUNTED CAMERA · {p.label}</strong><span className="text-muted-foreground">SIMULATED INPUT</span></div>
    <TubeGeometry projection={p} />
    <div className="relative aspect-square overflow-hidden bg-ws-canvas">
      <Image src={source} alt={`Posed ${ws.exam?.sex === 'female' ? 'female' : 'male'} patient positioning from the X-ray tube housing: ${p.label}. ${p.cameraDirection}`} fittingType="cover" className="h-full w-full" style={{ transform: mirrored ? 'scaleX(-1)' : undefined }} />
      {!referenceOnly && ws.position.visible && <CenteringOverlay projection={p} position={ws.position} recommendation={ws.centerResult} busy={ws.centering} />}
      {!referenceOnly && !ws.position.visible && <span className="absolute bottom-2 left-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-xs text-chart-3">Landmark obscured in simulated input; centering overlay withheld.</span>}
    </div>
    {!referenceOnly && <CollimationControl ws={ws} />}
    <div className="border-t border-border bg-ws-surface px-3 py-2 text-[10px] leading-relaxed text-muted-foreground"><p>{p.cameraDirection}</p><p>Posed photograph matched to the recorded patient sex, not a live camera feed. Shutters and overlay respond to simulated input; no anatomy is measured.</p></div>
  </section>;
}