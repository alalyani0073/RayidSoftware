import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Sparkles, Check, TriangleAlert, X, Save, ScanLine } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RadiographStage from '@/components/RadiographStage';
import ScoreRing from '@/components/ScoreRing';
import StatusPill from '@/components/StatusPill';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateTime, verdictOf } from '@/lib/rayid';

const BOX_BY_TYPE = {
  cutoff: { x: 106, y: 198, w: 68, h: 56 },
  artefact: { x: 198, y: 146, w: 50, h: 44 },
  positioning: { x: 142, y: 104, w: 76, h: 154 },
  exposure: { x: 116, y: 92, w: 128, h: 176 },
  collimation: { x: 92, y: 86, w: 176, h: 196 },
};

const CRITERIA_ICON = {
  pass: <Check className="h-3.5 w-3.5 text-emerald-400" strokeWidth={2.6} />,
  partial: <TriangleAlert className="h-3.5 w-3.5 text-amber-300" strokeWidth={2} />,
  fail: <X className="h-3.5 w-3.5 text-rose-400" strokeWidth={2.4} />,
};

export default function PostExam() {
  const [params] = useSearchParams();
  const [exams, setExams] = useState([]);
  const [selectedId, setSelectedId] = useState(params.get('exam') || '');
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.entities.Exam.filter({ status: 'completed' }, { sort: '-exam_date', limit: 40 }).then((res) => {
      const items = res.items || [];
      setExams(items);
      setSelectedId((current) => (items.some((e) => e.id === current) ? current : items[0]?.id || ''));
      setLoading(false);
    });
  }, []);

  const exam = useMemo(() => exams.find((e) => e.id === selectedId) || null, [exams, selectedId]);
  const storedResult = exam && exam.verdict !== 'pending';

  const pick = (id) => {
    setSelectedId(id);
    setAssessment(null);
    setSaved(false);
    setError('');
  };

  const evaluate = async () => {
    if (!exam) return;
    setBusy(true);
    setError('');
    setAssessment(null);
    setSaved(false);
    try {
      const protocolRes = await base44.entities.Protocol.list({ limit: 60 });
      const protocols = protocolRes.items || [];
      const match = protocols.find((p) => (exam.protocol_name || '').startsWith(p.name));
      const res = await base44.functions.invoke('rayidAnalyze', {
        mode: 'post_exam',
        exam,
        criteria: match?.criteria || [],
      });
      setAssessment(res.data.assessment);
    } catch (err) {
      setError('RAYID could not read this image. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!assessment || !exam) return;
    setSaving(true);
    setError('');
    try {
      const findings = (assessment.findings || []).map((f) => `${f.label} · ${f.severity}`);
      const updated = await base44.entities.Exam.update(exam.id, {
        verdict: assessment.verdict,
        quality_score: assessment.quality_score,
        rejection_reason: assessment.findings?.[0]?.label || '',
        findings,
        ai_summary: assessment.summary,
        recommendation: assessment.recommendation,
      });
      setExams((current) => current.map((e) => (e.id === exam.id ? { ...e, ...updated } : e)));
      setAssessment(null);
      setSaved(true);
    } catch (err) {
      setError('The verdict could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid h-[60vh] place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="space-y-7">
        <header>
          <p className="eyebrow">After the exposure</p>
          <h1 className="mt-2.5 font-heading text-[26px] font-medium tracking-[-0.02em] text-white sm:text-[30px]">Image evaluation</h1>
        </header>
        <div className="panel px-5 py-16 text-center">
          <p className="text-[13px] text-slate-400">No captured image is waiting for evaluation.</p>
          <p className="mt-1 text-[11.5px] text-slate-600">Capture an examination first and it will appear here.</p>
        </div>
      </div>
    );
  }

  const view = assessment || (storedResult ? { verdict: exam.verdict, quality_score: exam.quality_score || 0, criteria: [], findings: [], summary: exam.ai_summary, recommendation: exam.recommendation } : null);
  const annotations = (view?.findings || [])
    .slice(0, 3)
    .map((f) => ({ ...(BOX_BY_TYPE[f.type] || BOX_BY_TYPE.positioning), severity: f.severity, label: f.type === 'cutoff' ? 'cut-off' : f.type }));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">After the exposure</p>
          <h1 className="mt-2.5 font-heading text-[24px] font-medium tracking-[-0.02em] text-white sm:text-[28px]">Image evaluation</h1>
          <p className="mt-1.5 text-[12.5px] text-slate-400">Anatomical criteria, cut-off, artefact and exposure — checked before the patient leaves.</p>
        </div>
        <Select value={selectedId} onValueChange={pick}>
          <SelectTrigger className="h-10 w-full border-white/10 bg-white/[0.03] sm:w-[290px]">
            <SelectValue placeholder="Select an examination" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.patient_name} — {e.protocol_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="grid gap-3.5 lg:grid-cols-12">
        <div className="space-y-3.5 lg:col-span-7">
          <RadiographStage annotations={assessment ? annotations : []} scanning={busy} showIdle={!view && !busy} />

          <div className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Acquisition record</p>
                <h2 className="mt-1.5 font-heading text-[14px] font-medium text-white">{exam.patient_name}</h2>
                <p className="mt-1 text-[11.5px] text-slate-500">
                  {exam.protocol_name} · {exam.age} y · {exam.weight_kg} kg · {formatDateTime(exam.exam_date)}
                </p>
              </div>
              <StatusPill status={verdictOf(exam.verdict).pill}>{verdictOf(exam.verdict).label}</StatusPill>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Mini label="kVp" value={exam.kvp || '—'} />
              <Mini label="mAs" value={exam.mas || '—'} />
              <Mini label="Rotation" value={`${exam.rotation_deg ?? 0}°`} />
              <Mini label="Centring" value={`${exam.centring_offset_mm ?? 0} mm`} />
            </div>
          </div>
        </div>

        <div className="space-y-3.5 lg:col-span-5">
          {!assessment && !storedResult && (
            <section className="panel p-6 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
                <ScanLine className="h-5 w-5 text-slate-600" strokeWidth={1.5} />
              </div>
              <h2 className="mt-4 font-heading text-[14px] font-medium text-white">Ready to read this image</h2>
              <p className="mx-auto mt-1.5 max-w-[260px] text-[12px] leading-relaxed text-slate-500">
                RAYID checks the anatomy against the protocol's acceptance criteria and flags anything that would force a repeat.
              </p>
              <button
                type="button"
                onClick={evaluate}
                disabled={busy}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-[13px] font-semibold text-[#04121A] transition-all hover:bg-cyan-200 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {busy ? 'Evaluating image…' : 'Run RAYID evaluation'}
              </button>
              {error && <p className="mt-2 text-[11.5px] text-rose-300">{error}</p>}
            </section>
          )}

          {view && (
            <section className="panel animate-rayid-rise overflow-hidden">
              <div className={`flex items-center justify-between border-b px-5 py-4 ${verdictOf(view.verdict).ring}`}>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">Verdict</p>
                  <p className={`mt-1 font-heading text-[16px] font-medium ${verdictOf(view.verdict).tone}`}>{verdictOf(view.verdict).label}</p>
                </div>
                <ScoreRing score={view.quality_score} />
              </div>

              <div className="px-5 py-4">
                {view.criteria?.length > 0 && (
                  <>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Anatomical criteria</p>
                    <ul className="mt-2.5 space-y-1.5">
                      {view.criteria.map((c, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="mt-[1px] grid h-4 w-4 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03]">
                            {CRITERIA_ICON[c.status] || CRITERIA_ICON.partial}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[12px] leading-snug text-slate-200">{c.name}</span>
                            <span className="block text-[10.5px] leading-snug text-slate-500">{c.note}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {view.findings?.length > 0 && (
                  <>
                    <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Detected issues</p>
                    <ul className="mt-2.5 space-y-1.5">
                      {view.findings.map((f, i) => (
                        <li key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11.5px] text-slate-200">{f.label}</span>
                            <span
                              className={`font-mono text-[9px] uppercase tracking-[0.12em] ${
                                f.severity === 'high' ? 'text-rose-300' : f.severity === 'medium' ? 'text-amber-300' : 'text-sky-300'
                              }`}
                            >
                              {f.severity}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10.5px] leading-snug text-slate-500">{f.note}</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {!view.findings?.length && view.criteria?.length > 0 && (
                  <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-[11.5px] text-emerald-200">
                    No cut-off or artefact detected. This image meets the protocol criteria.
                  </p>
                )}

                {view.summary && (
                  <div className="mt-4 border-l-2 border-cyan-400/40 pl-3">
                    <p className="text-[12px] leading-relaxed text-slate-300">{view.summary}</p>
                    {view.recommendation && <p className="mt-1.5 text-[11px] leading-snug text-cyan-200/80">{view.recommendation}</p>}
                  </div>
                )}

                {assessment ? (
                  <>
                    <button
                      type="button"
                      onClick={save}
                      disabled={saving}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-[13px] font-semibold text-[#04121A] transition-all hover:bg-cyan-200 disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save verdict to record
                    </button>
                    <button
                      type="button"
                      onClick={evaluate}
                      disabled={busy}
                      className="mt-2 w-full rounded-xl border border-white/10 px-4 py-2 text-[11.5px] text-slate-400 transition-colors hover:border-white/25 hover:text-slate-200"
                    >
                      Re-evaluate
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={evaluate}
                    disabled={busy}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-[11.5px] text-slate-400 transition-colors hover:border-white/25 hover:text-slate-200 disabled:opacity-60"
                  >
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Run a fresh evaluation
                  </button>
                )}

                {saved && <p className="mt-2 text-center text-[11px] text-emerald-300">Verdict saved to the examination record.</p>}
                {error && <p className="mt-2 text-center text-[11.5px] text-rose-300">{error}</p>}
                <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">concept prototype · simulated image analysis</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="num mt-1 text-[14px] leading-none text-slate-200">{value}</div>
    </div>
  );
}