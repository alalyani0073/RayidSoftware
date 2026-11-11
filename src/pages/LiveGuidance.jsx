import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Camera, ArrowRight, CircleCheck, TriangleAlert, MoveHorizontal, RotateCw, Crosshair, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SensorStage from '@/components/SensorStage';
import StatusPill from '@/components/StatusPill';
import { centringAdvice, rotationAdvice } from '@/lib/rayid';

const ROTATION_TOLERANCE = 2;
const CENTRING_TOLERANCE = 12;

export default function LiveGuidance() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const examId = params.get('exam');

  const [exam, setExam] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState('');
  const [rotation, setRotation] = useState(6.4);
  const [centring, setCentring] = useState(-18);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      if (examId) {
        const record = await base44.entities.Exam.get(examId).catch(() => null);
        if (active) setExam(record);
      } else {
        const res = await base44.entities.Exam.filter({ status: 'in_progress' }, { sort: 'exam_date', limit: 20 });
        if (active) setQueue(res.items || []);
      }
      if (active) setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [examId]);

  const rotationState = rotationAdvice(rotation);
  const centringState = centringAdvice(centring);
  const optimal = rotationState.ok && centringState.ok;

  const guidance = useMemo(
    () => [
      { icon: RotateCw, ok: rotationState.ok, label: 'Patient rotation', text: rotationState.text, value: `${rotation > 0 ? '+' : ''}${rotation.toFixed(1)}°` },
      { icon: MoveHorizontal, ok: centringState.ok, label: 'Centring', text: centringState.text, value: `${centring > 0 ? '+' : ''}${centring} mm` },
      {
        icon: Crosshair,
        ok: Math.abs(centring) <= CENTRING_TOLERANCE,
        label: 'Collimation field',
        text: Math.abs(centring) <= CENTRING_TOLERANCE ? 'Field edge clears the anatomy' : 'Field edge is clipping lateral anatomy',
        value: '4:1',
      },
      { icon: Camera, ok: true, label: 'Source distance', text: `${exam?.sid_cm || 180} cm maintained — no magnification risk`, value: `${exam?.sid_cm || 180} cm` },
    ],
    [rotation, centring, rotationState, centringState, exam]
  );

  const capture = async () => {
    if (!exam) return;
    setCapturing(true);
    setError('');
    try {
      await base44.entities.Exam.update(exam.id, {
        status: 'completed',
        rotation_deg: Number(rotation.toFixed(1)),
        centring_offset_mm: centring,
        exam_date: new Date().toISOString(),
      });
      navigate(`/post-exam?exam=${exam.id}`);
    } catch (err) {
      setError('The capture could not be recorded. Please try again.');
      setCapturing(false);
    }
  };

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (!examId) {
    return (
      <div className="space-y-7">
        <header>
          <p className="eyebrow">During the exposure</p>
          <h1 className="mt-2.5 font-heading text-[26px] font-medium tracking-[-0.02em] text-white sm:text-[30px]">Live positioning</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-400">
            The depth sensor reads the patient in the room and RAYID turns it into direction you can act on.
          </p>
        </header>

        <section className="panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">In the room</p>
              <h2 className="mt-1.5 font-heading text-[15px] font-medium text-white">Examinations waiting for guidance</h2>
            </div>
            <Link to="/pre-exam" className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300 px-4 py-2 text-[12px] font-semibold text-[#04121A] transition-colors hover:bg-cyan-200">
              <Plus className="h-3.5 w-3.5" /> Start examination
            </Link>
          </div>

          {queue.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 px-5 py-12 text-center">
              <p className="text-[13px] text-slate-400">No examination is in progress.</p>
              <p className="mt-1 text-[11.5px] text-slate-600">Build a protocol first and RAYID will meet you in the room.</p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-white/[0.05]">
              {queue.map((item) => (
                <li key={item.id}>
                  <Link to={`/live?exam=${item.id}`} className="group flex items-center gap-3 py-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-cyan-300/80">
                      <Camera className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-slate-200">{item.patient_name}</span>
                      <span className="block truncate text-[11px] text-slate-500">{item.protocol_name}</span>
                    </span>
                    <StatusPill status="progress" />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-300" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="panel mx-auto max-w-md p-8 text-center">
        <p className="text-[13px] text-slate-300">That examination could not be found.</p>
        <Link to="/live" className="mt-4 inline-block text-[12px] text-cyan-300">Back to the room</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">During the exposure · sensor 02</p>
          <h1 className="mt-2.5 font-heading text-[24px] font-medium tracking-[-0.02em] text-white sm:text-[28px]">{exam.patient_name}</h1>
          <p className="mt-1.5 text-[12.5px] text-slate-400">
            {exam.protocol_name} · {exam.age} y · {exam.weight_kg} kg
            {exam.patient_ref ? ` · ${exam.patient_ref}` : ''}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors ${
            optimal ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
          }`}
        >
          {optimal ? <CircleCheck className="h-3.5 w-3.5" /> : <TriangleAlert className="h-3.5 w-3.5" />}
          {optimal ? 'Position optimal' : 'Adjust position'}
        </div>
      </header>

      <div className="grid gap-3.5 lg:grid-cols-12">
        <div className="space-y-3.5 lg:col-span-7">
          <SensorStage rotation={rotation} centring={centring} rotationTolerance={ROTATION_TOLERANCE} centringTolerance={CENTRING_TOLERANCE} />

          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-slate-500">Move the patient</p>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">simulated sensor</span>
            </div>

            <Control label="Rotation" value={`${rotation > 0 ? '+' : ''}${rotation.toFixed(1)}°`} ok={rotationState.ok}>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-cyan-400"
                aria-label="Patient rotation"
              />
            </Control>

            <Control label="Centring" value={`${centring > 0 ? '+' : ''}${centring} mm`} ok={centringState.ok}>
              <input
                type="range"
                min="-40"
                max="40"
                step="1"
                value={centring}
                onChange={(e) => setCentring(Number(e.target.value))}
                className="w-full accent-cyan-400"
                aria-label="Centring offset"
              />
            </Control>
          </div>
        </div>

        <div className="space-y-3.5 lg:col-span-5">
          <section className="panel p-5">
            <p className="eyebrow">Camera feedback</p>
            <h2 className="mt-1.5 font-heading text-[15px] font-medium text-white">What to change now</h2>

            <ul className="mt-4 space-y-2.5">
              {guidance.map(({ icon: Icon, ok, label, text, value }) => (
                <li
                  key={label}
                  className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    ok ? 'border-white/[0.06] bg-white/[0.02]' : 'border-amber-400/25 bg-amber-400/[0.07]'
                  }`}
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${ok ? 'text-emerald-400/90' : 'text-amber-300'}`} strokeWidth={1.7} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-[0.1em] text-slate-500">{label}</span>
                      <span className={`num text-[11px] ${ok ? 'text-slate-400' : 'text-amber-300'}`}>{value}</span>
                    </span>
                    <span className={`mt-0.5 block text-[12px] leading-snug ${ok ? 'text-slate-300' : 'text-amber-100'}`}>{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5">
            <p className="eyebrow">Technique in use</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <MetricMini label="kVp" value={exam.kvp || '—'} />
              <MetricMini label="mAs" value={exam.mas || '—'} />
              <MetricMini label="SID" value={exam.sid_cm ? `${exam.sid_cm}` : '—'} />
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Technique was fitted before the exam. RAYID only changes position now — the exposure stays as planned.
            </p>

            <button
              type="button"
              onClick={capture}
              disabled={capturing}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-[13px] font-semibold text-[#04121A] transition-all hover:bg-cyan-200 disabled:opacity-60"
            >
              {capturing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Capture &amp; evaluate
            </button>
            {error && <p className="mt-2 text-center text-[11.5px] text-rose-300">{error}</p>}
            <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">concept prototype · simulated sensor</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function Control({ label, value, ok, children }) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">{label}</span>
        <span className={`num text-[11px] ${ok ? 'text-emerald-300' : 'text-amber-300'}`}>{value}</span>
      </div>
      {children}
    </div>
  );
}

function MetricMini({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
      <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="num mt-1 text-[16px] leading-none text-white">{value}</div>
    </div>
  );
}