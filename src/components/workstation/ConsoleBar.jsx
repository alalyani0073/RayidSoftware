import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const STAGES = [
  { key: 'pre', label: 'Preparation' },
  { key: 'positioning', label: 'Positioning' },
  { key: 'review', label: 'Review' },
];

export default function ConsoleBar({ stage, open, rayidOn, onToggleRayid }) {
  const index = STAGES.findIndex((item) => item.key === stage);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-white/[0.07] bg-[#0A0E12] px-3 py-1.5">
      <span className="hidden font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-500 sm:inline">
        DR Room 2 · DigitalDiagnost
      </span>

      <div className="flex items-center gap-1">
        {STAGES.map((item, i) => {
          const active = open && item.key === stage;
          const done = open && index > i;
          return (
            <span key={item.key} className="flex items-center gap-1">
              {i > 0 && <span className="h-px w-3 bg-white/15" />}
              <span
                className={cn(
                  'rounded-[3px] px-1.5 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.12em]',
                  active
                    ? 'bg-white/[0.09] text-white'
                    : done
                      ? 'text-emerald-300/80'
                      : 'text-slate-500'
                )}
              >
                {item.label}
              </span>
            </span>
          );
        })}
      </div>

      <span className="ml-auto hidden font-mono text-[8px] uppercase tracking-[0.14em] text-slate-600 md:inline">
        Simulated console
      </span>

      <button
        type="button"
        onClick={onToggleRayid}
        aria-pressed={rayidOn}
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-[4px] border px-2 py-[3px] transition-colors',
          rayidOn
            ? 'border-cyan-300/45 bg-cyan-400/15 text-cyan-200'
            : 'border-white/12 bg-white/[0.03] text-slate-400 hover:text-slate-200'
        )}
      >
        <Sparkles className="h-3 w-3" strokeWidth={2} />
        <span className="font-mono text-[9px] uppercase tracking-[0.16em]">RAYID</span>
        <span
          className={cn(
            'rounded-[2px] px-1 py-[1px] font-mono text-[8px] uppercase tracking-[0.1em]',
            rayidOn ? 'bg-cyan-300 text-[#04121A]' : 'bg-white/10 text-slate-400'
          )}
        >
          {rayidOn ? 'on' : 'off'}
        </span>
      </button>
    </div>
  );
}