const round = (n, places = 1) => Number(n.toFixed(places));
export const exposureTime = (t) => round(1000 * t.mas / t.ma, 2);
export const baselineTechnique = (p) => ({ kvp: p.default_kvp, ma: p.default_ma, mas: p.default_mas, sid_cm: p.default_sid_cm, aec_mode: 'off' });
export const initialPosition = (p) => ({ x: 0, y: 0, rotation: 0, angle: p.angle, flexion: p.flexion ? (p.flexion[0] + p.flexion[1]) / 2 : 0, limb: true, breathing: true, coverage: true, visible: true, collimation: { w: p.field.w, h: p.field.h } });
export const collimation = (s, p) => s.collimation || { w: p.field.w, h: p.field.h };
export const fieldSizeCm = (s, p) => {
  const c = collimation(s, p);
  return [round((c.w / p.field.w) * p.field_cm[0], 0), round((c.h / p.field.h) * p.field_cm[1], 0)];
};
export const collimationFault = (s, p) => {
  const c = collimation(s, p);
  const tolerance = 5;
  if (p.field.w - c.w > tolerance || p.field.h - c.h > tolerance) return 'tight';
  if (c.w - p.field.w > tolerance || c.h - p.field.h > tolerance) return 'wide';
  return null;
};
export function collimationIssues(s, p) {
  const state = collimationFault(s, p);
  if (!state) return [];
  const size = fieldSizeCm(s, p).join(' × ');
  const expected = p.field_cm.join(' × ');
  return [state === 'tight'
    ? `Collimation too tight: the ${size} cm field excludes required anatomy. Open the shutters to approximately ${expected} cm to include the ${p.criteria[0].toLowerCase()}.`
    : `Collimation wider than required: ${size} cm field. Close the shutters to approximately ${expected} cm to reduce patient dose without excluding anatomy.`];
}
export const centeringOffset = (s, p) => Math.abs(s.x) > p.tolerances.centring || Math.abs(s.y) > p.tolerances.centring;
export function recommendedTechnique(patient, p) {
  const weight = Number(patient.weight_kg) || 70;
  const size = weight < 55 ? 0.8 : weight > 100 ? 1.5 : weight > 80 ? 1.2 : 1;
  const age = Number(patient.age) || 40;
  const child = age < 16 ? 0.65 : 1;
  const kvp = Math.max(50, Math.min(125, p.default_kvp + (size > 1 ? 4 : size < 1 ? -4 : 0) + (age < 16 ? -6 : 0)));
  const ma = age < 16 ? 160 : age >= 65 && p.region === 'Thorax' ? 400 : p.default_ma;
  const mas = round(p.default_mas * size * child);
  return { kvp, ma, mas, exposure_time_ms: exposureTime({ ma, mas }), sid_cm: p.default_sid_cm, aec_mode: 'off',
    reason: `${age} y · ${patient.weight_kg ? `${weight} kg` : 'weight unavailable, average adult assumed'}. ${size > 1 ? 'Higher' : size < 1 ? 'Lower' : 'Average'} attenuation estimated from body habitus. Short exposure limits motion; tight collimation supports ALARA. ${age < 16 ? 'Pediatric exposure follows the departmental pediatric technique chart.' : 'Confirm detector, grid and patient thickness against the departmental technique chart.'}` };
}
export function exposureIssues(t, r) {
  if (!r) return [];
  const issues = [];
  if (Math.abs(t.kvp - r.kvp) > 10) issues.push(`kVp: selected ${t.kvp}; recommended ${r.kvp}.`);
  if (Math.abs(t.mas - r.mas) / r.mas > 0.3) issues.push(`mAs: selected ${t.mas}; recommended ${r.mas}.`);
  if (Math.abs(t.ma - r.ma) / r.ma > 0.35) issues.push(`mA: selected ${t.ma}; recommended ${r.ma}.`);
  if (Math.abs(exposureTime(t) - r.exposure_time_ms) > Math.max(5, r.exposure_time_ms * 0.5)) issues.push(`Time: selected ${exposureTime(t)} ms; recommended ${r.exposure_time_ms} ms.`);
  return issues;
}
export function positioningIssues(s, p) {
  const issues = [];
  if (!s.visible) issues.push('Anatomical landmark obscured. Reposition or uncover the landmark before retrying.');
  if (centeringOffset(s, p)) issues.push(`Incorrect centering. Shift the beam ${-s.x} mm horizontally and ${-s.y} mm longitudinally to ${p.centring}.`);
  if (Math.abs(s.rotation) > p.tolerances.rotation) issues.push(`Patient rotation ${s.rotation}°. Correct the rotation until: ${p.rotationCriterion.toLowerCase()}.`);
  if (Math.abs(s.angle - p.angle) > p.tolerances.angle) issues.push(`Incorrect tube angulation ${s.angle}°. Recommended: ${p.angulation}.`);
  if (p.flexion && (s.flexion < p.flexion[0] || s.flexion > p.flexion[1])) issues.push(`Limb flexion ${s.flexion}°. Required range: ${p.flexion[0]}–${p.flexion[1]}°, only if safe.`);
  if (!s.limb) issues.push(`Incomplete alignment: ${p.limbLabel}.`);
  if (!s.coverage) issues.push(`Incomplete collimation: verify ${p.criteria[0].toLowerCase()}.`);
  if (!s.breathing && !p.flexion) issues.push(p.region === 'Thorax' ? 'Inadequate inspiration. Rehearse the breath hold as tolerated.' : 'Breathing not suspended. Rehearse an end-expiration breath hold.');
  return issues;
}
export function sampleFor(position, scenario, p) {
  const c = collimation(position, p);
  return { cutoff: scenario === 'cutoff' || !position.coverage || Math.abs(position.y) > p.tolerances.centring * 1.5 || p.field.w - c.w > 5 || p.field.h - c.h > 5,
    motion: scenario === 'motion' || !position.breathing, artifact: scenario === 'artifact',
    rotated: Math.abs(position.rotation) > p.tolerances.rotation, alignment: positioningIssues(position, p).length > 0 };
}
export function scriptedAssessment(capture, p) {
  const s = capture.sample;
  const pos = capture.position;
  const field = fieldSizeCm(pos, p);
  const state = collimationFault(pos, p);
  const off = centeringOffset(pos, p);
  const rotated = Math.abs(pos.rotation) > p.tolerances.rotation;
  const motion = !pos.breathing;
  const angulationWrong = Math.abs(pos.angle - p.angle) > p.tolerances.angle;
  const techniqueFaults = exposureIssues(capture.technique, recommendedTechnique(capture.patient, p));
  const detected = [];
  if (s.cutoff) detected.push({ title: 'Incomplete anatomical coverage', detail: `The ${field.join(' × ')} cm field excludes the ${p.cutoff}.` });
  if (state === 'wide') detected.push({ title: 'Incorrect collimation — field wider than required', detail: `${field.join(' × ')} cm exposed versus the required ${p.field_cm.join(' × ')} cm.` });
  if (state === 'tight' && !s.cutoff) detected.push({ title: 'Incorrect collimation — field too tight', detail: `${field.join(' × ')} cm exposed versus the required ${p.field_cm.join(' × ')} cm.` });
  if (off) detected.push({ title: 'Incorrect anatomical centering', detail: `Central ray is ${Math.abs(pos.x)} mm ${pos.x >= 0 ? 'lateral' : 'medial'} and ${Math.abs(pos.y)} mm off the recommended landmark (${p.centring}).` });
  if (rotated) detected.push({ title: 'Patient rotation', detail: `${Math.abs(pos.rotation)}° rotation measured. ${p.rotationCriterion}.` });
  if (motion) detected.push({ title: 'Motion artifact', detail: p.region === 'Thorax' ? 'Loss of fine detail from incomplete inspiration / breath hold.' : 'Loss of fine detail from patient movement during exposure.' });
  if (s.artifact) detected.push({ title: 'External radiopaque artifact', detail: 'An object overlies the required anatomy and obscures detail.' });
  if (angulationWrong) detected.push({ title: 'Incorrect tube angulation', detail: `Selected ${pos.angle}°; recommended ${p.angulation}.` });
  if (techniqueFaults.length) detected.push({ title: 'Exposure selection outside range', detail: techniqueFaults.join(' ') });
  const score = detected.length === 0 ? 94 : Math.round(capture.caseScore || Math.max(45, 92 - detected.length * 9));
  const critical = Boolean(s.cutoff || s.motion || s.artifact);
  const accepted = score >= 90 && detected.length === 0 && !critical;
  const fixes = [];
  if (s.cutoff || state === 'tight') fixes.push(`Include the ${p.cutoff} by adjusting centring and opening the shutters to ${p.field_cm.join(' × ')} cm.`);
  if (state === 'wide') fixes.push(`Close the shutters to ${p.field_cm.join(' × ')} cm.`);
  if (off) fixes.push(`Reposition the central ray to ${p.centring}.`);
  if (rotated) fixes.push(`Correct rotation until ${p.rotationCriterion.toLowerCase()}.`);
  if (motion) fixes.push(p.region === 'Thorax' ? 'Rehearse the breath hold and repeat on full inspiration.' : 'Rehearse an expiratory breath hold and repeat.');
  if (s.artifact) fixes.push('Remove the external object and repeat the exposure.');
  if (angulationWrong) fixes.push(`Set the tube angulation to ${p.angulation}.`);
  if (techniqueFaults.length) fixes.push('Review the exposure technique against the recommendation.');
  const findings = [
    { label: 'Anatomical coverage / cut-off', pass: !s.cutoff, critical: s.cutoff, note: s.cutoff ? `The ${field.join(' × ')} cm field excludes the ${p.cutoff}. Required anatomy is missing.` : `${p.criteria[0]} included in this sample.` },
    { label: 'Collimation', pass: !state, critical: false, note: state ? collimationIssues(pos, p).join(' ') : `Field of ${field.join(' × ')} cm matches the required ${p.field_cm.join(' × ')} cm.` },
    { label: 'Centering / central ray', pass: !off && !angulationWrong, critical: false, note: off ? `${Math.abs(pos.x)} mm lateral, ${Math.abs(pos.y)} mm longitudinal from ${p.centring}.` : `${p.centring}; ${p.angulation}.` },
    { label: 'Patient rotation', pass: !rotated, critical: false, note: rotated ? `${Math.abs(pos.rotation)}° rotational misalignment. Check ${p.rotationCriterion.toLowerCase()}.` : p.rotationCriterion },
    { label: 'External artifacts', pass: !s.artifact, critical: s.artifact, note: s.artifact ? 'Radiopaque-object overlay obscures required anatomy.' : 'No external artifact over the required anatomy.' },
    { label: 'Motion / sharpness', pass: !motion, critical: motion, note: motion ? 'Deliberately blurred sample represents loss of fine detail.' : p.criteria[p.criteria.length - 1] },
    { label: 'Exposure selection', pass: !techniqueFaults.length, critical: false, note: techniqueFaults.length ? techniqueFaults.join(' ') : 'Selected technique is within the reference range.' },
  ];
  return { quality_score: score, accepted, critical, detected, findings,
    summary: `${p.label}: ${accepted ? 'technical criteria met' : `technical correction indicated (${detected.length} finding${detected.length === 1 ? '' : 's'})`}.`,
    recommendation: accepted ? 'No repeat indicated by image quality review.' : fixes.join(' ') };
}