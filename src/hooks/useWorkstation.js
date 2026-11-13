import { useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { projectionByKey, projectionFor } from '@/lib/protocols';
import useModalityWorklist from '@/hooks/useModalityWorklist';
import { caseFor, openingPosition } from '@/components/workstation/simCases';
import { baselineTechnique, exposureTime, initialPosition, recommendedTechnique, positioningIssues, exposureFindings, exposureSignature, collimationIssues, centeringOffset, fieldSizeCm, sampleFor, scriptedAssessment, collimation, borderCm, setBorderCm, requiredEdges, EDGES, alignmentSignature, movementLines } from '@/components/workstation/simulation';

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
  const exposureWarned = useRef('');
  const exposureEdited = useRef(false);
  // Settings the radiographer explicitly overrode, so an acknowledged warning is
  // not raised again for the same values while a new change still warns.
  const accepted = useRef({ collimation: '', centering: '', exposure: '' });
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

  // Current state of the field and the beam, used to tell an acknowledged
  // override from a new adjustment.
  function edgesSignature() {
    const edges = collimation(position, projection);
    return `${edges.l}:${edges.r}:${edges.t}:${edges.b}`;
  }
  function centeringSignature() {
    return `${position.x}:${position.y}`;
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

  // Centering and collimation are validated continuously against the required
  // field and landmark for the selected projection: a warning appears as soon as
  // the field leaves tolerance and clears the moment it is corrected. Because the
  // default setup equals the required field, an untouched study never warns.
  useEffect(() => {
    if (!rayidOn || stage !== 'positioning' || capture) return;
    const target = collimationErrors.length ? 'collimation' : centeringOffset(position, projection) ? 'centering' : '';
    if (!target) {
      warned.current = '';
      setAlert(current => (current && (current.kind === 'collimation' || current.kind === 'centering') ? null : current));
      return;
    }
    if (alert) return;
    const signature = `${target}:${edgesSignature()}:${centeringSignature()}`;
    const acceptedSignature = target === 'collimation' ? edgesSignature() : centeringSignature();
    if (warned.current === signature || accepted.current[target] === acceptedSignature) return;
    const timer = setTimeout(() => {
      if (!active.current) return;
      warned.current = signature;
      if (target === 'collimation') setAlert({ kind: 'collimation', lines: collimationIssues(position, projection), next: 'confirm', signature });
      else setAlert({ kind: 'centering', next: 'confirm', signature, lines: centeringLines() });
    }, 700);
    return () => clearTimeout(timer);
  }, [rayidOn, stage, capture, alert, collimationErrors.length, position, projection]);

  // Exposure parameters are validated on every manual change against the
  // recommended technique for this patient, examination and projection, in both
  // the preparation and positioning stages.
  useEffect(() => {
    if (!rayidOn || !plan || stage === 'review' || capture) return;
    const findings = exposureFindings(technique, plan, projection);
    if (!findings.length) {
      exposureWarned.current = '';
      setAlert(current => (current && current.kind === 'exposure' ? null : current));
      return;
    }
    const signature = exposureSignature(technique);
    if (!exposureEdited.current || alert || exposureWarned.current === signature || accepted.current.exposure === signature) return;
    const timer = setTimeout(() => {
      if (!active.current) return;
      exposureWarned.current = signature;
      setAlert({ kind: 'exposure', next: 'none', signature, lines: findings.map(finding => finding.message) });
    }, 600);
    return () => clearTimeout(timer);
  }, [rayidOn, plan, stage, capture, technique, projection, alert]);

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

  function resetWarnings() {
    warned.current = ''; exposureWarned.current = ''; exposureEdited.current = false;
    accepted.current = { collimation: '', centering: '', exposure: '' };
    checkedPosition.current = null; movementWarned.current = '';
  }
  function closeExam() {
    aiRun.current++; resetWarnings(); setAdjusted(false);
    setExam(null); setStage('pre'); setCapture(null); setAssessment(null);
    setAlert(null); setCenterResult(null); setCentering(false); setEvaluating(false); setConfirmed(false); setError(''); setSimOpen(false);
  }
  function openExam(record) {
    aiRun.current++; resetWarnings();
    const p = projectionFor(record.protocol_name);
    const assigned = caseFor(record);
    // Every study opens at the start of the examination workflow: no previously
    // acquired image, technique, positioning, score or review state is restored,
    // so a study can never reopen as an examination already performed.
    setExam(record); setSimCase(assigned); setTechnique(baselineTechnique(p));
    const startingPosition = openingPosition(p, assigned.fault);
    setPosition(startingPosition); rememberAlignment(startingPosition); setAdjusted(false);
    setScenario(assigned.scenario);
    setCapture(null);
    setStage('pre');
    setConfirmed(false); setAssessment(null); setAlert(null); setError('');
    setCenterResult(null); setCentering(false); setRecommendationStatus('available'); setCompletion(''); setSimOpen(false);
  }
  function chooseProjection(key) {
    if (busy || !exam || stage === 'review') return;
    const next = projectionByKey(key);
    aiRun.current++;
    const side = next.laterality === 'not_applicable' ? 'not_applicable' : (projection.region === next.region && ['left', 'right'].includes(exam.laterality) ? exam.laterality : next.laterality);
    resetWarnings();
    setExam({ ...exam, protocol_name: next.label, body_part: next.region, laterality: side });
    const nextPosition = openingPosition(next, simCase.fault);
    setTechnique(baselineTechnique(next)); setPosition(nextPosition); rememberAlignment(nextPosition); setAdjusted(false); setStage('pre');
    setConfirmed(false); setCapture(null); setAssessment(null); setCenterResult(null); setCentering(false);
    setAlert(null); setScenario(simCase.scenario); setRecommendationStatus('available');
  }
  function changeTechnique(key, value) {
    exposureEdited.current = true;
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
    setAlert({ kind: 'centering', next: 'confirm', signature: centeringSignature(), lines: centeringLines() });
  }
  function confirmPosition() {
    if (!active.current) { setConfirmed(true); return; }
    if (collimationErrors.length && accepted.current.collimation !== edgesSignature()) { setAlert({ kind: 'collimation', lines: collimationErrors, next: 'confirm', signature: edgesSignature() }); return; }
    if (centeringOffset(position, projection) && accepted.current.centering !== centeringSignature()) { centeringWarning(); return; }
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
    const findings = active.current && plan ? exposureFindings(technique, plan, projection) : [];
    if (findings.length && accepted.current.exposure !== exposureSignature(technique)) setAlert({ kind: 'exposure', lines: findings.map(finding => finding.message), next: 'prepare', signature: exposureSignature(technique) });
    else setStage('positioning');
  }
  function requestExposure() {
    if (!confirmed || busy) return;
    const field = active.current ? collimationIssues(position, projection) : [];
    if (field.length && accepted.current.collimation !== edgesSignature()) { setAlert({ kind: 'collimation', lines: field, next: 'expose', signature: edgesSignature() }); return; }
    if (active.current && centeringOffset(position, projection) && accepted.current.centering !== centeringSignature()) { setAlert({ kind: 'centering', next: 'expose', signature: centeringSignature(), lines: centeringLines() }); return; }
    const findings = active.current && plan ? exposureFindings(technique, plan, projection) : [];
    if (findings.length && accepted.current.exposure !== exposureSignature(technique)) setAlert({ kind: 'exposure', lines: findings.map(finding => finding.message), next: 'expose', signature: exposureSignature(technique) });
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
    resetWarnings(); setAdjusted(false);
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
  // CONTINUE ANYWAY moves to an explicit confirmation step; only a second,
  // recorded confirmation lets the flagged settings through.
  function requestOverride() {
    setAlert(current => (current ? { ...current, confirm: true } : current));
  }
  function cancelOverride() {
    setAlert(current => (current ? { ...current, confirm: false } : current));
  }
  function continueWarning() {
    const kind = alert?.kind; const next = alert?.next;
    if (kind === 'collimation') accepted.current.collimation = edgesSignature();
    if (kind === 'centering') accepted.current.centering = centeringSignature();
    if (kind === 'exposure') accepted.current.exposure = exposureSignature(technique);
    setAlert(null);
    if (kind === 'position') setConfirmed(true);
    if (kind === 'movement') { rememberAlignment(position); setConfirmed(false); }
    if (kind === 'centering') {
      if (next === 'expose') {
        const findings = active.current && plan ? exposureFindings(technique, plan, projection) : [];
        if (findings.length && accepted.current.exposure !== exposureSignature(technique)) setAlert({ kind: 'exposure', lines: findings.map(finding => finding.message), next: 'expose', signature: exposureSignature(technique) });
        else acquire();
      } else setConfirmed(true);
    }
    if (kind === 'collimation') {
      if (next === 'confirm') setConfirmed(true);
      else {
        const findings = active.current && plan ? exposureFindings(technique, plan, projection) : [];
        if (findings.length && accepted.current.exposure !== exposureSignature(technique)) setAlert({ kind: 'exposure', lines: findings.map(finding => finding.message), next: 'expose', signature: exposureSignature(technique) });
        else acquire();
      }
    }
    if (kind === 'exposure') {
      if (next === 'prepare') setStage('positioning');
      else if (next === 'expose') acquire();
    }
    if (kind === 'override') finish(true);
    if (kind === 'quality') setAlert({ kind: 'override', result: assessment });
  }
  return { worklist, exam, projection, simCase, stage, rayidOn, technique, plan, position, positionErrors, collimationErrors, collimationCm, collimationBorders, changeCollimation, setCollimationBorder, matchCollimation, confirmed, scenario, setScenario, simOpen, setSimOpen,
    capture, assessment, evaluating, centering, centerResult, alert, setAlert, busy, error, recommendationStatus, setRecommendationStatus, completion,
    openExam, closeExam, chooseProjection, changeTechnique, applyRecommendations, changePosition, moveCentring, introduceError, autoCenter, applyCentering,
    adjusted, acknowledgeMovement, confirmPosition, correctCentering, correctCollimation, prepare, requestExposure, repeat, requestAccept, continueWarning, requestOverride, cancelOverride };
}