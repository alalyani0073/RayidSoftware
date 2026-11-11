import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ScanLine,
  ShieldCheck,
  Repeat,
  ClipboardList,
  Waypoints,
  ScanEye,
  Microscope,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { base44 } from '@/api/base44Client';
import StatTile from '@/components/StatTile';
import StatusPill from '@/components/StatusPill';
import { formatTime, mean, scoreTone, verdictOf } from '@/lib/rayid';

const localKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Exam.list({ sort: '-exam_date', limit: 200 }).then((res) => {
      setExams(res.items || []);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const evaluated = exams.filter((e) => Number.isFinite(e.quality_score));
    const repeats = exams.filter((e) => e.verdict === 'repeat_required');
    const todayKey = localKey(new Date());
    const today = exams.filter((e) => localKey(e.exam_date) === todayKey);
    const awaiting = exams.filter((e) => e.verdict === 'pending' && e.status === 'completed');
    const inRoom = exams.filter((e) => e.status === 'in_progress');

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const trend = days.map((d) => {
      const key = localKey(d);
      const scores = evaluated.filter((e) => localKey(e.exam_date) === key).map((e) => e.quality_score);
      return {
        day: d.toLocaleDateString('en-GB', { weekday: 'short' }),
        score: scores.length ? Number(mean(scores).toFixed(1)) : null,
      };
    });

    const reasonCounts = repeats.reduce((acc, e) => {
      const key = e.rejection_reason || 'Unspecified';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const reasons = Object.entries(reasonCounts)
      .map(([label, count]) => ({ label, value: Math.round((count / repeats.length) * 100) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      total: exams.length,
      evaluatedCount: evaluated.length,
      rejectionRate: exams.length ? (repeats.length / exams.length) * 100 : 0,
      repeats: repeats.length,
      todayCount: today.length,
      meanScore: evaluated.length ? mean(evaluated.map((e) => e.quality_score)) : 0,
      awaitingCount: awaiting.length,
      inRoomCount: inRoom.length,
      trend,
      reasons,
      recent: exams.slice(0, 5),
    };
  }, [exams]);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const phases = [
    { to: '/', label: 'Before', title: 'Protocol fit', copy: 'Patient-specific technique and positioning plan.', icon: Waypoints, count: `${stats.inRoomCount} in room` },
    { to: '/', label: 'During', title: 'Live guidance', copy: 'Sensor reads position, angulation and centring.', icon: ScanEye, count: stats.inRoomCount ? `${stats.inRoomCount} active` : 'room ready' },
    { to: '/', label: 'After', title: 'Image evaluation', copy: 'Anatomical criteria, cut-off and artefact checks.', icon: Microscope, count: `${stats.awaitingCount} to review` },
  ];

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{today} · Room 2 · Al Noor Medical Center</p>
          <h1 className="mt-2.5 font-heading text-[26px] font-medium tracking-[-0.02em] text-white sm:text-[30px]">
            Imaging unit overview
          </h1>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-slate-400">
            RAYID is watching every X-ray in this room — from protocol choice to the final verdict.
          </p>
        </div>
        <Link
          to="/"
          className="group inline-flex items-center gap-2 self-start rounded-full bg-cyan-300 px-5 py-2.5 text-[13px] font-semibold text-[#04121A] transition-all hover:bg-cyan-200 hover:shadow-[0_0_30px_-6px_rgba(61,220,255,0.7)]"
        >
          <ScanLine className="h-4 w-4" strokeWidth={2} />
          Start new examination
        </Link>
      </header>

      {exams.length === 0 ? (
        <section className="panel px-6 py-16 text-center">
          <h2 className="font-heading text-[16px] font-medium text-white">No examinations recorded yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-slate-500">
            Build a patient-specific protocol to see RAYID's quality picture build up in this room.
          </p>
          <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-[12.5px] font-semibold text-[#04121A]">
            Start the first examination
          </Link>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            <StatTile
              label="Rejection rate"
              value={stats.rejectionRate.toFixed(1)}
              suffix="%"
              delta={stats.repeats ? `${stats.repeats} repeats` : 'no repeats'}
              deltaTone={stats.rejectionRate <= 5 ? 'good' : 'bad'}
              footnote={`of ${stats.total} examinations`}
              icon={Repeat}
            />
            <StatTile label="Examinations today" value={stats.todayCount} footnote="recorded since midnight" icon={ScanLine} />
            <StatTile
              label="Mean quality score"
              value={stats.meanScore ? stats.meanScore.toFixed(1) : '—'}
              footnote={`${stats.evaluatedCount} evaluated`}
              icon={ShieldCheck}
            />
            <StatTile label="Awaiting evaluation" value={stats.awaitingCount} footnote="captured, not yet read" icon={ClipboardList} />
          </section>

          <section className="grid gap-3.5 lg:grid-cols-3">
            <div className="panel animate-rayid-rise p-5 lg:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Trend</p>
                  <h2 className="mt-1.5 font-heading text-[15px] font-medium text-white">Image quality score</h2>
                </div>
                <div className="text-right">
                  <div className="num text-[22px] leading-none text-white">{stats.meanScore ? stats.meanScore.toFixed(1) : '—'}</div>
                  <div className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-500">7-day mean</div>
                </div>
              </div>

              <div className="mt-6 h-[212px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.trend} margin={{ top: 6, right: 6, bottom: 0, left: -22 }}>
                    <defs>
                      <linearGradient id="qualityFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3DDCFF" stopOpacity={0.34} />
                        <stop offset="100%" stopColor="#3DDCFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} dy={8} />
                    <YAxis domain={[60, 100]} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }} width={44} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(61,220,255,0.35)', strokeDasharray: '4 4' }}
                      contentStyle={{ background: '#0C131C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: '#94A3B8', fontFamily: 'JetBrains Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em' }}
                      itemStyle={{ color: '#E2F6FF' }}
                      formatter={(v) => [v, 'Quality score']}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#3DDCFF"
                      strokeWidth={2}
                      fill="url(#qualityFill)"
                      connectNulls
                      activeDot={{ r: 4, fill: '#04121A', stroke: '#3DDCFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel animate-rayid-rise p-5">
              <p className="eyebrow">Why images get repeated</p>
              <h2 className="mt-1.5 font-heading text-[15px] font-medium text-white">Rejection drivers</h2>

              {stats.reasons.length === 0 ? (
                <p className="mt-6 text-[12px] leading-relaxed text-slate-500">
                  No repeat examinations recorded. The rejection drivers RAYID spots will appear here.
                </p>
              ) : (
                <ul className="mt-5 space-y-3.5">
                  {stats.reasons.map((r) => (
                    <li key={r.label}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[12px] leading-tight text-slate-300">{r.label}</span>
                        <span className="num text-[11px] text-slate-500">{r.value}%</span>
                      </div>
                      <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400/80 to-cyan-300/40" style={{ width: `${r.value}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="grid gap-3.5 lg:grid-cols-3">
            <div className="panel animate-rayid-rise overflow-hidden lg:col-span-2">
              <div className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="eyebrow">Latest</p>
                  <h2 className="mt-1.5 font-heading text-[15px] font-medium text-white">Recent examinations</h2>
                </div>
                <Link to="/archive" className="inline-flex items-center gap-1 text-[11.5px] text-slate-400 transition-colors hover:text-cyan-300">
                  View all <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="hidden grid-cols-[1.4fr_1.2fr_70px_100px_50px] gap-3 border-t border-white/[0.06] px-5 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600 sm:grid">
                <span>Patient</span>
                <span>Examination</span>
                <span className="text-right">Score</span>
                <span>Verdict</span>
                <span className="text-right">Time</span>
              </div>

              <ul className="divide-y divide-white/[0.05] border-t border-white/[0.06] sm:border-t-0">
                {stats.recent.map((e) => (
                  <li key={e.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 sm:grid-cols-[1.4fr_1.2fr_70px_100px_50px]">
                    <span className="truncate text-[12.5px] text-slate-200">{e.patient_name}</span>
                    <span className="truncate text-[11.5px] text-slate-400">{e.protocol_name}</span>
                    <span className={`num text-right text-[12.5px] ${Number.isFinite(e.quality_score) ? scoreTone(e.quality_score) : 'text-slate-600'}`}>
                      {Number.isFinite(e.quality_score) ? Math.round(e.quality_score) : '—'}
                    </span>
                    <span className="hidden sm:block">
                      <StatusPill status={verdictOf(e.verdict).pill}>{verdictOf(e.verdict).label}</StatusPill>
                    </span>
                    <span className="num hidden text-right text-[11px] text-slate-500 sm:block">
                      {e.exam_date ? formatTime(e.exam_date) : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel animate-rayid-rise p-5">
              <p className="eyebrow">In this room</p>
              <h2 className="mt-1.5 font-heading text-[15px] font-medium text-white">Three moments, one assistant</h2>

              <div className="mt-4 space-y-2.5">
                {phases.map(({ to, label, title, copy, icon: Icon, count }) => (
                  <Link
                    key={label}
                    to={to}
                    className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 transition-all hover:border-cyan-300/25 hover:bg-cyan-400/[0.05]"
                  >
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-cyan-300/80">
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</span>
                      <span className="mt-0.5 block text-[12.5px] font-medium text-slate-100">{title}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{copy}</span>
                    </span>
                    <span className="mt-1 flex shrink-0 flex-col items-end gap-1">
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-600 transition-colors group-hover:text-cyan-300" />
                      <span className="num text-[9px] text-slate-600">{count}</span>
                    </span>
                  </Link>
                ))}
              </div>

              <p className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.16em] text-slate-600">
                {stats.inRoomCount} in room · {stats.awaitingCount} to review
              </p>
            </div>
          </section>
        </>
      )}

      <p className="mx-auto max-w-2xl text-center font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-slate-600">
        RAYID concept prototype · simulated sensor telemetry and model output · not a medical device
      </p>
    </div>
  );
}