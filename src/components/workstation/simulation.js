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
  // Unbalanced shutters: one border is opened beyond the required field while the
  // opposite border falls short of it, so the field has drifted off the anatomy.
  const delta = { l: req.l - c.l, r: c.r - req.r, t: req.t - c.t, b: c.b - req.b };
  [['l', 'r', tolX, k.x], ['t', 'b', tolY, k.y]].forEach(([first, second, limit, scale]) => {
    const wide = (edge) => delta[edge] > limit;
    const short = (edge) => delta[edge] < -limit;
    if (!((wide(first) && short(second)) || (short(first) && wide(second)))) return;
    const wideEdge = wide(first) ? first : second;
    const shortEdge = wideEdge === first ? second : first;
    const cm = Math.max(1, Math.round((Math.abs(delta[first]) + Math.abs(delta[second])) / 2 * scale));
    findings.push({ edge: shortEdge, kind: 'asymmetric', cm,
      message: `The shutters are unbalanced for ${p.label}: the ${EDGE_LABEL[wideEdge].toLowerCase()} border extends beyond the required field while the ${EDGE_LABEL[shortEdge].toLowerCase()} border falls inside it. Rebalance the pair so the field is centred on the required landmark.` });
  });
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

export const exposureSignature = (t) => `${t.kvp}|${t.ma}|${t.mas}|${t.aec_mode}`;

const fmt = (n) => (Number.isInteger(n) ? String(n) : String(Number(Number(n).toFixed(1))));

// Every exposure parameter is compared with the technique recommended for this
// patient, examination and projection. Each finding reports the selected value,
// the acceptable range, why it is inappropriate and the correction to make, so a
// warning names the actual deviation instead of a generic notice.
export function exposureFindings(t, ref, p) {
  if (!ref) return [];
  const findings = [];
  if (Math.abs(t.kvp - ref.kvp) > 10) {
    findings.push({ key: 'kvp', message: `kVp: selected ${fmt(t.kvp)} kV; recommended ${fmt(ref.kvp)} kV (acceptable ${Math.max(40, ref.kvp - 10)}–${Math.min(150, ref.kvp + 10)} kV). ${t.kvp < ref.kvp ? 'This is below the penetration required for this part, so the image will be underpenetrated, noisy and low in contrast.' : 'This is well above the penetration required, so contrast falls and dose rises without diagnostic benefit.'} Correction: set kVp to ${fmt(ref.kvp)} kV.` });
  }
  const masTolerance = ref.mas * 0.3;
  if (Math.abs(t.mas - ref.mas) > masTolerance) {
    findings.push({ key: 'mas', message: `mAs: selected ${fmt(t.mas)} mAs; recommended ${fmt(ref.mas)} mAs (acceptable ${fmt(Math.max(0.1, ref.mas - masTolerance))}–${fmt(ref.mas + masTolerance)} mAs). ${t.mas < ref.mas ? 'Too little exposure reaches the detector, so quantum mottle degrades fine detail.' : 'This exceeds the exposure this projection needs, raising patient dose without improving image quality.'} Correction: set mAs to ${fmt(ref.mas)} mAs.` });
  }
  const maTolerance = ref.ma * 0.35;
  if (Math.abs(t.ma - ref.ma) > maTolerance) {
    findings.push({ key: 'ma', message: `mA: selected ${fmt(t.ma)} mA; recommended ${fmt(ref.ma)} mA (acceptable ${fmt(ref.ma - maTolerance)}–${fmt(ref.ma + maTolerance)} mA). ${t.ma < ref.ma ? `The lower tube current lengthens the exposure to ${exposureTime(t)} ms, which allows patient motion to blur the image.` : `The higher tube current shortens the exposure to ${exposureTime(t)} ms, which is outside the reproducible range for this projection and loads the tube.`} Correction: set mA to ${fmt(ref.ma)} mA.` });
  }
  const time = exposureTime(t);
  const timeTolerance = Math.max(5, ref.exposure_time_ms * 0.5);
  if (Math.abs(time - ref.exposure_time_ms) > timeTolerance) {
    findings.push({ key: 'time', message: `Exposure time: selected ${time} ms; recommended ${fmt(ref.exposure_time_ms)} ms (acceptable ${fmt(Math.max(1, ref.exposure_time_ms - timeTolerance))}–${fmt(ref.exposure_time_ms + timeTolerance)} ms). ${time > ref.exposure_time_ms ? 'The exposure lasts long enough for respiratory or voluntary movement to blur detail.' : 'The exposure is shorter than the recommended value, so the selected mA/mAs combination is outside the technique used for this projection.'} Correction: restore mA ${fmt(ref.ma)} and mAs ${fmt(ref.mas)} to give ${fmt(ref.exposure_time_ms)} ms.` });
  }
  if (p && t.aec_mode === 'on' && !p.aec) {
    findings.push({ key: 'aec', message: `AEC: selected ON; automatic exposure control is not available for ${p.label} on this receptor. Photocell termination cannot be relied on, so the receptor may be under- or overexposed. Correction: set AEC to OFF and use the manual technique shown.` });
  }
  return findings;
}

