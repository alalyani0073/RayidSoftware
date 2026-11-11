import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatTile({ label, value, suffix, delta, deltaTone = 'neutral', footnote, icon: Icon }) {
  const tone = {
    good: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
    bad: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
    neutral: 'text-slate-300 bg-white/[0.05] border-white/10',
  }[deltaTone];

  return (
    <div className="panel animate-rayid-rise p-5">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-slate-600" strokeWidth={1.6} />}
      </div>

      <div className="mt-4 flex items-end gap-1.5">
        <span className="num text-[30px] font-medium leading-none text-white">{value}</span>
        {suffix && <span className="num pb-[3px] text-xs text-slate-500">{suffix}</span>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        {delta && (
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[10px]', tone)}>
            {deltaTone === 'bad' ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
            {delta}
          </span>
        )}
        {footnote && <span className="text-[10.5px] leading-tight text-slate-500">{footnote}</span>}
      </div>
    </div>
  );
}