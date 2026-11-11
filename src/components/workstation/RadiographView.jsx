import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';

const TONE = {
  high: 'border-rose-400 bg-rose-500/90 text-[#1A0507]',
  medium: 'border-amber-300 bg-amber-400/90 text-[#1A1204]',
  low: 'border-sky-300 bg-sky-400/85 text-[#04121A]',
};

/**
 * Acquired radiograph for the selected projection. Two sample images exist per
 * projection (criteria met / technical fault); the one shown reflects the
 * simulated alignment result of this examination.
 */
export default function RadiographView({
  projection,
  variant = 'accepted',
  scanning = false,
  rayidOn = true,
}) {
  const rejected = variant === 'rejected';
  const boxes = rayidOn && rejected && !scanning ? projection.detections || [] : [];

  return (
    <div
      className={cn(
        'relative mx-auto w-full overflow-hidden rounded-[3px] border bg-black',
        scanning ? 'border-cyan-400/45' : rayidOn && rejected ? 'border-amber-400/40' : 'border-white/12'
      )}
    >
      <Image
        src={projection.radiograph[variant]}
        alt={`${projection.label} radiograph`}
        fittingType="fit"
        originWidth={1024}
        originHeight={1024}
        className="block w-full"
      />

      {boxes.map((box, index) => (
        <div
          key={`${box.label}-${index}`}
          className="pointer-events-none absolute"
          style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
        >
          <span
            className={cn(
              'absolute inset-0 rounded-[2px] border border-dashed',
              box.severity === 'high' ? 'border-rose-400' : 'border-amber-300'
            )}
          />
          <span
            className={cn(
              'absolute -top-[13px] left-0 whitespace-nowrap rounded-[2px] px-1 py-[1px] font-mono text-[7px] uppercase tracking-[0.1em]',
              TONE[box.severity] || TONE.low
            )}
          >
            {box.label}
          </span>
        </div>
      ))}

      {scanning && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-x-0 h-1/4 animate-rayid-sweep bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-cyan-200">
            <span className="h-1 w-1 animate-rayid-pulse rounded-full bg-cyan-300" />
            checking anatomical criteria
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-1.5 top-1.5 flex items-center justify-between gap-2">
        <span className="rounded-[2px] bg-black/70 px-1.5 py-[1px] font-mono text-[7.5px] uppercase tracking-[0.14em] text-slate-300">
          {projection.label} · DICOM
        </span>
        <span className="rounded-[2px] bg-black/70 px-1.5 py-[1px] font-mono text-[7.5px] uppercase tracking-[0.14em] text-slate-400">
          sample image
        </span>
      </div>
    </div>
  );
}