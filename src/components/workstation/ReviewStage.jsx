import { Loader2, RotateCcw, ShieldCheck } from 'lucide-react';
import RadiographView from '@/components/workstation/RadiographView';
import { cn } from '@/lib/utils';

export default function ReviewStage({
  exam,
  projection,
  assessment,
  evaluating,
  variant,
  rayidOn,
  onRepeat,
  onOverride,
  onClose,
}) {
  const accepted = assessment?.verdict === 'accepted';
  const showVerdict = rayidOn && assessment && !evaluating;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-[#0A0E12] px-3 py-1.5">
        <span className="ws-label">
          Image review · {projection.label} · {exam.patient_ref || 'ACC-—'}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-500">
            For presentation
          </span>
          {showVerdict && (
            <span
              className={cn(
                'rounded-[3px] border px-1.5 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.12em]',
                accepted
                  ? 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-300'
                  : 'border-amber-400/30 bg-amber-400/[0.08] text-amber-300'
              )}
            >
              {accepted ? 'Accepted' : 'Needs correction'}
            </span>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        <div className="mx-auto w-full max-w-[420px]">
          <RadiographView
            projection={projection}
            variant={variant}
            scanning={rayidOn && evaluating}
            rayidOn={rayidOn}
          />
        </div>

        {showVerdict && (
          <div
            className={cn(
              'mx-auto mt-1.5 max-w-[420px] rounded-[3px] border px-2 py-1.5',
              accepted ? 'border-emerald-400/30 bg-emerald-400/[0.06]' : 'border-amber-400/30 bg-amber-400/[0.06]'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-300">
                RAYID assessment
              </span>
              <span
                className={cn(
                  'font-heading text-[10.5px] font-semibold uppercase tracking-[0.12em]',
                  accepted ? 'text-emerald-300' : 'text-amber-300'
                )}
              >
                {accepted ? 'Accepted' : 'Needs correction'}
              </span>
            </div>
            <p className="mt-0.5 text-[10.5px] leading-snug text-slate-200">{assessment.recommendation}</p>
          </div>
        )}

        {!rayidOn && (
          <p className="mx-auto mt-1.5 max-w-[420px] text-[10px] leading-snug text-slate-500">
            RAYID is switched off. The image is released without automated quality review.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-[#0D1216] px-3 py-2">
        <p className="max-w-[380px] text-[10px] leading-snug text-slate-500">
          {!rayidOn
            ? 'Manual review — radiographer decides on acceptance.'
            : evaluating
              ? 'RAYID is checking coverage, rotation and exposure against this projection’s criteria.'
              : accepted
                ? 'Image meets the anatomical criteria for this projection.'
                : 'Review the highlighted findings before sending the image to PACS.'}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {rayidOn && evaluating ? (
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-200">
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} /> Evaluating
            </span>
          ) : rayidOn && !accepted ? (
            <>
              <button
                type="button"
                onClick={onOverride}
                className="rounded-[4px] border border-white/12 px-3 py-1.5 text-[11.5px] text-slate-300 hover:border-white/25 hover:text-white"
              >
                Override and accept
              </button>
              <button
                type="button"
                onClick={onRepeat}
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-amber-300 px-3 py-1.5 text-[11.5px] font-semibold text-[#1A1204] hover:bg-amber-200"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.2} /> Repeat acquisition
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onRepeat}
                className="rounded-[4px] border border-white/12 px-3 py-1.5 text-[11.5px] text-slate-300 hover:border-white/25 hover:text-white"
              >
                Repeat acquisition
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-[4px] bg-cyan-300 px-3 py-1.5 text-[11.5px] font-semibold text-[#04121A] hover:bg-cyan-200"
              >
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} /> Send to PACS · next patient
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}