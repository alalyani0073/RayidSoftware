import { Loader2, RotateCcw, ShieldCheck } from 'lucide-react';
import RadiographStage from '@/components/RadiographStage';
import { cn } from '@/lib/utils';

const BOXES = {
  cutoff: { x: 106, y: 44, w: 116, h: 74 },
  positioning: { x: 118, y: 92, w: 124, h: 128 },
  artefact: { x: 232, y: 96, w: 62, h: 68 },
  exposure: { x: 128, y: 50, w: 104, h: 96 },
  collimation: { x: 96, y: 60, w: 108, h: 104 },
};

const SEVERITY = { high: 'high', medium: 'medium', low: 'low' };

const annotationsOf = (assessment) =>
  (assessment?.findings || []).slice(0, 4).map((finding, index) => {
    const box = BOXES[finding.type] || BOXES.positioning;
    return {
      ...box,
      x: box.x + index * 6,
      y: box.y + index * 10,
      label: finding.label,
      severity: SEVERITY[finding.severity] || 'low',
    };
  });

export default function ReviewStage({ exam, assessment, evaluating, onRepeat, onOverride, onClose }) {
  const accepted = assessment?.verdict === 'accepted';
  const annotations = annotationsOf(assessment);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-[#0A0E12] px-3 py-1.5">
        <span className="ws-label">Image review · {exam.protocol_name}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-500">For presentation</span>
          {assessment && !evaluating && (
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

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5">
        <div className="relative mx-auto w-full max-w-[560px]">
          <RadiographStage annotations={annotations} scanning={evaluating} />

          {assessment && !evaluating && (
            <div
              className={cn(
                'absolute inset-x-2 bottom-2 rounded-[4px] border px-2.5 py-1.5 backdrop-blur',
                accepted ? 'border-emerald-400/35 bg-emerald-950/70' : 'border-amber-400/35 bg-amber-950/60'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-slate-300">RAYID assessment</span>
                <span
                  className={cn(
                    'ml-auto font-heading text-[11px] font-semibold uppercase tracking-[0.12em]',
                    accepted ? 'text-emerald-300' : 'text-amber-300'
                  )}
                >
                  {accepted ? 'Accepted' : 'Needs correction'}
                </span>
              </div>
              <p className="mt-0.5 text-[10.5px] leading-snug text-slate-200">{assessment.recommendation}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-[#0D1216] px-3 py-2">
        <p className="max-w-[380px] text-[10px] leading-snug text-slate-500">
          {evaluating
            ? 'RAYID is checking coverage, rotation and exposure.'
            : accepted
              ? 'Image meets the anatomical criteria for this view.'
              : 'Review the findings before sending the image to PACS.'}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {evaluating ? (
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-200">
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} /> Evaluating
            </span>
          ) : accepted ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-[4px] bg-cyan-300 px-3 py-1.5 text-[11.5px] font-semibold text-[#04121A] hover:bg-cyan-200"
            >
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.2} /> Close study · next patient
            </button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}