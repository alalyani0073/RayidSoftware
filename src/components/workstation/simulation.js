const round = (n, places = 1) => Number(n.toFixed(places));
export const exposureTime = (t) => round(1000 * t.mas / t.ma, 2);
export const baselineTechnique = (p) => ({ kvp: p.default_kvp, ma: p.default_ma, mas: p.default_mas, sid_cm: p.default_sid_cm, aec_mode: 'off' });

// Collimation is defined by four independent shutters (left, right, superior,
// inferior) expressed as a percentage of the camera frame, so the field can be
// asymmetric exactly as it is on a real collimator.
export const EDGES = ['t', 'b', 'l', 'r'];
export const EDGE_LABEL = { t: 'Superior', b: 'Inferior', l: 'Left', r: 'Right' };

export const requiredEdges = (p) => (p.field.l !== undefined
  ? { l: p.field.l, r: p.field.r, t: p.field.t, b: p.field.b }
  : { l: 50 - p.field.w / 2, r: 50 + p.field.w / 2, t: 50 - p.field.h / 2, b: 50 + p.field.h / 2 });

export const centrePercent = (p, s) => ({ x: p.focus.x * 100 + (s.x || 0) * 0.22, y: p.focus.y * 100 + (s.y || 0) * 0.22 });

export const cmPerPercent = (p) => {
  const req = requiredEdges(p);
  return { x: p.field_cm[0] / (req.r - req.l), y: p.field_cm[1] / (req.b - req.t) };
};

const clampEdge = (value) => Math.min(98, Math.max(2, value));

export function collimation(s, p) {
  const req = requiredEdges(p);
  const c = s.collimation;
  if (c && c.l !== undefined && c.t !== undefined) {
    const l = clampEdge(c.l); const r = clampEdge(c.r); const t = clampEdge(c.t); const b = clampEdge(c.b);
    return { l: Math.min(l, r - 4), r: Math.max(r, l + 4), t: Math.min(t, b - 4), b: Math.max(b, t + 4) };
  }
  if (c && c.w !== undefined) {
    const { x, y } = centrePercent(p, s);
    return { l: clampEdge(x - c.w / 2), r: clampEdge(x + c.w / 2), t: clampEdge(y - c.h / 2), b: clampEdge(y + c.h / 2) };
  }
  return { ...req };
}

// A field scaled about its own centre: values below 1 narrow it, above 1 widen it.
export function scaleField(p, fx, fy) {
  const req = requiredEdges(p);
  const cx = (req.l + req.r) / 2;
  const cy = (req.t + req.b) / 2;
  return { l: cx - (cx - req.l) * fx, r: cx + (req.r - cx) * fx, t: cy - (cy - req.t) * fy, b: cy + (req.b - cy) * fy };
}

export const initialPosition = (p) => ({ x: 0, y: 0, rotation: 0, angle: p.angle, flexion: p.flexion ? (p.flexion[0] + p.flexion[1]) / 2 : 0, limb: true, breathing: true, coverage: true, visible: true, collimation: { ...requiredEdges(p) } });

export const fieldSizeCm = (s, p) => {
  const c = collimation(s, p);
  const k = cmPerPercent(p);
  return [Math.round((c.r - c.l) * k.x), Math.round((c.b - c.t) * k.y)];
};

export const borderCm = (s, p, edge) => {
  const c = collimation(s, p);
  const k = cmPerPercent(p);
  const { x, y } = centrePercent(p, s);
  if (edge === 't') return Math.max(0, Math.round((y - c.t) * k.y));
  if (edge === 'b') return Math.max(0, Math.round((c.b - y) * k.y));
  if (edge === 'l') return Math.max(0, Math.round((x - c.l) * k.x));
  return Math.max(0, Math.round((c.r - x) * k.x));
};

export function setBorderCm(s, p, edge, cm) {
  const c = collimation(s, p);
  const k = cmPerPercent(p);
  const { x, y } = centrePercent(p, s);
  const next = { ...c };
  if (edge === 't') next.t = clampEdge(y - cm / k.y);
  if (edge === 'b') next.b = clampEdge(y + cm / k.y);
  if (edge === 'l') next.l = clampEdge(x - cm / k.x);
  if (edge === 'r') next.r = clampEdge(x + cm / k.x);
  return next;
}

const TOLERANCE_CM = 1.2;

