import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime, verdictOf } from '@/lib/rayid';

const SEX = { male: 'M', female: 'F', other: '—' };

const statusOf = (exam) => {
  if (exam.status === 'completed') {
    const verdict = verdictOf(exam.verdict);
    return { label: verdict.label, tone: verdict.tone };
  }
  if (exam.status === 'in_progress') return { label: 'Open', tone: 'text-cyan-300' };
  return { label: 'Scheduled', tone: 'text-slate-500' };
};

export default function Worklist({ exams = [], activeId, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const { open, done } = useMemo(() => {
    const term = query.trim().toLowerCase();
    const match = (exam) =>
      !term ||
      [exam.patient_name, exam.patient_ref, exam.protocol_name].some((value) =>
        String(value || '').toLowerCase().includes(term)
      );
    return {
      open: exams.filter((exam) => exam.status !== 'completed' && match(exam)),
      done: exams.filter((exam) => exam.status === 'completed' && match(exam)).slice(0, 5),
    };
  }, [exams, query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#0C1014]">
      <div className="border-b border-white/[0.07] px-2.5 py-2">
        <div className="flex items-center justify-between">
          <span className="ws-label">Worklist · DR 2</span>
          <span className="num font-mono text-[9px] text-slate-500">{open.length} open</span>
        </div>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Patient, MRN or exam"
            className="h-7 w-full rounded-[4px] border border-white/10 bg-[#090D10] pl-7 pr-2 text-[11px] text-slate-200 placeholder:text-slate-600 focus:border-cyan-400/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {open.length === 0 && done.length === 0 && (
          <p className="px-3 py-4 text-[11px] text-slate-500">No matching examinations.</p>
        )}

        {open.map((exam) => {
          const status = statusOf(exam);
          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => onSelect(exam)}
              className={cn(
                'w-full border-l-2 px-2.5 py-2 text-left transition-colors',
                exam.id === activeId
                  ? 'border-cyan-400 bg-cyan-400/[0.08]'
                  : 'border-transparent hover:bg-white/[0.04]'
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[12px] font-medium text-slate-100">{exam.patient_name}</span>
                <span className="num shrink-0 font-mono text-[9.5px] text-slate-500">{formatTime(exam.exam_date)}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className="truncate text-[10.5px] text-slate-500">{exam.protocol_name}</span>
                <span className={cn('shrink-0 font-mono text-[8.5px] uppercase tracking-[0.1em]', status.tone)}>
                  {status.label}
                </span>
              </div>
              <div className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">
                {exam.patient_ref} · {exam.age ? `${exam.age} y` : 'age —'} · {SEX[exam.sex] || '—'}
              </div>
            </button>
          );
        })}

        {done.length > 0 && (
          <div className="border-t border-white/[0.07] pt-1">
            <p className="px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-600">Completed today</p>
            {done.map((exam) => {
              const status = statusOf(exam);
              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => {
                    onClose?.();
                    navigate('/archive');
                  }}
                  className="w-full border-l-2 border-transparent px-2.5 py-1.5 text-left hover:bg-white/[0.03]"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[11px] text-slate-400">{exam.patient_name}</span>
                    <span className={cn('shrink-0 font-mono text-[8.5px] uppercase tracking-[0.1em]', status.tone)}>
                      {status.label}
                    </span>
                  </div>
                  <div className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-slate-600">
                    {exam.protocol_name} · {formatTime(exam.exam_date)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.07] px-2.5 py-2">
        <p className="font-mono text-[8.5px] uppercase leading-relaxed tracking-[0.12em] text-slate-600">
          Simulated worklist · no RIS/HIS link
        </p>
      </div>
    </div>
  );
}