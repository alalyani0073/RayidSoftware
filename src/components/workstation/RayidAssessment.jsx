import ScoreRing from '@/components/ScoreRing';
import { cn } from '@/lib/utils';

const DOT = {
  high: 'bg-rose-400',
  medium: 'bg-amber-400',
  low: 'bg-sky-400',
};

export default function RayidAssessment({ assessment }) {
  const accepted = assessment.verdict === 'accepted';

  return (
    <div className="space-y-2.5 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <ScoreRing score={assessment.quality_score} size={62} label="score" />
        <div className="min-w-0">
          <div
            className={cn(
              'font-heading text-[12px] font-semibold uppercase tracking-[0.1em]',
              accepted ? 'text-emerald-300' : 'text-amber-300'
            )}
          >
            {accepted ? 'Accepted' : 'Needs correction'}
          </div>
          <p className="mt-1 text-[10.5px] leading-snug text-slate-400">{assessment.summary}</p>
        </div>
      </div>

      {Array.isArray(assessment.criteria) && assessment.criteria.length > 0 && (
        <div>
          <span className="ws-label">Criteria</span>
          <ul className="mt-1 space-y-1">
            {assessment.criteria.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex items-start gap-1.5">
                <span
                  className={cn(
                    'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                    item.status === 'pass' ? 'bg-emerald-400' : item.status === 'partial' ? 'bg-amber-400' : 'bg-rose-400'
                  )}
                />
                <span className="min-w-0">
                  <span className="block text-[10.5px] leading-snug text-slate-300">{item.name}</span>
                  <span className="block text-[9.5px] leading-snug text-slate-500">{item.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(assessment.findings) && assessment.findings.length > 0 && (
        <div>
          <span className="ws-label">Findings</span>
          <ul className="mt-1 space-y-1.5">
            {assessment.findings.map((finding, index) => (
              <li key={`${finding.label}-${index}`} className="flex items-start gap-1.5">
                <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', DOT[finding.severity] || DOT.low)} />
                <span className="min-w-0">
                  <span className="block text-[10.5px] leading-snug text-slate-200">{finding.label}</span>
                  <span className="block text-[9.5px] leading-snug text-slate-500">{finding.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-[4px] border border-cyan-300/20 bg-cyan-400/[0.06] px-2 py-1.5">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-cyan-300/80">Recommended action</span>
        <p className="mt-0.5 text-[10.5px] leading-snug text-slate-200">{assessment.recommendation}</p>
      </div>
    </div>
  );
}