export function collimationFindings(s, p) {
  const c = collimation(s, p);
  const req = requiredEdges(p);
  const k = cmPerPercent(p);
  const tolX = TOLERANCE_CM / k.x;
  const tolY = TOLERANCE_CM / k.y;
  const anatomy = (edge) => p.borders?.[edge] || p.criteria[0].toLowerCase();
  const findings = [];
  EDGES.forEach((edge) => {
    const vertical = edge === 'l' || edge === 'r';
    const scale = vertical ? k.x : k.y;
    const tolerance = vertical ? tolX : tolY;
    const over = edge === 't' ? req.t - c.t : edge === 'b' ? c.b - req.b : edge === 'l' ? req.l - c.l : c.r - req.r;
    const short = edge === 't' ? c.t - req.t : edge === 'b' ? req.b - c.b : edge === 'l' ? c.l - req.l : req.r - c.r;
    if (over > tolerance) {
      const cm = Math.max(1, Math.round(over * scale));
      findings.push({ edge, kind: 'wide', cm, message: `${EDGE_LABEL[edge]} border extends ${cm} cm beyond the required field for ${p.label}, exposing tissue that does not need to be irradiated. Close the ${EDGE_LABEL[edge].toLowerCase()} shutter by ${cm} cm; the required margin is the ${anatomy(edge)}.` });
    } else if (short > tolerance) {
      const cm = Math.max(1, Math.round(short * scale));
      findings.push({ edge, kind: 'tight', cm, message: `${EDGE_LABEL[edge]} border is ${cm} cm inside the required field and excludes the ${anatomy(edge)}. Open the ${EDGE_LABEL[edge].toLowerCase()} shutter by ${cm} cm to include all required anatomy.` });
    }
  });
  const beam = centrePercent(p, s);
  const fieldCentre = { x: (c.l + c.r) / 2, y: (c.t + c.b) / 2 };
  const offX = Math.round((fieldCentre.x - beam.x) * k.x);
  const offY = Math.round((fieldCentre.y - beam.y) * k.y);
  if (Math.abs(offX) > TOLERANCE_CM || Math.abs(offY) > TOLERANCE_CM) {
    const direction = [
      Math.abs(offX) > TOLERANCE_CM ? `${Math.abs(offX)} cm ${offX >= 0 ? 'right' : 'left'}` : '',
      Math.abs(offY) > TOLERANCE_CM ? `${Math.abs(offY)} cm ${offY >= 0 ? 'inferior' : 'superior'}` : '',
    ].filter(Boolean).join(' and ');
    findings.push({ edge: offX ? (offX > 0 ? 'l' : 'r') : (offY > 0 ? 't' : 'b'), kind: 'asymmetric', cm: Math.max(Math.abs(offX), Math.abs(offY)),
      message: `The shutters are unbalanced: the field is displaced ${direction} of the central ray and no longer covers the ${p.centring}. Rebalance the shutters until the field is centred on the required landmark.` });
  }
  return findings;
}

export const collimationFault = (s, p) => {
  const findings = collimationFindings(s, p);
  if (!findings.length) return null;
  return { wide: findings.filter((f) => f.kind === 'wide'), tight: findings.filter((f) => f.kind === 'tight'), asymmetric: findings.filter((f) => f.kind === 'asymmetric') };
};

export function collimationIssues(s, p) {
  return collimationFindings(s, p).map((finding) => finding.message);
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
  if (!s.coverage) issues.push(...collimationIssues(s, p).slice(0, 2));
  if (!s.breathing && !p.flexion) issues.push(p.region === 'Thorax' ? 'Inadequate inspiration. Rehearse the breath hold as tolerated.' : 'Breathing not suspended. Rehearse an end-expiration breath hold.');
  return issues;
}

export function sampleFor(position, scenario, p) {
  const state = collimationFault(position, p);
  return { cutoff: scenario === 'cutoff' || !position.coverage || Math.abs(position.y) > p.tolerances.centring * 1.5 || Boolean(state?.tight.length),
    motion: scenario === 'motion' || !position.breathing,
    artifact: scenario === 'artifact',
    rotated: Math.abs(position.rotation) > p.tolerances.rotation,
    alignment: positioningIssues(position, p).length > 0 };
}

