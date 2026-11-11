import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import RayidAssessment from '@/components/workstation/RayidAssessment';

const HEADLINE = {
  pre: 'Analysis complete',
  positioning: 'Live analysis',
  review: 'Image assessment',
};

function Metric({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10.5px] text-slate-400">{label}</span>
      <span className={cn('num font-mono text-[11px]', ok ? 'text-emerald-300' : 'text-amber-300')}>{value}</span>
    </div>
  );
}

export default function RayidPanel({
  stage,
  plan,
  planning,
  planError,
  rotation = 0,
  centring = 0,
  rotOk = true,
  cenOk = true,
  messages = [],
  assessment,
  evaluating,
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col bg-[#0C1014]">
      <div className="flex items-center gap-2 border-b border-white/[0.07] px-3 py-2">
        <span className="grid h-5 w-5 place-items-center rounded-[3px] bg-cyan-400/15 ring-1 ring-cyan-300/30">
          <Sparkles className="h-3 w-3 text-cyan-300" strokeWidth={2} />
        </span>
        <span className="font-heading text-[11px] font-semibold tracking-[0.16em] text-white">RAYID</span>
        <span className="ml-auto font-mono text-[8.5px] uppercase tracking-[0.12em] text-cyan-300/80">
          {HEADLINE[stage]}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {stage === 'pre' &&
          (planning ? (
            <div className="flex items-center gap-2 px-3 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-200">
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} /> Analysing examination
            </div>
          ) : planError ? (
            <div className="flex items-start gap-2 px-3 py-3">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" strokeWidth={1.8} />
              <p className="text-[10.5px] leading-snug text-amber-200">{planError}</p>
            </div>
          ) : plan ? (
            <div className="space-y-2.5 px-3 py-2.5">
              <p className="text-[11px] leading-relaxed text-slate-300">{plan.patient_note}</p>

              {Array.isArray(plan.adjustments) && plan.adjustments.length > 0 && (
                <div>
                  <span className="ws-label">Parameter changes</span>
                  <ul className="mt-1 space-y-1.5">
                    {plan.adjustments.slice(0, 4).map((item, index) => (
                      <li key={`${item.parameter}-${index}`} className="text-[10.5px] leading-snug">
                        <span className="text-slate-200">{item.parameter}</span>
                        <span className="text-cyan-300"> · {item.change}</span>
                        <span className="block text-[9.5px] text-slate-500">{item.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(plan.positioning) && plan.positioning.length > 0 && (
                <div>
                  <span className="ws-label">Positioning plan</span>
                  <ol className="mt-1 space-y-1">
                    {plan.positioning.map((step, index) => (
                      <li key={index} className="flex gap-1.5 text-[10.5px] leading-snug text-slate-400">
                        <span className="num font-mono text-[9px] text-slate-600">{index + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-500">
                  <span>Confidence</span>
                  <span className="num text-slate-400">{Math.round(Number(plan.confidence) || 0)}%</span>
                </div>
                <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${Math.min(100, Math.max(0, Number(plan.confidence) || 0))}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="px-3 py-3 text-[10.5px] text-slate-500">Select a patient from the worklist to start.</p>
          ))}

        {stage === 'positioning' && (
          <div className="space-y-2 px-3 py-2.5">
            <Metric label="Patient rotation" value={`${rotation > 0 ? '+' : ''}${rotation.toFixed(1)}°`} ok={rotOk} />
            <Metric label="Centring offset" value={`${centring > 0 ? '+' : ''}${centring} mm`} ok={cenOk} />
            <Metric label="Central ray" value={rotOk && cenOk ? 'Perpendicular' : 'Off-axis'} ok={rotOk && cenOk} />

            <div className="mt-1 space-y-1.5">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-1.5 rounded-[4px] border px-2 py-1.5 text-[10.5px] leading-snug',
                    message.ok
                      ? 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-200'
                      : 'border-amber-400/25 bg-amber-400/[0.07] text-amber-200'
                  )}
                >
                  <span className={cn('mt-1 h-1.5 w-1.5 shrink-0 rounded-full', message.ok ? 'bg-emerald-400' : 'bg-amber-400')} />
                  {message.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === 'review' &&
          (evaluating ? (
            <div className="flex items-center gap-2 px-3 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan-200">
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2} /> Reading anatomy
            </div>
          ) : assessment ? (
            <RayidAssessment assessment={assessment} />
          ) : (
            <p className="px-3 py-3 text-[10.5px] text-slate-500">No assessment for this image.</p>
          ))}
      </div>

      <p className="border-t border-white/[0.07] px-3 py-1.5 font-mono text-[8px] uppercase leading-relaxed tracking-[0.1em] text-slate-600">
        Simulated AI output · not a medical device
      </p>
    </section>
  );
}