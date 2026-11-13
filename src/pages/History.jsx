import { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StatusPill from '@/components/StatusPill';
import ScoreRing from '@/components/ScoreRing';
import { Image } from '@/components/ui/image';
import { projectionFor } from '@/lib/protocols';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { formatDateTime, scoreTone, verdictOf } from '@/lib/rayid';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'review', label: 'Review' },
  { value: 'repeat_required', label: 'Repeat' },
  { value: 'pending', label: 'Pending' },
];

export default function History() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    base44.entities.Exam.list({ sort: '-exam_date', limit: 200 }).then((res) => {
      setExams(res.items || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exams.filter((e) => {
      const matchesFilter = filter === 'all' || e.verdict === filter;
      const matchesQuery =
        !q ||
        (e.patient_name || '').toLowerCase().includes(q) ||
        (e.protocol_name || '').toLowerCase().includes(q) ||
        (e.patient_ref || '').toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [exams, query, filter]);

  const selected = exams.find((e) => e.id === openId) || null;
  const repeats = exams.filter((e) => e.verdict === 'repeat_required').length;
  const accepted = exams.filter((e) => e.verdict === 'accepted').length;
  const acceptedRate = exams.length ? Math.round((accepted / exams.length) * 100) : 0;

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Audit trail</p>
          <h1 className="mt-2.5 font-heading text-[26px] font-medium tracking-[-0.02em] text-white sm:text-[30px]">Exam history</h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-slate-400">
            Every exposure in this room, with the verdict RAYID reached and what it found.
          </p>
        </div>
        <div className="flex gap-5">
          <Stat label="Examinations" value={exams.length} />
          <Stat label="Accepted" value={`${acceptedRate}%`} />
          <Stat label="Repeats" value={repeats} tone="text-rose-300" />
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-[300px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, protocol or MRN"
            className="h-10 border-white/10 bg-white/[0.03] pl-9 text-[12.5px]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                filter === f.value
                  ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-200'
                  : 'border-white/[0.08] text-slate-500 hover:border-white/20 hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <section className="panel overflow-hidden">
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-[13px] text-slate-400">No examination matches this view.</p>
          </div>
        ) : (
          <>
            <div className="hidden grid-cols-[1.3fr_1.5fr_66px_120px_1fr_28px] gap-3 border-b border-white/[0.06] px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600 md:grid">
              <span>Patient</span>
              <span>Examination</span>
              <span className="text-right">Score</span>
              <span>Verdict</span>
              <span>Recorded</span>
              <span />
            </div>

            <ul className="divide-y divide-white/[0.05]">
              {filtered.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(e.id)}
                    className="grid w-full grid-cols-[1fr_auto_20px] items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-white/[0.03] md:grid-cols-[1.3fr_1.5fr_66px_120px_1fr_28px]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] text-slate-200">{e.patient_name}</span>
                      <span className="block truncate font-mono text-[10px] text-slate-600">{e.patient_ref || '—'}</span>
                    </span>
                    <span className="hidden truncate text-[11.5px] text-slate-400 md:block">{e.protocol_name}</span>
                    <span className={`num hidden text-right text-[12.5px] md:block ${scoreTone(e.quality_score)}`}>
                      {e.quality_score ?? '—'}
                    </span>
                    <span className="justify-self-end md:justify-self-start">
                      <StatusPill status={verdictOf(e.verdict).pill}>{verdictOf(e.verdict).label}</StatusPill>
                    </span>
                    <span className="num hidden text-[11px] text-slate-500 md:block">{formatDateTime(e.exam_date)}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setOpenId(null)}>
        <DialogContent className="max-h-[88vh] overflow-y-auto border-white/[0.08] bg-[#0A0F17] sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-[18px] font-medium text-white">{selected.patient_name}</DialogTitle>
                <p className="text-[12px] text-slate-500">
                  {selected.protocol_name} · {selected.patient_ref || 'no MRN'} · {formatDateTime(selected.exam_date)}
                </p>
              </DialogHeader>

              <div className="mt-2 flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <ScoreRing score={selected.quality_score || 0} size={92} />
                <div>
                  <StatusPill status={verdictOf(selected.verdict).pill}>{verdictOf(selected.verdict).label}</StatusPill>
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-300">
                    {selected.ai_summary || 'This examination was recorded without a RAYID evaluation.'}
                  </p>
                  {selected.recommendation && <p className="mt-1.5 text-[11px] text-cyan-200/80">{selected.recommendation}</p>}
                </div>
              </div>

              {selected.simulation_snapshot && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  <Image src={projectionFor(selected.protocol_name).radiograph} alt={`Acquired image archived with the ${selected.protocol_name} record`} fittingType="fit" className="h-24 w-20 rounded-md border border-white/10 bg-black/40" />
                  <div className="text-[11px] leading-relaxed text-slate-400">
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500">Acquired image linked to this record</p>
                    <p className="mt-1">PACS transfer: <b className={selected.pacs_status === 'transferred' ? 'text-emerald-300' : 'text-amber-300'}>{selected.pacs_status === 'transferred' ? 'COMPLETED' : 'PENDING'}</b></p>
                    <p>RAYID assessment: <b className="text-rose-300">{selected.quality_score ? `${selected.quality_score}%` : 'not run'}</b></p>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Detail label="kVp" value={selected.kvp || '—'} />
                <Detail label="mAs" value={selected.mas || '—'} />
                <Detail label="Rotation" value={`${selected.rotation_deg ?? 0}°`} />
                <Detail label="Centring" value={`${selected.centring_offset_mm ?? 0} mm`} />
              </div>

              {selected.findings?.length > 0 && (
                <div className="mt-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Findings</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {selected.findings.map((f, i) => (
                      <li key={i} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="mt-4 border-t border-white/[0.06] pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                Technologist · {selected.technologist || 'unassigned'}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, tone = 'text-white' }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className={`num mt-1 text-[20px] leading-none ${tone}`}>{value}</div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="num mt-1 text-[14px] leading-none text-slate-200">{value}</div>
    </div>
  );
}