export function scriptedAssessment(capture, p) {
  const s = capture.sample;
  const pos = capture.position;
  const field = fieldSizeCm(pos, p);
  const findings = collimationFindings(pos, p);
  const wide = findings.filter((f) => f.kind === 'wide');
  const tight = findings.filter((f) => f.kind === 'tight');
  const asym = findings.filter((f) => f.kind === 'asymmetric');
  const off = centeringOffset(pos, p);
  const rotated = Math.abs(pos.rotation) > p.tolerances.rotation;
  const motion = !pos.breathing;
  const angulationWrong = Math.abs(pos.angle - p.angle) > p.tolerances.angle;
  const techniqueFaults = exposureIssues(capture.technique, recommendedTechnique(capture.patient, p));
  const detected = [];
  if (s.cutoff) detected.push({ title: 'Incomplete anatomical coverage', detail: `The ${field.join(' × ')} cm field excludes the ${p.cutoff}.` });
  if (wide.length) detected.push({ title: 'Excessive collimation', detail: wide.map((f) => f.message).join(' ') });
  if (tight.length && !s.cutoff) detected.push({ title: 'Insufficient collimation', detail: tight.map((f) => f.message).join(' ') });
  if (asym.length) detected.push({ title: 'Collimated field off-centre', detail: asym.map((f) => f.message).join(' ') });
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
  if (s.cutoff) fixes.push(`Include the ${p.cutoff} by re-centring and opening the shutters to ${p.field_cm.join(' × ')} cm.`);
  if (tight.length) fixes.push(tight.map((f) => `Open the ${EDGE_LABEL[f.edge].toLowerCase()} shutter by ${f.cm} cm.`).join(' '));
  if (wide.length) fixes.push(wide.map((f) => `Close the ${EDGE_LABEL[f.edge].toLowerCase()} shutter by ${f.cm} cm.`).join(' '));
  if (asym.length) fixes.push('Rebalance the shutters so the field is centred on the central ray.');
  if (off) fixes.push(`Reposition the central ray to ${p.centring}.`);
  if (rotated) fixes.push(`Correct rotation until ${p.rotationCriterion.toLowerCase()}.`);
  if (motion) fixes.push(p.region === 'Thorax' ? 'Rehearse the breath hold and repeat on full inspiration.' : 'Rehearse an expiratory breath hold and repeat.');
  if (s.artifact) fixes.push('Remove the external object and repeat the exposure.');
  if (angulationWrong) fixes.push(`Set the tube angulation to ${p.angulation}.`);
  if (techniqueFaults.length) fixes.push('Review the exposure technique against the recommendation.');
  const collimationNote = findings.length ? findings.map((f) => f.message).join(' ') : `Field of ${field.join(' × ')} cm matches the required ${p.field_cm.join(' × ')} cm for ${p.label}.`;
  const findingsList = [
    { label: 'Anatomical coverage / cut-off', pass: !s.cutoff, critical: s.cutoff, note: s.cutoff ? `The ${field.join(' × ')} cm field excludes the ${p.cutoff}. Required anatomy is missing.` : `${p.criteria[0]} included in this sample.` },
    { label: 'Collimation', pass: !findings.length, critical: false, note: collimationNote },
    { label: 'Centering / central ray', pass: !off && !angulationWrong, critical: false, note: off ? `${Math.abs(pos.x)} mm lateral, ${Math.abs(pos.y)} mm longitudinal from ${p.centring}.` : `${p.centring}; ${p.angulation}.` },
    { label: 'Patient rotation', pass: !rotated, critical: false, note: rotated ? `${Math.abs(pos.rotation)}° rotational misalignment. Check ${p.rotationCriterion.toLowerCase()}.` : p.rotationCriterion },
    { label: 'External artifacts', pass: !s.artifact, critical: s.artifact, note: s.artifact ? 'Radiopaque-object overlay obscures required anatomy.' : 'No external artifact over the required anatomy.' },
    { label: 'Motion / sharpness', pass: !motion, critical: motion, note: motion ? 'Deliberately blurred sample represents loss of fine detail.' : p.criteria[p.criteria.length - 1] },
    { label: 'Exposure selection', pass: !techniqueFaults.length, critical: false, note: techniqueFaults.length ? techniqueFaults.join(' ') : 'Selected technique is within the reference range.' },
  ];
  return { quality_score: score, accepted, critical, detected, findings: findingsList,
    summary: `${p.label}: ${accepted ? 'technical criteria met' : `technical correction indicated (${detected.length} finding${detected.length === 1 ? '' : 's'})`}.`,
    recommendation: accepted ? 'No repeat indicated by image quality review.' : fixes.join(' ') };
}