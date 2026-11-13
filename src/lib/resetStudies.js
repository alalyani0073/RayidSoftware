import { base44 } from '@/api/base44Client';

// Returning a study to its initial pre-examination state: scheduled, not started,
// with no acquired image, assessment, technique or positioning recorded.
const SCHEDULED = { status: 'queued', verdict: 'pending', pacs_status: 'pending' };
const CLEARED = { simulation_snapshot: 1, quality_score: 1, findings: 1, ai_summary: 1, recommendation: 1, rejection_reason: 1, kvp: 1, ma: 1, mas: 1, exposure_time_ms: 1, sid_cm: 1, aec_mode: 1, rotation_deg: 1, centring_offset_mm: 1, tube_angle_deg: 1 };
const ALL_STUDIES = { status: { $in: ['queued', 'in_progress', 'completed'] } };
const STORED = ['simulation_snapshot', 'quality_score', 'findings', 'ai_summary', 'kvp', 'exposure_time_ms'];

// Every stored artefact is removed wherever it is still present, so the reset is
// complete and repeatable rather than depending on which fields a study happens
// to carry.
export async function resetAllStudies() {
  await base44.entities.Exam.updateMany(ALL_STUDIES, { $set: SCHEDULED });
  for (const field of STORED) {
    await base44.entities.Exam.updateMany({ [field]: { $exists: true } }, { $unset: CLEARED });
  }
  return base44.entities.Exam.count(ALL_STUDIES);
}