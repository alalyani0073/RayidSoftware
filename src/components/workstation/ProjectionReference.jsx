import { ArrowDown, ArrowRight, Camera } from 'lucide-react';
import { referenceFor } from '@/lib/protocols';
import CenteringOverlay from '@/components/workstation/CenteringOverlay';
import CameraImage from '@/components/workstation/CameraImage';
import PositioningTips from '@/components/workstation/PositioningTips';

export default function ProjectionReference({ ws, referenceOnly = false }) {
  const p = ws.projection;
  const source = referenceFor(p, ws.exam?.sex);
  const mirrored = p.key.startsWith('knee') && ws.exam?.laterality === 'left';
  const editable = ws.rayidOn && !referenceOnly && !ws.centering && !ws.busy;
  const [cmW, cmH] = p.field_cm;
  const horizontal = p.cr.startsWith('Horizontal');
  const patientView = p.key === 'chest_pa' ? '(back toward tube)' : horizontal ? '(side toward tube)' : '(table)';
  const Arrow = horizontal ? ArrowRight : ArrowDown;
  return <section className={`flex min-h-0 min-w-0 flex-1 flex-col bg-ws-surface ${referenceOnly ? 'min-h-[46vh] lg:min-h-0' : ''}`}>
    <div className="flex items-center gap-2 border-b border-border bg-ws-toolbar px-3 py-1 text-[10px] text-muted-foreground">
      <strong className={`font-mono ${ws.rayidOn ? 'text-rayid' : 'text-foreground'}`}>TUBE-MOUNTED CAMERA · {p.label}</strong>
      <span className="hidden items-center gap-1.5 lg:inline-flex"><Camera className="h-3 w-3 text-primary" /><Arrow className="h-3 w-3" />Patient {patientView}<Arrow className="h-3 w-3" />Receptor</span>
      <span className="ml-auto uppercase tracking-wide">{horizontal ? 'Horizontal beam' : 'Overhead beam'} · {p.default_sid_cm} cm SID</span>
    </div>
    <div id="collimation-controls" className="relative min-h-[300px] min-w-0 flex-1 overflow-hidden bg-ws-canvas lg:min-h-[160px]">
      <CameraImage
        key={`${ws.exam?.id}:${p.key}:${source}`}
        src={source}
        alt={`Posed patient positioning from the X-ray tube housing: ${p.label}. ${p.cameraDirection}`}
        mirrored={mirrored}
      >
        {ws.rayidOn && <CenteringOverlay projection={p} position={ws.position} recommendation={ws.centerResult} busy={ws.centering} onCollimate={editable ? ws.changeCollimation : undefined} />}
      </CameraImage>
    </div>
    {ws.rayidOn && !referenceOnly && <PositioningTips projection={p} position={ws.position} recommendation={ws.centerResult} busy={ws.centering} editable={editable} />}
    <div className="flex items-center gap-x-3 gap-y-0.5 overflow-hidden border-t border-border px-3 py-1 text-[10px] text-muted-foreground">
      <span className={`whitespace-nowrap font-mono font-semibold ${ws.rayidOn ? 'text-rayid' : 'text-foreground'}`}>Field {ws.collimationCm.join(' × ')} cm</span>
      {ws.rayidOn && <><span className="whitespace-nowrap">Required {cmW} × {cmH} cm</span>
      {ws.collimationErrors.length > 0 ? <span className="whitespace-nowrap font-semibold text-rayid">Outside required field</span> : <span className="whitespace-nowrap text-chart-2">Within tolerance</span>}
      <span className="hidden min-w-0 truncate xl:inline" title={`Centring: ${p.centring}. ${p.cameraDirection}.`}>Centring: {p.centring}</span></>}
      {editable && <button onClick={ws.matchCollimation} className="ml-auto shrink-0 rounded-sm border border-border px-2 py-0.5 font-semibold text-rayid hover:bg-accent">MATCH FIELD</button>}
    </div>
  </section>;
}