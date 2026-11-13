import { AlertTriangle, Crosshair } from 'lucide-react';
import { collimation, collimationFindings, centeringOffset, requiredEdges } from '@/components/workstation/simulation';
import ImageFrame from '@/components/workstation/ImageFrame';

export default function RadiographView({ projection, capture, view, rayidOn, assessment }) {
  const s = capture.sample;
  const pos = capture.position;
  const filter = `contrast(${view.contrast}%) brightness(${view.brightness}%) invert(${view.inverted ? 1 : 0}) blur(${s.motion ? 2.8 : 0}px)`;
  const c = collimation(pos, projection);
  const req = requiredEdges(projection);
  const findings = collimationFindings(pos, projection);
  const wide = findings.filter((f) => f.kind === 'wide');
  const tight = findings.filter((f) => f.kind === 'tight');
  const off = centeringOffset(pos, projection);
  const rotated = Math.abs(pos.rotation) > projection.tolerances.rotation;
  const show = Boolean(rayidOn && assessment);
  const shiftX = (pos.x || 0) * 0.45;
  const shiftY = (pos.y || 0) * -0.45;
  const box = (edges) => ({ left: `${edges.l}%`, top: `${edges.t}%`, width: `${edges.r - edges.l}%`, height: `${edges.b - edges.t}%` });
  return <div className="flex h-full min-h-0 w-full flex-col items-center">
    <ImageFrame
      src={projection.radiograph}
      alt={`Radiograph for ${projection.label}${show && assessment.detected.length ? ` with the detected error marked: ${assessment.detected[0].title}` : ''}`}
      frameClassName="bg-ws-canvas"
      imageStyle={{ filter, transform: `translate(${shiftX}%, ${shiftY}%) rotate(${s.rotated ? 6 : 0}deg) scale(${view.zoom})` }}
    >
      {s.cutoff && <div className="absolute inset-x-0 bottom-0 h-[23%] border-t border-border bg-ws-canvas" />}
      {s.artifact && <div className="absolute left-[53%] top-[37%] h-16 w-10 rotate-12 rounded-full border-[7px] border-foreground bg-foreground/20" />}

      {show && s.cutoff && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[23%] border-t-2 border-destructive bg-destructive/10">
        <span className="absolute inset-x-0 top-1 flex items-center justify-center gap-1 px-1 text-center text-[10px] font-bold text-destructive"><AlertTriangle className="h-3 w-3" />CUT-OFF · {projection.cutoff.toUpperCase()}</span>
      </div>}

      {show && (wide.length > 0 || tight.length > 0) && <>
        <div className="pointer-events-none absolute border-2 border-dashed border-chart-2" style={box(req)} />
        <div className="pointer-events-none absolute border-2 border-destructive" style={box(c)}>
          <span className="absolute left-0 top-0 whitespace-nowrap bg-ws-canvas/95 px-1 text-[10px] font-bold text-destructive">
            FIELD {tight.length ? '· EXCLUDES ANATOMY' : '· WIDER THAN REQUIRED'}
          </span>
        </div>
      </>}

      {show && off && <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-chart-2"><span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-ws-canvas/95 px-1 text-[9px] font-semibold text-chart-2">RECOMMENDED</span></div>
        <div className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-destructive" style={{ left: `${50 + shiftX}%`, top: `${50 + shiftY}%` }}>
          <span className="absolute inset-0 flex items-center justify-center"><Crosshair className="h-5 w-5 text-destructive" /></span>
          <span className="absolute top-full left-1/2 mt-1 -translate-x-1/2 whitespace-nowrap bg-ws-canvas/95 px-1 text-[9px] font-bold text-destructive">CR OFFSET {Math.abs(pos.x)} mm {pos.x >= 0 ? 'LAT' : 'MED'}</span>
        </div>
      </div>}

      {show && rotated && <span className="pointer-events-none absolute left-1 top-8 max-w-[60%] bg-ws-canvas/95 px-1.5 py-0.5 text-[10px] font-bold text-destructive">ROTATION {Math.abs(pos.rotation)}° · {projection.rotationCriterion.split(';')[0].toUpperCase()}</span>}
      {show && !pos.breathing && !s.motion && <span className="pointer-events-none absolute left-1 top-1 bg-ws-canvas/95 px-1.5 py-0.5 text-[10px] font-bold text-destructive">BREATH HOLD NOT HELD</span>}
      {show && s.motion && <span className="pointer-events-none absolute left-1 top-1 bg-ws-canvas/95 px-1.5 py-0.5 text-[10px] font-bold text-destructive">MOTION BLUR</span>}
      {show && s.artifact && <span className="pointer-events-none absolute left-2 top-[34%] bg-ws-canvas/95 px-1.5 py-0.5 text-[10px] font-bold text-destructive">EXTERNAL ARTIFACT</span>}
    </ImageFrame>
    <p className="mt-1 text-center text-[9px] leading-tight text-muted-foreground"><a href={projection.imageSource} target="_blank" rel="noreferrer" className="underline">Reference image: {projection.credit}</a></p>
  </div>;
}