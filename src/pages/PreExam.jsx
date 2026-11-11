import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, ArrowRight, Check, UserRound, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { habitusLabel } from '@/lib/rayid';

const EMPTY_PATIENT = { name: '', ref: '', age: '', sex: 'female', weight: '', mobility: 'Cooperative' };
const EXAMPLE_PATIENT = { name: 'Hana Al-Mutairi', ref: 'MRN-40817', age: '67', sex: 'female', weight: '94', mobility: 'Cooperative, can stand' };

export default function PreExam() {
  const navigate = useNavigate();
  const [protocols, setProtocols] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [patient, setPatient] = useState(EMPTY_PATIENT);
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [technologist, setTechnologist] = useState('');

  useEffect(() => {
    base44.entities.Protocol.list({ sort: 'name', limit: 60 }).then((res) => {
      const items = res.items || [];
      setProtocols(items);
      setSelectedId(items[0]?.id ?? null);
    });
    base44.auth.me().then((user) => setTechnologist(user?.full_name || '')).catch(() => {});
  }, []);

  const protocol = useMemo(() => protocols.find((p) => p.id === selectedId) || null, [protocols, selectedId]);
  const ready = Boolean(protocol && patient.name.trim() && patient.age && patient.weight);

  const selectProtocol = (id) => {
    setSelectedId(id);
    setPlan(null);
    setError('');
  };

  const generate = async () => {
    setBusy(true);
    setError('');
    setPlan(null);
    try {
      const res = await base44.functions.invoke('rayidAnalyze', {
        mode: 'pre_exam',
        protocol,
        patient: {
          age: Number(patient.age),
          sex: patient.sex,
          weight_kg: Number(patient.weight),
          mobility: patient.mobility,
        },
      });
      setPlan(res.data.plan);
    } catch (err) {
      setError('RAYID could not build a plan for this patient. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const begin = async () => {
    if (!plan) return;
    setStarting(true);
    try {
      const exam = await base44.entities.Exam.create({
        patient_name: patient.name.trim(),
        patient_ref: patient.ref.trim(),
        age: Number(patient.age),
        sex: patient.sex,
        weight_kg: Number(patient.weight),
        protocol_name: `${protocol.name} — ${protocol.view}`,
        body_part: protocol.region || protocol.name,
        laterality: 'not_applicable',
        technologist,
        exam_date: new Date().toISOString(),
        status: 'in_progress',
        verdict: 'pending',
        kvp: plan.kvp,
        mas: plan.mas,
        sid_cm: plan.sid_cm,
        rotation_deg: 0,
        centring_offset_mm: 0,
      });
      navigate(`/live?exam=${exam.id}`);
    } catch (err) {
      setError('The examination could not be created. Please try again.');
      setStarting(false);
    }
  };

  return (
    <div className="space-y-7">
      <header>
        <p className="eyebrow">Before the exposure</p>
        <h1 className="mt-2.5 font-heading text-[26px] font-medium tracking-[-0.02em] text-white sm:text-[30px]">Patient-specific protocol</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-slate-400">
          RAYID fits the examination to this patient — technique, positioning and breathing — before the patient is aligned.
        </p>
      </header>

      <div className="grid gap-3.5 lg:grid-cols-12">
        <div className="space-y-3.5 lg:col-span-7">
          <section className="panel p-5">
            <StepLabel index="01" title="Examination" meta={protocol ? `${protocol.default_kvp} kVp · ${protocol.default_mas} mAs baseline` : 'loading protocols'} />

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {protocols.map((p) => {
                const active = p.id === selectedId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProtocol(p.id)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                      active
                        ? 'border-cyan-300/50 bg-cyan-400/[0.09] text-white'
                        : 'border-white/[0.07] bg-white/[0.015] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="block text-[12px] font-medium leading-tight">{p.name}</span>
                    <span className={`mt-0.5 block text-[10.5px] ${active ? 'text-cyan-200/80' : 'text-slate-500'}`}>{p.view}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel p-5">
            <StepLabel
              index="02"
              title="Patient"
              meta={patient.weight ? habitusLabel(Number(patient.weight)) : 'required for technique fit'}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setPatient(EXAMPLE_PATIENT);
                    setPlan(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-slate-400 transition-colors hover:border-cyan-300/40 hover:text-cyan-200"
                >
                  <UserRound className="h-3 w-3" /> Example
                </button>
              }
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Patient name">
                <Input value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} placeholder="Full name" className="h-10 border-white/10 bg-white/[0.03]" />
              </Field>
              <Field label="Medical record no.">
                <Input value={patient.ref} onChange={(e) => setPatient({ ...patient, ref: e.target.value })} placeholder="MRN-00000" className="h-10 border-white/10 bg-white/[0.03] font-mono text-[12px]" />
              </Field>
              <Field label="Age (years)">
                <Input type="number" value={patient.age} onChange={(e) => setPatient({ ...patient, age: e.target.value })} placeholder="45" className="h-10 border-white/10 bg-white/[0.03]" />
              </Field>
              <Field label="Weight (kg)">
                <Input type="number" value={patient.weight} onChange={(e) => setPatient({ ...patient, weight: e.target.value })} placeholder="75" className="h-10 border-white/10 bg-white/[0.03]" />
              </Field>
              <Field label="Sex">
                <Select value={patient.sex} onValueChange={(v) => setPatient({ ...patient, sex: v })}>
                  <SelectTrigger className="h-10 border-white/10 bg-white/[0.03]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Mobility">
                <Select value={patient.mobility} onValueChange={(v) => setPatient({ ...patient, mobility: v })}>
                  <SelectTrigger className="h-10 border-white/10 bg-white/[0.03]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cooperative, can stand">Cooperative, can stand</SelectItem>
                    <SelectItem value="Cooperative">Cooperative</SelectItem>
                    <SelectItem value="Seated only">Seated only</SelectItem>
                    <SelectItem value="Stretcher / immobile">Stretcher / immobile</SelectItem>
                    <SelectItem value="Paediatric">Paediatric</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={!ready || busy}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-[13px] font-semibold text-[#04121A] transition-all hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500 sm:w-auto"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {busy ? 'Fitting protocol…' : 'Build RAYID plan'}
            </button>
            {!ready && <p className="mt-2 text-[11px] text-slate-500">Select an examination and complete name, age and weight.</p>}
            {error && <p className="mt-2 text-[11.5px] text-rose-300">{error}</p>}
          </section>
        </div>

        <div className="lg:col-span-5">
          <section className="panel sticky top-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-cyan-300/80">RAYID plan</span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">{protocol ? protocol.view : '—'}</span>
            </div>

            {!plan && (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                  <Sparkles className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
                </div>
                <p className="mx-auto mt-4 max-w-[240px] text-[12.5px] leading-relaxed text-slate-500">
                  {busy ? 'Reading patient habitus, age and the view to fit the technique…' : 'Your patient-specific technique and positioning plan will appear here.'}
                </p>
                {protocol && (
                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-4">
                    <Baseline label="kVp" value={protocol.default_kvp} />
                    <Baseline label="mAs" value={protocol.default_mas} />
                    <Baseline label="SID" value={`${protocol.default_sid_cm} cm`} />
                  </div>
                )}
              </div>
            )}

            {plan && (
              <div className="animate-rayid-rise px-5 py-5">
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="kVp" value={plan.kvp} />
                  <Metric label="mAs" value={plan.mas} />
                  <Metric label="SID" value={`${plan.sid_cm} cm`} />
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="rounded-full border border-white/10 px-2 py-[2px] font-mono text-[9.5px] uppercase tracking-[0.1em]">{plan.grid} grid</span>
                  <span className="rounded-full border border-white/10 px-2 py-[2px] font-mono text-[9.5px] uppercase tracking-[0.1em]">{plan.focal_spot_mm} mm focus</span>
                  <span className="num ml-auto text-cyan-300/80">{plan.confidence}%</span>
                </div>

                <p className="mt-4 border-l-2 border-cyan-400/40 pl-3 text-[12px] leading-relaxed text-slate-300">{plan.patient_note}</p>

                <div className="mt-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Patient-specific adjustments</p>
                  <ul className="mt-2.5 space-y-2">
                    {(plan.adjustments || []).map((a, i) => (
                      <li key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11.5px] text-slate-300">{a.parameter}</span>
                          <span className="num text-[11px] text-cyan-300">{a.change}</span>
                        </div>
                        <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">{a.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Position this patient</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {(plan.positioning || []).map((tip, i) => (
                      <li key={i} className="flex gap-2 text-[11.5px] leading-snug text-slate-300">
                        <Check className="mt-[2px] h-3 w-3 shrink-0 text-emerald-400" strokeWidth={2.4} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 rounded-lg bg-cyan-400/[0.06] px-3 py-2 text-[11px] text-cyan-100/90">{plan.breathing}</p>
                </div>

                <button
                  type="button"
                  onClick={begin}
                  disabled={starting}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-[13px] font-semibold text-[#04121A] transition-all hover:bg-cyan-200 disabled:opacity-60"
                >
                  {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Begin examination
                </button>
                <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">concept prototype · not for clinical use</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StepLabel({ index, title, meta, action }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-baseline gap-2.5">
        <span className="num text-[10px] text-cyan-300/70">{index}</span>
        <div>
          <h2 className="font-heading text-[14px] font-medium text-white">{title}</h2>
          <p className="mt-0.5 text-[10.5px] text-slate-500">{meta}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">{label}</Label>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
      <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="num mt-1 text-[19px] leading-none text-white">{value}</div>
    </div>
  );
}

function Baseline({ label, value }) {
  return (
    <div>
      <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-600">{label}</div>
      <div className="num mt-1 text-[12px] text-slate-400">{value}</div>
    </div>
  );
}