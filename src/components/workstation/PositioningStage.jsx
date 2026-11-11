import { Camera, Loader2, RotateCcw } from 'lucide-react';
import SensorStage from '@/components/SensorStage';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { centringAdvice, rotationAdvice } from '@/lib/rayid';

function SliderField({ label, value, min, max, step, unit, onChange, ok }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-500">{label}</span>
        <span className={cn('num font-mono text-[10.5px]', ok ? 'text-emerald-300' : 'text-amber-300')}>
          {value > 0 ? '+' : ''}
          {value}
          {unit}
        </span>
      </div>
      <Slider
        className="mt-1.5"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => onChange(next[0])}
      />
    </div>
  );
}

export default function PositioningStage({
  rotation,
  centring,
  onRotation,
  onCentring,
  onReset,
  onAcquire,
  capturing,
  acquired,
}) {
  const rot = rotationAdvice(rotation);
  const cen = centringAdvice(centring);
  const optimal = rot.ok && cen.ok;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0A0E12] px-3 py-1.5">
        <span className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-400">
          <Camera className="h-3 w-3" strokeWidth={1.8} /> Live camera · depth sensor 02
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-rose-300">
          <span className="h-1.5 w-1.5 animate-rayid-pulse rounded-full bg-rose-400" /> rec 30 fps
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        <div
          className={cn(
            'mx-auto w-full max-w-[420px] rounded-[4px] border p-[2px] transition-colors',
            optimal ? 'border-emerald-400/40' : 'border-amber-400/40'
          )}
        >
          <SensorStage rotation={rotation} centring={centring} />

          <div
            className={cn(
              'flex items-center gap-1.5 rounded-b-[2px] px-2 py-1.5 text-[10.5px] font-medium',
              optimal ? 'bg-emerald-400/[0.12] text-emerald-200' : 'bg-amber-400/[0.12] text-amber-200'
            )}
          >
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', optimal ? 'bg-emerald-400' : 'bg-amber-400')} />
            {optimal ? 'Positioning meets criteria · ready to acquire' : `${rot.ok ? '' : rot.text}${!rot.ok && !cen.ok ? ' · ' : ''}${cen.ok ? '' : cen.text}`}
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.07] bg-[#0D1216] px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">Simulate patient movement</span>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-[3px] border border-white/10 px-1.5 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.1em] text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-2.5 w-2.5" strokeWidth={2} /> Reset
          </button>
        </div>

        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          <SliderField label="Rotation" value={rotation} min={-10} max={10} step={0.5} unit="°" onChange={onRotation} ok={rot.ok} />
          <SliderField label="Centring" value={centring} min={-30} max={30} step={1} unit=" mm" onChange={onCentring} ok={cen.ok} />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="max-w-[360px] text-[10px] leading-snug text-slate-500">
            Acquire at any position to see how RAYID scores the resulting image.
          </p>
          <button
            type="button"
            onClick={onAcquire}
            disabled={capturing}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-[11.5px] font-semibold transition-colors',
              capturing ? 'bg-white/10 text-slate-500' : 'bg-cyan-300 text-[#04121A] hover:bg-cyan-200'
            )}
          >
            {capturing ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} /> : null}
            {acquired ? 'Acquire again' : 'Acquire image'}
          </button>
        </div>
      </div>
    </div>
  );
}