export const exposureIssues = (t, r, p) => exposureFindings(t, r, p).map((finding) => finding.message);

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

// Patient alignment as the operator last checked it: movement is any change to
// these values after that check, not a change of the beam or shutters.
export const alignmentSignature = (s) => [s.rotation, s.angle, s.flexion ?? 0, s.limb, s.visible, s.coverage, s.breathing].map(String).join('|');

export function movementLines(position, checked, p) {
  const moved = [];
  if (position.rotation !== checked.rotation) moved.push(`patient rotation ${checked.rotation}° → ${position.rotation}°`);
  if (position.angle !== checked.angle) moved.push(`tube angulation ${checked.angle}° → ${position.angle}°`);
  if ((position.flexion ?? 0) !== (checked.flexion ?? 0)) moved.push(`limb flexion ${checked.flexion ?? 0}° → ${position.flexion ?? 0}°`);
  if (position.limb !== checked.limb) moved.push(position.limb ? 'limb alignment restored' : `${p.limbLabel.toLowerCase()} lost`);
  if (position.coverage !== checked.coverage) moved.push(position.coverage ? 'required anatomy back inside the field' : 'required anatomy outside the field');
  if (position.breathing !== checked.breathing) moved.push(position.breathing ? 'breath hold resumed' : 'breath hold released');
  if (position.visible !== checked.visible) moved.push(position.visible ? 'landmark visible again' : 'anatomical landmark now obscured');
  return [
    `The patient's position has changed since it was last checked: ${moved.join(', ')}.`,
    `The patient has moved from the checked position for ${p.label}, so the centring point and collimation field no longer match the anatomy. Reassess patient alignment, centering and collimation before exposure.`,
  ];
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
  const techniqueFaults = exposureIssues(capture.technique, recommendedTechnique(capture.patient, p), p);
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
  // The score is measured from the exposure actually acquired: coverage, field
  // accuracy, centering, rotation, angulation and technique deviation each cost
  // quality, so any operator adjustment to centering, collimation or exposure
  // moves the score in proportion to its clinical impact.
  const shiftExcess = Math.max(0, Math.hypot(pos.x, pos.y) - p.tolerances.centring);
  const rotExcess = Math.max(0, Math.abs(pos.rotation) - p.tolerances.rotation);
  const angleExcess = Math.max(0, Math.abs(pos.angle - p.angle) - p.tolerances.angle);
  const ref = recommendedTechnique(capture.patient, p);
  // Technique only costs quality once it leaves the accepted range, so the
  // recommended range keeps its score while a real deviation reduces it.
  const techDev = Math.max(
    Math.max(0, Math.abs(capture.technique.kvp - ref.kvp) - 10) / ref.kvp,
    Math.max(0, Math.abs(capture.technique.mas - ref.mas) / ref.mas - 0.3),
    Math.max(0, Math.abs(capture.technique.ma - ref.ma) / ref.ma - 0.35),
  );
  const cmOff = wide.reduce((n, f) => n + f.cm, 0) * 1.1 + tight.reduce((n, f) => n + f.cm, 0) * 1.5 + asym.reduce((n, f) => n + f.cm, 0) * 0.9;
  const penalty = (s.cutoff ? 30 : 0) + (motion ? 24 : 0) + (s.artifact ? 22 : 0)
    + Math.min(16, Math.round(cmOff))
    + Math.min(14, Math.round(shiftExcess / 2) + (off ? 3 : 0))
    + Math.min(12, Math.round(rotExcess * 2))
    + Math.min(8, Math.round(angleExcess * 2))
    + Math.min(24, Math.round(12 * Math.log2(1 + techDev)));
  const score = Math.max(35, Math.min(98, 100 - penalty));
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