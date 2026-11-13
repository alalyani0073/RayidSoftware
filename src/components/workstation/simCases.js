// One fixed simulated fault per sample patient, so the displayed sample X-ray always
// matches the described error. Assigned automatically; the operator never picks it.
const CASES = {
  correct: { fault: 'correct', scenario: 'auto', label: 'Correct positioning · criteria met', score: 94 },
  centering: { fault: 'centering', scenario: 'auto', label: 'Incorrect centering', score: 68 },
  cutoff: { fault: 'cutoff', scenario: 'cutoff', label: 'Anatomical cut-off', score: 72 },
  collimation: { fault: 'collimation', scenario: 'auto', label: 'Incorrect collimation', score: 81 },
  rotation: { fault: 'rotation', scenario: 'auto', label: 'Patient rotation', score: 74 },
  motion: { fault: 'motion', scenario: 'motion', label: 'Motion artifact', score: 69 },
  artifact: { fault: 'artifact', scenario: 'artifact', label: 'External artifact', score: 76 },
  positioning: { fault: 'positioning', scenario: 'auto', label: 'Incorrect positioning', score: 71 },
};

const BY_REF = {
  'MRN-41005': 'correct',
  'MRN-41012': 'cutoff',
  'MRN-41018': 'rotation',
  'MRN-41024': 'centering',
  'MRN-41031': 'motion',
  'MRN-41040': 'collimation',
};

const ORDER = ['centering', 'cutoff', 'collimation', 'rotation', 'motion', 'artifact', 'positioning', 'correct'];

export function caseFor(record) {
  const mapped = BY_REF[record?.patient_ref];
  const digits = String(record?.patient_ref || '').replace(/\D/g, '');
  const fallback = ORDER[Number(digits.slice(-2) || 0) % ORDER.length];
  return CASES[mapped || fallback];
}

// Position values that actually reproduce the assigned fault in the sample image.
export function casePosition(p, fault) {
  const base = { x: 0, y: 0, rotation: 0, angle: p.angle, limb: true, breathing: true, coverage: true, visible: true, collimation: { w: p.field.w, h: p.field.h } };
  if (fault === 'centering') return { ...base, x: 34, y: -6 };
  if (fault === 'collimation') return { ...base, collimation: { w: p.field.w * 1.34, h: p.field.h * 1.28 } };
  if (fault === 'cutoff') return { ...base, y: -p.tolerances.centring * 1.8, collimation: { w: p.field.w * 0.66, h: p.field.h * 0.74 } };
  if (fault === 'rotation') return { ...base, rotation: Math.round(p.tolerances.rotation * 3.2) || 7 };
  if (fault === 'motion') return { ...base, breathing: false };
  if (fault === 'positioning') return { ...base, angle: p.angle + Math.round(p.tolerances.angle * 2 + 3), limb: false };
  return base;
}