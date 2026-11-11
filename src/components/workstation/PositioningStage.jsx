import { Loader2, RotateCcw } from 'lucide-react';
import ProjectionReference from '@/components/workstation/ProjectionReference';
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
  projection,
  rotation,
  centring,
  onRotation,
  onCentring,
  onReset,
  onAcquire,
  capturing,
  rayidOn,
}) {
  const tol = projection.tolerances;
  const rot = rotationAdvice(rotation, tol.rotation);
  const cen = centringAdvice(centring, tol.centring);
  const optimal = rot.ok && cen.ok;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-[#0A0E12] px-3 py-1.5">
        <span className="ws-label">Positioning · {projection.label}</span>
        <span className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-500">
          Simulated alignment sensor
          {rayidOn && (
            <span
              className={cn(
                'rounded-[2px] px-1.5 py-[1px] text-[8px] tracking-[0.14em]',
                optimal
                  ? 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30'
                  : 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30'
              )}
            >
              {optimal ? 'ready' : 'adjust'}
            </span>
          )}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        <div className="mx-auto w-full max-w-[430px]">
          <ProjectionReference
            projection={projection}
            live
            rayidOn={rayidOn}
            rotation={rotation}
            centring={centring}
            rotationOk={rot.ok}
            centringOk={cen.ok}
          />
        </div>

        {rayidOn ? (
          <div
            className={cn(
              'mx-auto mt-1.5 flex max-w-[430px] flex-wrap items-center gap-x-3 gap-y-1 rounded-[3px] border px-2 py-1.5 text-[10.5px]',
              optimal
                ? 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200'
                : 'border-amber-400/25 bg-amber-400/[0.07] text-amber-200'
            )}
          >
            <span className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.16em]">
              <span
                className={cn('h-1.5 w-1.5 rounded-full', optimal ? 'bg-emerald-400' : 'bg-amber-400')}
              />
              {optimal ? 'criteria met' : 'correction required'}
            </span>
            <span className="leading-snug">
              {optimal
                ? 'Rotation and centring within tolerance — ready to acquire.'
                : `${rot.ok ? '' : rot.text}${!rot.ok && !cen.ok ? ' · ' : ''}${cen.ok ? '' : cen.text}`}
            </span>
          </div>
        ) : (
          <p className="mx-auto mt-1.5 max-w-[430px] px-1 text-[10px] leading-snug text-slate-500">
            Alignment overlay hidden. Reference: {projection.centring}, {projection.cr.toLowerCase()}.
          </p>
        )}

        <div className="mx-auto mt-2 grid max-w-[430px] gap-x-4 gap-y-1.5 border-t border-white/[0.06] pt-2 sm:grid-cols-2">
          <div>
            <span className="ws-label">Centring point</span>
            <p className="text-[10.5px] leading-snug text-slate-300">{projection.centring}</p>
          </div>
          <div>
            <span className="ws-label">Central ray · tolerance</span>
            <p className="text-[10.5px] leading-snug text-slate-300">
              {projection.cr} · ±{tol.rotation}° rotation, ±{tol.centring} mm
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.07] bg-[#0D1216] px-3 py-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">
            Simulated alignment input
          </span>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-[3px] border border-white/10 px-1.5 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.1em] text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="h-2.5 w-2.5" strokeWidth={2} /> Reset
          </button>
        </div>

        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          <SliderField
            label="Patient rotation"
            value={rotation}
            min={-10}
            max={10}
            step={0.5}
            unit="°"
            onChange={onRotation}
            ok={rot.ok}
          />
          <SliderField
            label="Centring offset"
            value={centring}
            min={-30}
            max={30}
            step={1}
            unit=" mm"
            onChange={onCentring}
            ok={cen.ok}
          />
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
          <p className="max-w-[380px] text-[10px] leading-snug text-slate-500">
            Acquire at any alignment to see how RAYID grades the resulting image.
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
            Acquire image
          </button>
        </div>
      </div>
    </div>
  );
}