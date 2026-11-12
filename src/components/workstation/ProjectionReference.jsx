import { Image } from '@/components/ui/image';
import { referenceFor } from '@/lib/protocols';
import TubeGeometry from '@/components/workstation/TubeGeometry';
import CenteringOverlay from '@/components/workstation/CenteringOverlay';

export default function ProjectionReference({ ws, referenceOnly = false }) {
  if (!ws.rayidOn) return null;
  const p = ws.projection;
  const source = referenceFor(p, ws.exam?.sex);
  const mirrored = p.key.startsWith('knee') && ws.exam?.laterality === 'left';
  const editable = !referenceOnly && !ws.centering && !ws.busy;
  const [cmW, cmH] = p.field_cm;
  return <section className={`flex flex-col bg-ws-surface ${referenceOnly ? '' : 'min-h-0 flex-1'}`}>
    <div className="flex justify-between gap-2 bg-ws-toolbar px-3 py-1.5 text-xs"><strong className="text-primary">TUBE-MOUNTED CAMERA · {p.label}</strong><span className="text-muted-foreground">SIMULATED INPUT</span></div>
    <TubeGeometry projection={p} />
    <div id="collimation-controls" className={`flex items-center justify-center overflow-hidden bg-ws-canvas p-1 ${referenceOnly ? '' : 'min-h-0 flex-1'}`}>
      <div data-camera-frame className={`relative ${referenceOnly ? 'w-full max-w-lg' : 'h-full'}`} style={{ aspectRatio: '1 / 1', maxWidth: '100%' }}>
        <Image src={source} alt={`Posed ${ws.exam?.sex === 'female' ? 'female' : 'male'} patient positioning from the X-ray tube housing: ${p.label}. ${p.cameraDirection}`} fittingType="cover" className="h-full w-full" style={{ transform: mirrored ? 'scaleX(-1)' : undefined }} />
        {!referenceOnly && ws.position.visible && <CenteringOverlay projection={p} position={ws.position} recommendation={ws.centerResult} busy={ws.centering} onCollimate={editable ? ws.changeCollimation : undefined} />}
        {!referenceOnly && !ws.position.visible && <span className="absolute bottom-2 left-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-xs text-chart-3">Landmark obscured in simulated input; centering overlay withheld.</span>}
        {referenceOnly && <span className="absolute left-2 top-2 rounded-sm bg-ws-canvas/90 px-2 py-1 text-[10px] text-muted-foreground">Reference view</span>}
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border px-3 py-1.5 text-[10px] text-muted-foreground">
      <span className="font-semibold text-primary">Field {ws.collimationCm.join(' × ')} cm</span>
      <span>Required {cmW} × {cmH} cm</span>
      {ws.collimationErrors.length > 0 ? <span className="text-chart-3">Shutter field outside required coverage</span> : <span className="text-chart-2">Shutter field within tolerance</span>}
      {editable && <button onClick={ws.matchCollimation} className="ml-auto rounded-sm border border-border px-2 py-1 font-semibold text-primary hover:bg-accent">MATCH RECOMMENDED</button>}
    </div>
    <p className="truncate border-t border-border px-3 py-1 text-[10px] text-muted-foreground" title={`${p.cameraDirection} Posed photograph, not a live feed; no anatomy is measured.`}>{p.cameraDirection} · posed photograph, not a live feed.</p>
  </section>;
}