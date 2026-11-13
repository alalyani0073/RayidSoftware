import { useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import RadiographView from '@/components/workstation/RadiographView';
import ImageResultSummary from '@/components/workstation/ImageResultSummary';
import PacsStatus from '@/components/workstation/PacsStatus';
export default function ReviewStage({ ws }) {
  const [view, setView] = useState({ zoom: 1, contrast: 100, brightness: 100, inverted: false });
  const update = (key, value) => setView(v => ({ ...v, [key]: value }));
  return <div className="flex min-h-0 flex-1 flex-col">
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-border bg-ws-toolbar px-3 py-1.5 text-xs">
      <strong>ACQUIRED IMAGE · {ws.projection.label}</strong>
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <label>Zoom<select aria-label="Image zoom" value={view.zoom} onChange={e => update('zoom', Number(e.target.value))} className="ml-1 rounded-sm border border-input bg-ws-canvas p-1"><option value="1">Fit</option><option value="1.25">125%</option><option value="1.5">150%</option></select></label>
        <label className="flex items-center gap-1.5">Contrast<input aria-label="Image contrast" type="range" min="60" max="180" value={view.contrast} onChange={e => update('contrast', Number(e.target.value))} className="w-14 accent-primary" /></label>
        <label className="flex items-center gap-1.5">Brightness<input aria-label="Image brightness" type="range" min="60" max="160" value={view.brightness} onChange={e => update('brightness', Number(e.target.value))} className="w-14 accent-primary" /></label>
        <button onClick={() => update('inverted', !view.inverted)} aria-pressed={view.inverted} className="rounded-sm border border-border px-1.5 py-0.5">Invert</button>
        <button onClick={() => setView({ zoom: 1, contrast: 100, brightness: 100, inverted: false })} className="text-muted-foreground underline">Reset</button>
      </div>
    </div>
    <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-ws-canvas px-3 py-2"><RadiographView projection={ws.projection} capture={ws.capture} view={view} rayidOn={ws.rayidOn} assessment={ws.assessment} /></div>
    <ImageResultSummary ws={ws} />
    <div className="border-t border-border bg-ws-toolbar px-3 py-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PacsStatus hasImage assessment={ws.assessment} />
        <div className="flex flex-wrap gap-2">
          <button disabled={ws.busy} onClick={ws.repeat} className="flex items-center gap-1.5 rounded-sm border border-border bg-secondary px-3 py-1.5 text-[11px] font-semibold"><RotateCcw className="h-3.5 w-3.5" />REPEAT</button>
          <button onClick={ws.requestAccept} disabled={ws.busy || (ws.rayidOn && ws.evaluating)} className="flex items-center gap-1.5 rounded-sm bg-secondary px-3 py-1.5 text-[11px] font-semibold hover:bg-accent disabled:opacity-50">{ws.busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{ws.rayidOn && ws.assessment && !ws.assessment.accepted ? 'ACCEPT IMAGE & CONTINUE' : 'ACCEPT & FINISH EXAM'}</button>
        </div>
      </div>
    </div>
  </div>;
}