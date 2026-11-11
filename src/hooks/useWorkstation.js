import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { projectionByKey, projectionFor } from '@/lib/protocols';

const techniqueOf = (plan, projection) => ({
  kvp: plan?.kvp ?? projection?.default_kvp,
  mas: plan?.mas ?? projection?.default_mas,
  sid_cm: plan?.sid_cm ?? projection?.default_sid_cm,
});

export default function useWorkstation() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [stage, setStage] = useState('pre');
  const [rayidOn, setRayidOn] = useState(true);
  const [plan, setPlan] = useState(null);
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [centring, setCentring] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [variant, setVariant] = useState('accepted');
  const [evaluating, setEvaluating] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const plans = useRef({});

  const load = useCallback(async () => {
    const list = await base44.entities.Exam.list('-exam_date', 40);
    setExams(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const projection = useMemo(() => projectionFor(exam?.protocol_name), [exam?.protocol_name]);
  const tolerances = projection.tolerances;
  const withinTolerance =
    Math.abs(rotation) <= tolerances.rotation && Math.abs(centring) <= tolerances.centring;

  const buildPlan = useCallback(async (record, target) => {
    if (!record) return;
    const key = `${record.id}:${target.key}`;
    if (plans.current[key]) {
      setPlan(plans.current[key]);
      return;
    }
    setPlanning(true);
    setPlanError(null);
    setPlan(null);
    try {
      const response = await base44.functions.invoke('rayidAnalyze', {
        mode: 'pre_exam',
        protocol: target,
        patient: { age: record.age, sex: record.sex, weight_kg: record.weight_kg },
      });
      const next = (response?.data ?? response)?.plan;
      if (next) {
        plans.current[key] = next;
        setPlan(next);
      }
    } catch (error) {
      setPlanError('RAYID could not analyse this examination. Standard technique is shown.');
    } finally {
      setPlanning(false);
    }
  }, []);

  useEffect(() => {
    if (exam) buildPlan(exam, projection);
  }, [exam, projection, buildPlan]);

  const openExam = useCallback((record) => {
    setExam(record);
    setStage('pre');
    setAssessment(null);
    setVariant('accepted');
    setRotation(0);
    setCentring(0);
    setPlanError(null);
    setPlan(null);
  }, []);

  const closeExam = useCallback(() => {
    setExam(null);
    setStage('pre');
    setAssessment(null);
    setVariant('accepted');
    setPlan(null);
    setRotation(0);
    setCentring(0);
  }, []);

  const chooseProjection = useCallback(
    async (key) => {
      if (!exam) return;
      const next = projectionByKey(key);
      setExam({
        ...exam,
        protocol_name: next.label,
        body_part: next.region,
        laterality: next.laterality,
      });
      setStage('pre');
      setAssessment(null);
      setVariant('accepted');
      setPlan(null);
      setRotation(0);
      setCentring(0);
      await base44.entities.Exam.update(exam.id, {
        protocol_name: next.label,
        body_part: next.region,
        laterality: next.laterality,
      });
    },
    [exam]
  );

  const acquire = useCallback(async () => {
    if (!exam) return;
    const technique = techniqueOf(plan, projection);
    const sampleVariant = withinTolerance ? 'accepted' : 'rejected';
    setCapturing(true);
    try {
      await base44.entities.Exam.update(exam.id, {
        status: 'completed',
        exam_date: new Date().toISOString(),
        protocol_name: projection.label,
        body_part: projection.region,
        ...technique,
        rotation_deg: rotation,
        centring_offset_mm: centring,
      });

      const acquired = {
        ...exam,
        protocol_name: projection.label,
        ...technique,
        status: 'completed',
        rotation_deg: rotation,
        centring_offset_mm: centring,
      };
      setExam(acquired);
      setVariant(sampleVariant);
      setStage('review');
      setEvaluating(true);

      const response = await base44.functions.invoke('rayidAnalyze', {
        mode: 'post_exam',
        exam: acquired,
        criteria: projection.criteria,
        tolerances: projection.tolerances,
        sample: {
          variant: sampleVariant,
          defect: sampleVariant === 'rejected' ? projection.defect : null,
        },
      });
      const result = (response?.data ?? response)?.assessment;
      setAssessment(result || null);

      if (result) {
        await base44.entities.Exam.update(exam.id, {
          verdict: result.verdict,
          quality_score: result.quality_score,
          findings: (result.findings || []).map((finding) => `${finding.label} — ${finding.note}`),
          ai_summary: result.summary,
          recommendation: result.recommendation,
          rejection_reason: result.verdict === 'accepted' ? '' : result.recommendation,
        });
      }
      await load();
    } catch (error) {
      setPlanError('The capture could not be saved. Try acquiring the image again.');
    } finally {
      setEvaluating(false);
      setCapturing(false);
    }
  }, [exam, plan, projection, rotation, centring, withinTolerance, load]);

  const repeat = useCallback(async () => {
    if (!exam) return;
    setStage('positioning');
    setAssessment(null);
    setVariant('accepted');
    setRotation(0);
    setCentring(0);
    setExam({ ...exam, status: 'in_progress', verdict: 'pending' });
    await base44.entities.Exam.update(exam.id, { status: 'in_progress', verdict: 'pending' });
    await load();
  }, [exam, load]);

  const override = useCallback(async () => {
    if (!exam || !assessment) return;
    await base44.entities.Exam.update(exam.id, {
      verdict: 'accepted',
      rejection_reason: '',
      recommendation: `${assessment.recommendation} Accepted on override by the technologist.`,
    });
    await load();
    closeExam();
  }, [exam, assessment, load, closeExam]);

  return {
    exams,
    loading,
    exam,
    projection,
    stage,
    rayidOn,
    toggleRayid: () => setRayidOn((value) => !value),
    plan,
    planning,
    planError,
    rotation,
    centring,
    tolerances,
    withinTolerance,
    assessment,
    variant,
    evaluating,
    capturing,
    setStage,
    setRotation,
    setCentring,
    openExam,
    closeExam,
    chooseProjection,
    acquire,
    repeat,
    override,
  };
}