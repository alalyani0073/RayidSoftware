import { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { projectionByKey, projectionFor } from '@/lib/protocols';
import useModalityWorklist from '@/hooks/useModalityWorklist';
import { caseFor, casePosition } from '@/components/workstation/simCases';
import { baselineTechnique, exposureTime, initialPosition, recommendedTechnique, positioningIssues, exposureIssues, collimationIssues, centeringOffset, fieldSizeCm, sampleFor, scriptedAssessment, collimation, borderCm, setBorderCm, requiredEdges, EDGES, alignmentSignature, movementLines } from '@/components/workstation/simulation';

export default function useWorkstation({ rayidOn }) {
  const worklist = useModalityWorklist();
  const [exam, setExam] = useState(null);
  const [stage, setStage] = useState('pre');
  const [simCase, setSimCase] = useState(() => caseFor(null));
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
  const [simOpen, setSimOpen] = useState(false);
  const [adjusted, setAdjusted] = useState(false);
  const warned = useRef('');
  const checkedPosition = useRef(null);
  const movementWarned = useRef('');
  const aiRun = useRef(0);
  const active = useRef(rayidOn);
  active.current = rayidOn;
  const projection = useMemo(() => projectionFor(exam?.protocol_name), [exam?.protocol_name]);
  const plan = useMemo(() => rayidOn && exam ? recommendedTechnique(exam, projection) : null, [rayidOn, exam, projection]);
  const positionErrors = rayidOn ? positioningIssues(position, projection) : [];
  const collimationErrors = rayidOn ? collimationIssues(position, projection) : [];
  const collimationCm = fieldSizeCm(position, projection);
  const collimationBorders = useMemo(() => EDGES.reduce((acc, edge) => ({ ...acc, [edge]: borderCm(position, projection, edge) }), {}), [position, projection]);

  // The alignment the radiographer last verified, so a later change of the
  // patient's position is reported as movement rather than a fresh setup.
  function rememberAlignment(next) {
    checkedPosition.current = { rotation: next.rotation, angle: next.angle, flexion: next.flexion ?? 0, limb: next.limb, visible: next.visible, coverage: next.coverage, breathing: next.breathing };
    movementWarned.current = '';
  }

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

  // RAYID watches operator changes to centering and collimation and raises a warning
  // only when the operator's own adjustment settles outside the required field, so
  // the recommended default setup never produces a warning on load.
  useEffect(() => {
    if (!rayidOn || stage !== 'positioning' || capture) return;
    const target = collimationErrors.length ? 'collimation' : centeringOffset(position, projection) ? 'centering' : '';
    if (!target) {
      warned.current = '';
      setAlert(current => (current && (current.kind === 'collimation' || current.kind === 'centering') ? null : current));
      return;
    }
    if (!adjusted || alert) return;
    const edges = collimation(position, projection);
    const signature = `${target}:${position.x}:${position.y}:${edges.l}:${edges.r}:${edges.t}:${edges.b}`;
    if (warned.current === signature) return;
    const timer = setTimeout(() => {
      if (!active.current) return;
      warned.current = signature;
      if (target === 'collimation') setAlert({ kind: 'collimation', lines: collimationIssues(position, projection), next: 'confirm' });
      else setAlert({ kind: 'centering', next: 'confirm', lines: centeringLines() });
    }, 1400);
    return () => clearTimeout(timer);
  }, [rayidOn, stage, capture, alert, adjusted, collimationErrors.length, position, projection]);

  // Patient movement: any change of the patient's alignment after the position was
  // last checked is reported, so it is reassessed before the exposure.
  useEffect(() => {
    if (!rayidOn || stage !== 'positioning' || capture || alert) return;
    if (!checkedPosition.current) { rememberAlignment(position); return; }
    const signature = alignmentSignature(position);
    if (signature === alignmentSignature(checkedPosition.current) || movementWarned.current === signature) return;
    const timer = setTimeout(() => {
      if (!active.current) return;
      movementWarned.current = signature;
      setAlert({ kind: 'movement', lines: movementLines(position, checkedPosition.current, projection) });
    }, 1200);
    return () => clearTimeout(timer);
  }, [rayidOn, stage, capture, alert, position, projection]);

  function closeExam() {
    aiRun.current++; warned.current = ''; checkedPosition.current = null; movementWarned.current = ''; setAdjusted(false);
    setExam(null); setStage('pre'); setCapture(null); setAssessment(null);
    setAlert(null); setCenterResult(null); setCentering(false); setEvaluating(false); setConfirmed(false); setError(''); setSimOpen(false);
  }
  function openExam(record) {
    aiRun.current++; warned.current = '';
    const p = projectionFor(record.protocol_name);
    const assigned = caseFor(record);
    const saved = record.simulation_snapshot?.position ? record.simulation_snapshot : null;
    const values = saved?.technique || baselineTechnique(p);
    setExam(record); setSimCase(assigned); setTechnique(values);
    const startingPosition = saved?.position ? { ...initialPosition(p), ...saved.position } : casePosition(p, assigned.fault);
    setPosition(startingPosition); rememberAlignment(startingPosition); setAdjusted(false);
    setScenario(assigned.scenario);
    setCapture(saved ? { ...saved, patient: record, caseScore: assigned.score, caseFault: assigned.fault, caseLabel: assigned.label } : null);
    setStage(saved ? 'review' : 'pre');
    setConfirmed(Boolean(saved)); setAssessment(null); setAlert(null); setError('');
    setCenterResult(null); setCentering(false); setRecommendationStatus('available'); setCompletion(''); setSimOpen(false);
  }
  function chooseProjection(key) {
    if (busy || !exam || stage === 'review') return;
    const next = projectionByKey(key);
    aiRun.current++;
    const side = next.laterality === 'not_applicable' ? 'not_applicable' : (projection.region === next.region && ['left', 'right'].includes(exam.laterality) ? exam.laterality : next.laterality);
    warned.current = '';
    setExam({ ...exam, protocol_name: next.label, body_part: next.region, laterality: side });
    const nextPosition = casePosition(next, simCase.fault);
    setTechnique(baselineTechnique(next)); setPosition(nextPosition); rememberAlignment(nextPosition); setAdjusted(false); setStage('pre');
    setConfirmed(false); setCapture(null); setAssessment(null); setCenterResult(null); setCentering(false);
    setAlert(null); setScenario(simCase.scenario); setRecommendationStatus('available');
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
  function changeCollimation(edge, percent) {
    setPosition(current => ({ ...current, collimation: { ...collimation(current, projection), [edge]: percent } }));
    setAdjusted(true); setConfirmed(false);
  }
  // Pointer drag on the camera view stores the chosen central ray position as
  // beam offsets in millimetres around the projection's recommended landmark.
  function moveCentring(percentX, percentY) {
    const toMm = (percent, axis) => Math.round((percent - projection.focus[axis] * 100) / 0.22);
    const x = toMm(percentX, 'x');
    const y = toMm(percentY, 'y');
    setPosition(current => {
      // The collimated field travels with the central ray, so the shutter
      // rectangle keeps its size and balance around the new centering point.
      const edges = collimation(current, projection);
      const dx = (x - current.x) * 0.22;
      const dy = (y - current.y) * 0.22;
      const shift = (value, delta) => Math.round(Math.min(98, Math.max(2, value + delta)) * 10) / 10;
      return { ...current, x, y, collimation: { l: shift(edges.l, dx), r: shift(edges.r, dx), t: shift(edges.t, dy), b: shift(edges.b, dy) } };
    });
    setAdjusted(true); setConfirmed(false); setCenterResult(null);
  }
  function setCollimationBorder(edge, cm) {
    setPosition(current => ({ ...current, collimation: setBorderCm(current, projection, edge, cm) }));
    setAdjusted(true); setConfirmed(false); setCenterResult(null);
  }
  function matchCollimation() {
    if (!active.current) return;
    setPosition(current => ({ ...current, collimation: { ...requiredEdges(projection) } }));
    setAdjusted(true); setConfirmed(false); setCenterResult(null);
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
    setPosition(next); rememberAlignment(next); setCenterResult({ ...centerResult, applied: true }); setConfirmed(false);
    const remaining = positioningIssues(next, projection);
    if (remaining.length) setAlert({ kind: 'auto', lines: ['Beam centering was updated. Patient positioning still requires correction.', ...remaining] });
  }
  function acknowledgeMovement() {
    setAlert(null); rememberAlignment(position); setConfirmed(false); setSimOpen(true);
  }
  function centeringLines() {
    return [
      `The manually placed centering point does not match the recommended anatomical landmark for ${projection.label}.`,
      `Recommended landmark: ${projection.centring}.`,
      `Move the central ray ${Math.abs(position.x)} mm ${position.x > 0 ? 'left' : 'right'} and ${Math.abs(position.y)} mm ${position.y > 0 ? 'superiorly' : 'inferiorly'} to return to the landmark; tolerance is ±${projection.tolerances.centring} mm.`,
    ];
  }
  function centeringWarning() {
    setAlert({ kind: 'centering', next: 'confirm', lines: centeringLines() });
  }
  function confirmPosition() {
    if (!active.current) { setConfirmed(true); return; }
    if (collimationErrors.length) { setAlert({ kind: 'collimation', lines: collimationErrors, next: 'confirm' }); return; }
    if (centeringOffset(position, projection)) { centeringWarning(); return; }
    if (!positionErrors.length) { rememberAlignment(position); setConfirmed(true); return; }
    setAlert({ kind: 'position', lines: positionErrors });
  }
  function correctCentering() {
    const next = { ...position, x: 0, y: 0 };
    setPosition(next); rememberAlignment(next); setCenterResult({ dx: 0, dy: 0, angle: projection.angle, applied: true }); setAlert(null);
    const remaining = positioningIssues(next, projection);
    if (remaining.length) setAlert({ kind: 'position', lines: remaining });
    else setConfirmed(true);
  }
  function correctCollimation() {
    const next = { ...position, collimation: { ...requiredEdges(projection) } };
    setPosition(next); rememberAlignment(next); setAlert(null);
    if (centeringOffset(next, projection)) centeringWarning();
    else setConfirmed(true);
  }
  function prepare() {
    const issues = active.current ? exposureIssues(technique, plan) : [];
    if (issues.length) setAlert({ kind: 'exposure', lines: issues, next: 'prepare' });
    else setStage('positioning');
  }
  function requestExposure() {
    if (!confirmed || busy) return;
    const field = active.current ? collimationIssues(position, projection) : [];
    if (field.length) { setAlert({ kind: 'collimation', lines: field, next: 'expose' }); return; }
    if (active.current && centeringOffset(position, projection)) { setAlert({ kind: 'centering', next: 'expose', lines: [`The selected centering point does not match the recommended anatomical landmark for ${projection.label}.`, `Recommended centering: ${projection.centring}.`] }); return; }
    const issues = active.current ? exposureIssues(technique, plan) : [];
    if (issues.length) setAlert({ kind: 'exposure', lines: issues, next: 'expose' });
    else acquire();
  }
  async function acquire() {
    if (!exam || busy) return;
    setBusy(true); setError(''); setAlert(null);
    const nextCapture = { patient: exam, position: { ...position }, technique: { ...technique }, scenario, sample: sampleFor(position, scenario, projection),
      caseScore: simCase.score, caseFault: simCase.fault, caseLabel: simCase.label };
    const { patient, ...snapshot } = nextCapture;
    const update = { protocol_name: projection.label, body_part: projection.region, laterality: exam.laterality, status: 'in_progress', exam_date: new Date().toISOString(),
      ...technique, exposure_time_ms: exposureTime(technique), rotation_deg: position.rotation, centring_offset_mm: position.x, tube_angle_deg: position.angle, simulation_snapshot: snapshot };
    try {
      const saved = await base44.entities.Exam.update(exam.id, update);
      setExam({ ...exam, ...saved, ...update }); setCapture(nextCapture); setAssessment(null); setStage('review');
      await worklist.reload();
    } catch (e) { setError('The acquisition could not be saved. Please try again.'); }
    finally { setBusy(false); }
  }
  function repeat() {
    setStage('positioning'); setCapture(null); setAssessment(null); setAlert(null); setConfirmed(false);
    setCenterResult(null); setScenario(simCase.scenario); setError('');
    warned.current = ''; checkedPosition.current = null; movementWarned.current = ''; setAdjusted(false);
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
    const update = { status: 'completed', verdict: override ? 'review' : 'accepted', pacs_status: 'transferred',
      ...(result ? { quality_score: result.quality_score, findings: result.findings.map(f => `${f.label}: ${f.note}`), ai_summary: result.summary,
        recommendation: `${result.recommendation}${override ? ' Explicitly accepted by radiographer despite quality findings.' : ''}`, rejection_reason: override ? result.findings.filter(f => !f.pass).map(f => f.label).join('; ') : '' } : {}) };
    try {
      await base44.entities.Exam.update(exam.id, update);
      setCompletion(`${exam.patient_name} · ${projection.label} saved to the examination archive · PACS transfer completed.`);
      closeExam(); await worklist.reload();
    } catch (e) { setError('The examination could not be finalized. Please try again.'); }
    finally { setBusy(false); }
  }
  function continueWarning() {
    const kind = alert?.kind; const next = alert?.next; setAlert(null);
    if (kind === 'position') setConfirmed(true);
    if (kind === 'movement') { rememberAlignment(position); setConfirmed(false); }
    if (kind === 'centering') {
      if (next === 'expose') {
        const issues = active.current ? exposureIssues(technique, plan) : [];
        if (issues.length) setAlert({ kind: 'exposure', lines: issues, next: 'expose' });
        else acquire();
      } else setConfirmed(true);
    }
    if (kind === 'collimation') {
      if (next === 'confirm') setConfirmed(true);
      else {
        const issues = active.current ? exposureIssues(technique, plan) : [];
        if (issues.length) setAlert({ kind: 'exposure', lines: issues, next: 'expose' });
        else acquire();
      }
    }
    if (kind === 'exposure') { if (next === 'prepare') setStage('positioning'); else acquire(); }
    if (kind === 'override') finish(true);
    if (kind === 'quality') setAlert({ kind: 'override', result: assessment });
  }
  return { worklist, exam, projection, simCase, stage, rayidOn, technique, plan, position, positionErrors, collimationErrors, collimationCm, collimationBorders, changeCollimation, setCollimationBorder, matchCollimation, confirmed, scenario, setScenario, simOpen, setSimOpen,
    capture, assessment, evaluating, centering, centerResult, alert, setAlert, busy, error, recommendationStatus, setRecommendationStatus, completion,
    openExam, closeExam, chooseProjection, changeTechnique, applyRecommendations, changePosition, moveCentring, introduceError, autoCenter, applyCentering,
    adjusted, acknowledgeMovement, confirmPosition, correctCentering, correctCollimation, prepare, requestExposure, repeat, requestAccept, continueWarning };
}