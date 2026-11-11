import { cn } from '@/lib/utils';

const TONES = {
  accepted: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25',
  repeat: 'text-rose-300 bg-rose-400/10 border-rose-400/25',
  review: 'text-amber-300 bg-amber-400/10 border-amber-400/25',
  progress: 'text-cyan-300 bg-cyan-400/10 border-cyan-400/25',
  neutral: 'text-slate-300 bg-white/[0.05] border-white/10',
};

const LABELS = {
  accepted: 'Accepted',
  repeat: 'Repeat',
  review: 'Review',
  progress: 'In progress',
};

export default function StatusPill({ status = 'neutral', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] font-mono text-[9.5px] uppercase tracking-[0.12em]',
        TONES[status] || TONES.neutral,
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {children || LABELS[status]}
    </span>
  );
}