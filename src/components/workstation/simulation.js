const round = (n, places = 1) => Number(n.toFixed(places));
export const exposureTime = (t) => round(1000 * t.mas / t.ma, 2);
export const baselineTechnique = (p) => ({ kvp: p.default_kvp, ma: p.default_ma, mas: p.default_mas, sid_cm: p.default_sid_cm, aec_mode: 'off' });
export const initialPosition = (p) => ({ x: 0, y: 0, rotation: 0, angle: p.angle, flexion: p.flexion ? (p.flexion[0] + p.flexion[1]) / 2 : 0, limb: true, breathing: true, coverage: true, visible: true, collimation: { w: p.field.w, h: p.field.h } });
export const collimation = (s, p) => s.collimation || { w: p.field.w, h: p.field.h };
export const fieldSizeCm = (s, p) => {
  const c = collimation(s, p);
  return [round((c.w / p.field.w) * p.field_cm[0], 0), round((c.h / p.field.h) * p.field_cm[1], 0)];
};
export function collimationIssues(s, p) {
  const c = collimation(s, p);
  const tolerance = 5;
  const size = fieldSizeCm(s, p).join(' × ');
  const expected = p.field_cm.join(' × ');
  const issues = [];
  if (p.field.w - c.w > tolerance || p.field.h - c.h > tolerance) issues.push(`Collimation too tight: the ${size} cm field excludes required anatomy. Open the shutters to approximately ${expected} cm to include the ${p.criteria[0].toLowerCase()}.`);
  if (c.w - p.field.w > tolerance || c.h - p.field.h > tolerance) issues.push(`Collimation wider than required: ${size} cm field. Close the shutters to approximately ${expected} cm to reduce patient dose without excluding anatomy.`);
  return issues;
}
export function recommendedTechnique(patient, p) {
  const weight = Number(patient.weight_kg) || 70;
  const size = weight < 55 ? 0.8 : weight > 100 ? 1.5 : weight > 80 ? 1.2 : 1;
  const age = Number(patient.age) || 40;
  const child = age < 16 ? 0.65 : 1;
  const kvp = Math.max(50, Math.min(125, p.default_kvp + (size > 1 ? 4 : size < 1 ? -4 : 0) + (age < 16 ? -6 : 0)));
  const ma = age < 16 ? 160 : age >= 65 && p.region === 'Thorax' ? 400 : p.default_ma;
  const mas = round(p.default_mas * size * child);
  return { kvp, ma, mas, exposure_time_ms: exposureTime({ ma, mas }), sid_cm: p.default_sid_cm, aec_mode: 'off',
    reason: `${age} y · ${patient.weight_kg ? `${weight} kg` : 'weight unavailable, average adult assumed'}. ${size > 1 ? 'Higher' : size < 1 ? 'Lower' : 'Average'} attenuation assumed from weight, not measured thickness. Short exposure limits motion; tight collimation supports ALARA. ${age < 16 ? 'Illustrative pediatric scaling only; a validated pediatric chart is required clinically.' : 'Confirm detector, grid and patient thickness against the departmental technique chart.'}` };
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
  if (Math.abs(s.x) > p.tolerances.centring || Math.abs(s.y) > p.tolerances.centring) issues.push(`Incorrect centering. Shift the beam ${-s.x} mm horizontally and ${-s.y} mm longitudinally to ${p.centring}.`);
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
  const positionFaults = positioningIssues(capture.position, p);
  const techniqueFaults = exposureIssues(capture.technique, recommendedTechnique(capture.patient, p));
  let score = s.cutoff ? 82 : s.motion ? 68 : s.artifact ? 72 : 96;
  if (s.rotated) score -= 12;
  if (s.alignment && !s.rotated && !s.cutoff) score -= 16;
  if (techniqueFaults.length) score -= 12;
  if (s.cutoff && s.motion) score -= 18;
  const collimationFaults = collimationIssues(capture.position, p);
  const findings = [
    { label: 'Anatomical coverage / cut-off', pass: !s.cutoff, critical: s.cutoff, note: s.cutoff ? `Simulated exclusion of ${p.cutoff}. Required anatomy is missing regardless of percentage.` : `${p.criteria[0]} in the scripted reference scenario.` },
    { label: 'Collimation', pass: !collimationFaults.length, critical: false, note: collimationFaults.length ? collimationFaults.join(' ') : `Simulated field of ${fieldSizeCm(capture.position, p).join(' × ')} cm matches the demonstration field size.` },
    { label: 'Patient rotation', pass: !s.rotated, critical: false, note: s.rotated ? `Simulated ${capture.position.rotation}° rotational misalignment. Check ${p.rotationCriterion.toLowerCase()}.` : p.rotationCriterion },
    { label: 'Positioning / angulation', pass: !positionFaults.length, critical: false, note: positionFaults.length ? positionFaults.join(' ') : `${p.centring}; ${p.angulation}.` },
    { label: 'External artifacts', pass: !s.artifact, critical: s.artifact, note: s.artifact ? 'Added radiopaque-object overlay obscures required anatomy. Remove the object before repeating.' : 'No added external artifact in this sample scenario.' },
    { label: 'Motion / sharpness', pass: !s.motion, critical: s.motion, note: s.motion ? 'Deliberately blurred sample represents loss of fine detail. Rehearse breath hold or immobilize as appropriate.' : p.criteria[p.criteria.length - 1] },
    { label: 'Exposure selection', pass: !techniqueFaults.length, critical: false, note: techniqueFaults.length ? techniqueFaults.join(' ') : 'Selected technique is within the demonstration comparison limits.' },
  ];
  const critical = findings.some(f => f.critical);
  const accepted = score >= 75 && !critical && !positionFaults.length && !techniqueFaults.length && !collimationFaults.length;
  return { quality_score: Math.max(20, score), accepted, critical, verdict: accepted ? 'accepted' : 'repeat_required', findings,
    summary: `${p.label}: ${accepted ? 'scripted technical criteria met' : 'technical correction indicated'}. This is not diagnostic interpretation.`,
    recommendation: accepted ? 'No repeat suggested by this simulation. Radiographer must review the image before acceptance.' : `Review clinical adequacy before deciding to repeat. ${s.cutoff ? `Include ${p.cutoff}. ` : ''}${s.motion ? 'Reduce motion. ' : ''}${s.artifact ? 'Remove external artifact. ' : ''}${positionFaults.length ? 'Correct position and beam alignment. ' : ''}${techniqueFaults.length ? 'Review technique. ' : ''}` };
}