import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Positioning reference for one projection with the simulated RAYID detection
 * overlay drawn on top. No live camera: the image is a fixed clinical
 * reference and the overlay is geometry driven by the simulated alignment
 * values, so it stays honest about what is and is not measured.
 */
export default function ProjectionReference({
  projection,
  live = false,
  rayidOn = true,
  rotation = 0,
  centring = 0,
  rotationOk = true,
  centringOk = true,
}) {
  const optimal = rotationOk && centringOk;
  const focus = projection.focus || { x: 0.5, y: 0.5 };
  const field = projection.field || { w: 34, h: 46 };
  const shift = clamp(centring, -30, 30) * 0.85;
  const tilt = clamp(rotation, -10, 10) * 1.8;
  const cx = focus.x * 100 + shift;
  const cy = focus.y * 100;

  const lineColor = rayidOn ? 'rgba(61,220,255,0.55)' : 'rgba(255,255,255,0.35)';
  const frameColor =
    live && rayidOn ? (optimal ? 'rgba(52,211,153,0.85)' : 'rgba(251,191,36,0.85)') : lineColor;

  return (
    <div
      className={cn(
        'relative mx-auto w-full overflow-hidden rounded-[4px] border bg-black',
        live && rayidOn
          ? optimal
            ? 'border-emerald-400/40'
            : 'border-amber-400/40'
          : 'border-white/10'
      )}
    >
      <Image
        src={projection.reference}
        alt={`Positioning reference for ${projection.label}`}
        fittingType="fit"
        originWidth={1024}
        originHeight={1024}
        className="block w-full"
      />

      <div className="pointer-events-none absolute inset-0 bg-slate-950/40" />

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute border border-dashed"
          style={{
            left: `${cx - field.w / 2}%`,
            top: `${cy - field.h / 2}%`,
            width: `${field.w}%`,
            height: `${field.h}%`,
            borderColor: frameColor,
          }}
        />

        <div
          className="absolute w-px"
          style={{
            left: `${cx}%`,
            top: '3%',
            height: `${cy - 3}%`,
            background: lineColor,
            opacity: 0.8,
          }}
        />
        <div
          className="absolute -translate-x-1/2"
          style={{
            left: `${cx}%`,
            top: `${cy}%`,
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: `7px solid ${lineColor}`,
          }}
        />

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${cx}%`, top: `${cy}%` }}
        >
          <div className="relative h-6 w-6">
            <span
              className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2"
              style={{ background: frameColor }}
            />
            <span
              className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2"
              style={{ background: frameColor }}
            />
            <span
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: frameColor }}
            />
          </div>
        </div>

        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${cx}%`, top: `${cy}%`, height: `${field.h * 1.5}%`, width: 0 }}
        >
          <span
            className="block h-full w-px"
            style={{
              background: rayidOn ? 'rgba(251,191,36,0.55)' : 'rgba(255,255,255,0.25)',
              transform: `rotate(${tilt}deg)`,
              transformOrigin: 'center',
            }}
          />
        </div>

        {rayidOn && (
          <>
            <span
              className="absolute -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-black/70 px-1 py-[1px] font-mono text-[7px] uppercase tracking-[0.14em] text-cyan-200"
              style={{ left: `${cx}%`, top: `${Math.max(1, cy - field.h / 2 - 5)}%` }}
            >
              central ray
            </span>
            <span
              className="absolute whitespace-nowrap rounded-[2px] bg-black/70 px-1 py-[1px] font-mono text-[7px] uppercase tracking-[0.14em]"
              style={{
                left: `${Math.min(72, cx + 4)}%`,
                top: `${cy + 2}%`,
                color: centringOk ? '#86efac' : '#fcd34d',
              }}
            >
              {centringOk ? 'centred' : `off-centre ${centring > 0 ? '+' : ''}${centring} mm`}
            </span>
            {!rotationOk && live && (
              <span
                className="absolute -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-amber-400/90 px-1 py-[1px] font-mono text-[7px] uppercase tracking-[0.1em] text-[#1A1204]"
                style={{ left: `${cx}%`, top: `${cy + field.h / 2 + 3}%` }}
              >
                rotation {rotation > 0 ? '+' : ''}
                {Number(rotation).toFixed(1)}° · rotate patient
              </span>
            )}
          </>
        )}

        <span className="absolute bottom-1.5 left-1.5 rounded-[2px] bg-black/70 px-1 py-[1px] font-mono text-[7px] uppercase tracking-[0.14em] text-slate-300">
          {live ? 'simulated alignment overlay' : 'reference view'}
        </span>
      </div>
    </div>
  );
}