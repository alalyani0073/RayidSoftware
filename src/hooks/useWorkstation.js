import { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { projectionByKey, projectionFor } from '@/lib/protocols';
import useModalityWorklist from '@/hooks/useModalityWorklist';
import { baselineTechnique, exposureTime, initialPosition, recommendedTechnique, positioningIssues, exposureIssues, sampleFor, scriptedAssessment } from '@/components/workstation/simulation';

export default function useWorkstation({ rayidOn }) {
  const worklist = useModalityWorklist();
  const [exam, setExam] = useState(null);
  const [stage, setStage] = useState('pre');
  const [technique, setTechnique] = useState(() => baselineTechnique(projectionFor()));
  const [position, setPosition] = useState(() => initialPosition(projectionFor()));
  const [scenario, setScenario] = useState('auto');
  const [confirmed, setConfirmed] = useState(false);
  const [capture, setCapture] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [centering, setCentering] = useState(false);
  const [centerResult, setCenterResult] = useState(null);
  const [alert, setAlert] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [recommendationStatus, setRecommendationStatus] = useState('available');
  const [completion, setCompletion] = useState('');
  const aiRun = useRef(0);
  const active = useRef(rayidOn);
  active.current = rayidOn;
  const projection = useMemo(() => projectionFor(exam?.protocol_name), [exam?.protocol_name]);
  const plan = useMemo(() => rayidOn && exam ? recommendedTechnique(exam, projection) : null, [rayidOn, exam, projection]);
  const positionErrors = rayidOn ? positioningIssues(position, projection) : [];

  useEffect(() => {
    if (!rayidOn) {
      aiRun.current++;
      setCentering(false); setCenterResult(null); setAlert(null); setAssessment(null); setEvaluating(false);
      setRecommendationStatus('available');
    } else if (stage === 'positioning' && !capture) {
      setConfirmed(false);
    }
  }, [rayidOn]);

  useEffect(() => {
    if (!rayidOn || !capture) return;
    setEvaluating(true);
    const timer = setTimeout(() => {
      if (!active.current) return;
      const result = scriptedAssessment(capture, projection);
      setAssessment(result); setEvaluating(false);
      if (!result.accepted) setAlert({ kind: 'quality', result });
    }, 750);
    return () => clearTimeout(timer);
  }, [rayidOn, capture, projection]);

  function closeExam() {
    aiRun.current++; setExam(null); setStage('pre'); setCapture(null); setAssessment(null);
    setAlert(null); setCenterResult(null); setCentering(false); setEvaluating(false); setConfirmed(false); setError('');
  }
  function openExam(record) {
    aiRun.current++;
    const p = projectionFor(record.protocol_name);
    const saved = record.simulation_snapshot?.position ? record.simulation_snapshot : null;
    const values = saved?.technique || baselineTechnique(p);
    setExam(record); setTechnique(values); setPosition(saved?.position || initialPosition(p));
    setCapture(saved ? { ...saved, patient: record } : null); setStage(saved ? 'review' : 'pre');
    setConfirmed(Boolean(saved)); setAssessment(null); setScenario('auto'); setAlert(null); setError('');
    setCenterResult(null); setCentering(false); setRecommendationStatus('available'); setCompletion('');
  }
  function chooseProjection(key) {
    if (busy || !exam || stage === 'review') return;
    const next = projectionByKey(key);
    aiRun.current++;
    const side = next.laterality === 'not_applicable' ? 'not_applicable' : (projection.region === next.region && ['left', 'right'].includes(exam.laterality) ? exam.laterality : next.laterality);
    setExam({ ...exam, protocol_name: next.label, body_part: next.region, laterality: side });
    setTechnique(baselineTechnique(next)); setPosition(initialPosition(next)); setStage('pre');
    setConfirmed(false); setCapture(null); setAssessment(null); setCenterResult(null); setCentering(false);
    setAlert(null); setScenario('auto'); setRecommendationStatus('available');
  }
  function changeTechnique(key, value) {
    setTechnique(current => ({ ...current, [key]: value }));
    setRecommendationStatus('modified');
  }
  function applyRecommendations() {
    if (!active.current || !plan) return;
    setTechnique({ kvp: plan.kvp, ma: plan.ma, mas: plan.mas, sid_cm: plan.sid_cm, aec_mode: plan.aec_mode });
    setRecommendationStatus('applied');
  }
  function changePosition(key, value) {
    setPosition(current => ({ ...current, [key]: value })); setConfirmed(false); setCenterResult(null);
  }
  function introduceError() {
    setPosition(current => ({ ...current, x: 25, y: -18, rotation: 7, angle: projection.angle + 5, limb: false }));
    setConfirmed(false); setCenterResult(null);
  }
  async function autoCenter() {
    if (!active.current || centering || busy) return;
    const version = ++aiRun.current;
    setCentering(true); setCenterResult(null); setConfirmed(false);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (!active.current || version !== aiRun.current) return;
    setCentering(false);
    if (!position.visible) {
      setAlert({ kind: 'auto', lines: ['The anatomical landmark is obscured. No centering adjustment can be proposed.', 'Expose the landmark, verify the selected projection, then retry AUTO-CENTERING.'] });
      return;
    }
    setCenterResult({ dx: -position.x, dy: -position.y, angle: projection.angle, applied: false });
  }
  function applyCentering() {
    if (!active.current || !centerResult) return;
    const next = { ...position, x: 0, y: 0, angle: centerResult.angle };
    setPosition(next); setCenterResult({ ...centerResult, applied: true }); setConfirmed(false);
    const remaining = positioningIssues(next, projection);
    if (remaining.length) setAlert({ kind: 'auto', lines: ['Beam centering was updated. Patient positioning still requires correction.', ...remaining] });
  }
  function confirmPosition() {
    if (!active.current || !positionErrors.length) { setConfirmed(true); return; }
    setAlert({ kind: 'position', lines: positionErrors });
  }
  function prepare() {
    const issues = active.current ? exposureIssues(technique, plan) : [];
    if (issues.length) setAlert({ kind: 'exposure', lines: issues, next: 'prepare' });
    else setStage('positioning');
  }
  function requestExposure() {
    if (!confirmed || busy) return;
    const issues = active.current ? exposureIssues(technique, plan) : [];
    if (issues.length) setAlert({ kind: 'exposure', lines: issues, next: 'expose' });
    else acquire();
  }
  async function acquire() {
    if (!exam || busy) return;
    setBusy(true); setError(''); setAlert(null);
    const nextCapture = { patient: exam, position: { ...position }, technique: { ...technique }, scenario, sample: sampleFor(position, scenario, projection) };
    const { patient, ...snapshot } = nextCapture;
    const update = { protocol_name: projection.label, body_part: projection.region, laterality: exam.laterality, status: 'in_progress', exam_date: new Date().toISOString(),
      ...technique, exposure_time_ms: exposureTime(technique), rotation_deg: position.rotation, centring_offset_mm: position.x, tube_angle_deg: position.angle, simulation_snapshot: snapshot };
    try {
      const saved = await base44.entities.Exam.update(exam.id, update);
      setExam({ ...exam, ...saved, ...update }); setCapture(nextCapture); setAssessment(null); setStage('review');
      await worklist.reload();
    } catch (e) { setError('The simulated acquisition could not be saved. Please try again.'); }
    finally { setBusy(false); }
  }
  function repeat() {
    setStage('positioning'); setCapture(null); setAssessment(null); setAlert(null); setConfirmed(false);
    setCenterResult(null); setScenario('auto'); setError('');
  }
  function requestAccept() {
    if (busy || (active.current && evaluating) || !capture) return;
    if (active.current && assessment && !assessment.accepted) setAlert({ kind: 'override', result: assessment });
    else finish(false);
  }
  async function finish(override) {
    if (!exam || busy) return;
    setBusy(true); setError('');
    const result = active.current ? assessment : null;
    const update = { status: 'completed', verdict: 'accepted', ...(result ? { quality_score: result.quality_score, findings: result.findings.map(f => `${f.label}: ${f.note}`), ai_summary: result.summary,
      recommendation: `${result.recommendation}${override ? ' Explicitly accepted by radiographer despite simulated quality warning.' : ''}`, rejection_reason: override ? result.findings.filter(f => !f.pass).map(f => f.label).join('; ') : '' } : {}) };
    try {
      await base44.entities.Exam.update(exam.id, update);
      setCompletion(`${exam.patient_name} · ${projection.label} accepted and saved to the examination archive. No PACS transfer performed.`);
      closeExam(); await worklist.reload();
    } catch (e) { setError('The examination could not be finalized. Please try again.'); }
    finally { setBusy(false); }
  }
  function continueWarning() {
    const kind = alert?.kind; const next = alert?.next; setAlert(null);
    if (kind === 'position') setConfirmed(true);
    if (kind === 'exposure') { if (next === 'prepare') setStage('positioning'); else acquire(); }
    if (kind === 'override') finish(true);
    if (kind === 'quality') setAlert({ kind: 'override', result: assessment });
  }
  return { worklist, exam, projection, stage, rayidOn, technique, plan, position, positionErrors, confirmed, scenario, setScenario,
    capture, assessment, evaluating, centering, centerResult, alert, setAlert, busy, error, recommendationStatus, setRecommendationStatus, completion,
    openExam, closeExam, chooseProjection, changeTechnique, applyRecommendations, changePosition, introduceError, autoCenter, applyCentering,
    confirmPosition, prepare, requestExposure, repeat, requestAccept, continueWarning };
}