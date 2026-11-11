import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

const techniqueOf = (plan, protocol) => ({
  kvp: plan?.kvp ?? protocol?.default_kvp,
  mas: plan?.mas ?? protocol?.default_mas,
  sid_cm: plan?.sid_cm ?? protocol?.default_sid_cm,
});

export default function useWorkstation() {
  const [exams, setExams] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [stage, setStage] = useState('pre');
  const [plan, setPlan] = useState(null);
  const [planning, setPlanning] = useState(false);
  const [planError, setPlanError] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [centring, setCentring] = useState(0);
  const [assessment, setAssessment] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const plans = useRef({});

  const load = useCallback(async () => {
    const [list, protocolList] = await Promise.all([
      base44.entities.Exam.list('-exam_date', 30),
      base44.entities.Protocol.list('name', 30),
    ]);
    setExams(list);
    setProtocols(protocolList);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const protocol = useMemo(() => {
    if (!exam) return null;
    const [name, view] = String(exam.protocol_name || '')
      .split('—')
      .map((part) => part.trim());
    return (
      protocols.find((item) => item.name === name && item.view === view) ||
      protocols.find((item) => item.name === name) ||
      null
    );
  }, [exam, protocols]);

  const buildPlan = useCallback(async (record, protocolRecord) => {
    if (!record || !protocolRecord) return;
    if (plans.current[record.id]) {
      setPlan(plans.current[record.id]);
      return;
    }
    setPlanning(true);
    setPlanError(null);
    try {
      const response = await base44.functions.invoke('rayidAnalyze', {
        mode: 'pre_exam',
        protocol: protocolRecord,
        patient: { age: record.age, sex: record.sex, weight_kg: record.weight_kg },
      });
      const next = (response?.data ?? response)?.plan;
      if (next) {
        plans.current[record.id] = next;
        setPlan(next);
      }
    } catch (error) {
      setPlanError('RAYID could not analyse this examination. Standard technique is shown.');
    } finally {
      setPlanning(false);
    }
  }, []);

  useEffect(() => {
    if (exam && protocol) buildPlan(exam, protocol);
  }, [exam, protocol, buildPlan]);

  const openExam = useCallback((record) => {
    setExam(record);
    setStage('pre');
    setAssessment(null);
    setRotation(0);
    setCentring(0);
    setPlan(plans.current[record.id] || null);
    setPlanError(null);
  }, []);

  const closeExam = useCallback(() => {
    setExam(null);
    setStage('pre');
    setAssessment(null);
    setPlan(null);
    setRotation(0);
    setCentring(0);
  }, []);

  const acquire = useCallback(async () => {
    if (!exam || !protocol) return;
    const technique = techniqueOf(plan, protocol);
    setCapturing(true);
    try {
      await base44.entities.Exam.update(exam.id, {
        status: 'completed',
        exam_date: new Date().toISOString(),
        ...technique,
        rotation_deg: rotation,
        centring_offset_mm: centring,
      });

      const acquired = {
        ...exam,
        ...technique,
        status: 'completed',
        rotation_deg: rotation,
        centring_offset_mm: centring,
      };
      setExam(acquired);
      setStage('review');
      setEvaluating(true);

      const response = await base44.functions.invoke('rayidAnalyze', {
        mode: 'post_exam',
        exam: acquired,
        criteria: protocol.criteria || [],
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
  }, [exam, protocol, plan, rotation, centring, load]);

  const repeat = useCallback(async () => {
    if (!exam) return;
    setStage('positioning');
    setAssessment(null);
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
    protocol,
    stage,
    plan,
    planning,
    planError,
    rotation,
    centring,
    assessment,
    evaluating,
    capturing,
    setStage,
    setRotation,
    setCentring,
    openExam,
    closeExam,
    acquire,
    repeat,
    override,
  };
}