import { Image } from '@/components/ui/image';
export default function RadiographView({ projection, capture, view, rayidOn, assessment }) {
  const s = capture.sample;
  const ratios = { knee_ap: '1067 / 1913', knee_lat: '1133 / 1939', chest_pa: '1929 / 2207', chest_ap: '2240 / 2262', abdomen_ap: '2043 / 2494' };
  const filter = `contrast(${view.contrast}%) brightness(${view.brightness}%) invert(${view.inverted ? 1 : 0}) blur(${s.motion ? 2.8 : 0}px)`;
  const [imageWidth, imageHeight] = ratios[projection.key].split('/').map(Number);
  return <div className="mx-auto w-full" style={{ maxWidth: `min(420px, 100%, calc(clamp(260px, calc(100dvh - 370px), 650px) * ${imageWidth / imageHeight}))` }}>
    <div className="relative overflow-hidden border border-border bg-ws-canvas" style={{ aspectRatio: ratios[projection.key] }}>
      <Image src={projection.radiograph} alt={`Real teaching radiograph for ${projection.label}; ${s.cutoff || s.motion || s.artifact || s.rotated ? 'deliberately modified to demonstrate technical faults' : 'reference sample'}`} fittingType="fit" className="h-full w-full" style={{ filter, transform: `scale(${view.zoom}) rotate(${s.rotated ? 6 : 0}deg)` }} />
      {s.cutoff && <div className="absolute inset-x-0 bottom-0 h-[23%] border-t border-border bg-ws-canvas" />}
      {s.artifact && <div className="absolute left-[53%] top-[37%] h-16 w-10 rotate-12 rounded-full border-[7px] border-foreground bg-foreground/20" />}
      {rayidOn && assessment && <>{s.cutoff && <div className="absolute inset-x-1 bottom-[23%] border-t-2 border-dashed border-destructive"><span className="bg-ws-canvas px-2 py-1 text-[10px] text-destructive">SIMULATED CUT-OFF: {projection.cutoff}</span></div>}{s.artifact && <span className="absolute left-2 top-[36%] bg-ws-canvas/90 px-2 py-1 text-[11px] text-chart-3">Added external artifact</span>}{s.motion && <span className="absolute left-2 top-2 bg-ws-canvas/90 px-2 py-1 text-[11px] text-chart-3">Simulated motion blur</span>}</>}
    </div>
    <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Real teaching image, not this patient's radiograph. {s.cutoff || s.motion || s.artifact || s.rotated ? 'Faults are deliberately added display modifications, not AI-detected pathology.' : 'Reference sample; technical results are scripted.'}</p>
    <p className="mt-1 text-[10px] text-muted-foreground"><a href={projection.imageSource} target="_blank" rel="noreferrer" className="underline">Source: {projection.credit}</a>{projection.credit.includes('BY-SA') && <span> · modified demonstrations shared under the same license</span>}</p>
  </div>;
}