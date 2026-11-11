const M = 'https://media.base44.com/images/public/6af445986703f21f765252f1/';

/**
 * Simulated clinical reference library.
 * One entry per projection — never reused across examinations. All reference
 * values (centring, angulation, criteria) follow conventional radiographic
 * positioning principles; the images and AI output are simulated for the
 * prototype and are not clinically validated.
 */
export const PROJECTIONS = [
  {
    key: 'knee_ap',
    name: 'Knee',
    view: 'AP',
    label: 'Knee — AP',
    region: 'Lower limb',
    laterality: 'left',
    detector: '24 × 30 cm · table Bucky',
    default_kvp: 66,
    default_mas: 4,
    default_sid_cm: 100,
    grid: 'yes',
    centring: '1–2 cm distal to the apex of the patella',
    cr: 'Perpendicular to the detector',
    angulation: '0° · 5–7° cephalad only if the patella must clear the femur',
    tolerances: { rotation: 2.5, centring: 8 },
    focus: { x: 0.5, y: 0.56 },
    field: { w: 30, h: 42 },
    prep: [
      'Confirm identity and place the side marker in the field.',
      'Remove splints, braces and thick padding around the knee.',
      'Explain the need to hold still for the exposure.',
    ],
    positioning: [
      'Patient supine, knee flexed 5–10° on a soft support.',
      'Detector centred on the knee, table horizontal.',
      'Internally rotate the leg 3–5° so the patella sits centrally.',
      'Centre 1–2 cm below the patellar apex; collimate distal femur to proximal tibia.',
    ],
    criteria: [
      'Femoral condyles and tibial plateau fully included',
      'Joint space open with 5–10° flexion',
      'Patella superimposed centrally, no rotation',
      'Fibular head partially superimposed by the tibia',
      'Sharp trabecular detail and soft tissue outline',
    ],
    defect:
      'Medial femoral condyle cut off at the collimated edge, with external rotation and full superimposition of the fibular head.',
    reference: `${M}db1940e7e_generated_image.png`,
    radiograph: {
      accepted: `${M}84a118950_generated_image.png`,
      rejected: `${M}a20a2e530_generated_image.png`,
    },
    detections: [
      { x: 58, y: 38, w: 36, h: 30, label: 'Medial condyle cut off', severity: 'high' },
      { x: 20, y: 44, w: 30, h: 32, label: 'Rotation · fibula superimposed', severity: 'medium' },
    ],
  },
  {
    key: 'knee_lat',
    name: 'Knee',
    view: 'Lateral',
    label: 'Knee — Lateral',
    region: 'Lower limb',
    laterality: 'right',
    detector: '24 × 30 cm · table Bucky',
    default_kvp: 66,
    default_mas: 4,
    default_sid_cm: 100,
    grid: 'yes',
    centring: '1–2 cm distal to the patellar apex, through the joint space',
    cr: 'Perpendicular to the detector, directed at the joint space',
    angulation: '0° · 5–7° cephalad for a true lateral',
    tolerances: { rotation: 2, centring: 8 },
    focus: { x: 0.5, y: 0.58 },
    field: { w: 30, h: 44 },
    prep: [
      'Confirm identity and side marker.',
      'Patient turned onto the affected side with the opposite leg drawn back.',
      'Support the knee so the patient can hold 20–30° flexion.',
    ],
    positioning: [
      'Lateral recumbent, knee flexed 20–30°.',
      'Detector centred on the joint space, table horizontal.',
      'Palpate the femoral condyles until they are superimposed.',
      'Centre 1–2 cm below the patellar apex; include distal femur and proximal tibia.',
    ],
    criteria: [
      'Femoral condyles superimposed (true lateral)',
      'Patella in profile with a clear patellofemoral joint',
      'Joint space and tibial plateau included',
      'Distal femur and proximal tibia both included',
      'No rotation of the femoral shaft',
    ],
    defect:
      'Condyles not superimposed (approximately 15° oblique), patella off profile, and the proximal tibia cut off inferiorly.',
    reference: `${M}3146fd089_generated_image.png`,
    radiograph: {
      accepted: `${M}9bb79f71f_generated_image.png`,
      rejected: `${M}ab39d45e7_generated_image.png`,
    },
    detections: [
      { x: 28, y: 24, w: 46, h: 28, label: 'Condyles not superimposed', severity: 'high' },
      { x: 28, y: 72, w: 44, h: 22, label: 'Proximal tibia cut off', severity: 'high' },
    ],
  },
  {
    key: 'chest_pa',
    name: 'Chest',
    view: 'PA',
    label: 'Chest — PA',
    region: 'Thorax',
    laterality: 'not_applicable',
    detector: '35 × 43 cm · upright Bucky',
    default_kvp: 120,
    default_mas: 2,
    default_sid_cm: 180,
    grid: 'yes',
    centring: 'T7 · level of the inferior angle of the scapulae, midline',
    cr: 'Horizontal, perpendicular to the detector',
    angulation: '0°',
    tolerances: { rotation: 3, centring: 15 },
    focus: { x: 0.5, y: 0.44 },
    field: { w: 34, h: 42 },
    prep: [
      'Confirm identity; remove necklace, clips and metal-containing clothing.',
      'Patient erect, weight evenly on both feet, chin raised.',
      'Explain the breathing instruction before positioning.',
    ],
    positioning: [
      'Patient facing the upright Bucky, upper chest against the receptor.',
      'Shoulders rolled forward, backs of hands on hips, elbows forward.',
      'Feet slightly apart, hips level, no leaning.',
      'Centre at T7 midline; collimate to include both costophrenic angles.',
      'Expose on full inspiration.',
    ],
    criteria: [
      'Both lung fields and costophrenic angles included',
      'Spinous processes midway between the clavicular heads (no rotation)',
      'Scapulae projected clear of the lung fields',
      '9–10 posterior ribs visible above the diaphragm',
      'Sharp vascular markings with adequate inspiration',
    ],
    defect:
      'Rotated patient with asymmetric clavicles, scapulae across both lung fields and the left costophrenic angle cut off.',
    reference: `${M}604462808_generated_image.png`,
    radiograph: {
      accepted: `${M}b9df6923a_generated_image.png`,
      rejected: `${M}ee6255b7b_generated_image.png`,
    },
    detections: [
      { x: 62, y: 70, w: 32, h: 24, label: 'Costophrenic angle cut off', severity: 'high' },
      { x: 24, y: 10, w: 46, h: 18, label: 'Rotation · clavicles asymmetric', severity: 'medium' },
      { x: 34, y: 30, w: 18, h: 30, label: 'Scapula over lung field', severity: 'medium' },
    ],
  },
  {
    key: 'chest_ap',
    name: 'Chest',
    view: 'AP',
    label: 'Chest — AP',
    region: 'Thorax',
    laterality: 'not_applicable',
    detector: '35 × 43 cm · table or trolley, detector behind the thorax',
    default_kvp: 100,
    default_mas: 3,
    default_sid_cm: 120,
    grid: 'yes',
    centring: 'T7 · 3–5 cm below the jugular notch, midline',
    cr: 'Vertical, perpendicular to the detector',
    angulation: '0°',
    tolerances: { rotation: 4, centring: 20 },
    focus: { x: 0.5, y: 0.5 },
    field: { w: 36, h: 44 },
    prep: [
      'Confirm identity; check the patient can lie flat or sit upright.',
      'Remove metal and thick clothing from the thorax.',
      'Consider a pillow under the head for comfort and stability.',
    ],
    positioning: [
      'Patient supine (or sitting upright if respiration allows).',
      'Detector placed behind the thorax, covering apices to costophrenic angles.',
      'Arms abducted clear of the thorax; shoulders flat and level.',
      'Centre at T7 midline, collimate to both lung fields.',
      'Expose on full inspiration, at the end of the breath hold.',
    ],
    criteria: [
      'Both apices and costophrenic angles included',
      'Clavicles symmetric with no rotation',
      'Arms abducted clear of the thorax',
      'Adequate contrast through the mediastinum',
      'No motion blur of the vascular markings',
    ],
    defect:
      'Motion artefact blurring the vascular markings, both costophrenic angles cut off inferiorly and a mild rotation.',
    reference: `${M}a6e31ee06_generated_image.png`,
    radiograph: {
      accepted: `${M}ca7a16c81_generated_image.png`,
      rejected: `${M}614947d08_generated_image.png`,
    },
    detections: [
      { x: 24, y: 24, w: 52, h: 34, label: 'Motion artefact', severity: 'high' },
      { x: 22, y: 70, w: 56, h: 24, label: 'Costophrenic angles cut off', severity: 'high' },
    ],
  },
  {
    key: 'abdomen_ap',
    name: 'Abdomen',
    view: 'AP',
    label: 'Abdomen — AP',
    region: 'Abdomen',
    laterality: 'not_applicable',
    detector: '35 × 43 cm · table Bucky',
    default_kvp: 76,
    default_mas: 20,
    default_sid_cm: 100,
    grid: 'yes',
    centring: 'Level of the iliac crests, midline',
    cr: 'Vertical, perpendicular to the detector',
    angulation: '0°',
    tolerances: { rotation: 3, centring: 15 },
    focus: { x: 0.5, y: 0.5 },
    field: { w: 40, h: 52 },
    prep: [
      'Confirm identity; check for pregnancy status where relevant.',
      'Remove metal objects and thick clothing from the abdomen.',
      'Ask the patient to empty the bladder if a pelvic view is also requested.',
    ],
    positioning: [
      'Patient supine, arms raised above the head.',
      'Detector centred at the level of the iliac crests, table horizontal.',
      'Legs extended, hips level, no rotation of the pelvis.',
      'Collimate from the diaphragm to the symphysis pubis.',
      'Expose at the end of expiration.',
    ],
    criteria: [
      'Diaphragm to symphysis pubis included',
      'Both iliac crests equidistant from the midline',
      'Psoas shadows and bowel gas pattern visible',
      'Adequate contrast across all regions',
      'No motion blur',
    ],
    defect:
      'Symphysis pubis cut off inferiorly, motion artefact across the bowel gas pattern and the hands projected over the upper abdomen.',
    reference: `${M}342cc56f0_generated_image.png`,
    radiograph: {
      accepted: `${M}28fb3719a_generated_image.png`,
      rejected: `${M}4a350e6cf_generated_image.png`,
    },
    detections: [
      { x: 30, y: 76, w: 40, h: 20, label: 'Symphysis pubis cut off', severity: 'high' },
      { x: 26, y: 28, w: 48, h: 30, label: 'Motion artefact', severity: 'medium' },
      { x: 30, y: 12, w: 40, h: 16, label: 'Hands over upper abdomen', severity: 'low' },
    ],
  },
];

export const REGIONS = Array.from(new Set(PROJECTIONS.map((item) => item.region)));

export const projectionsInRegion = (region) => PROJECTIONS.filter((item) => item.region === region);

export const projectionByKey = (key) => PROJECTIONS.find((item) => item.key === key) || PROJECTIONS[0];

export const projectionFor = (value) => {
  const raw = String(value || '').toLowerCase();
  return (
    PROJECTIONS.find((item) => item.label.toLowerCase() === raw) ||
    PROJECTIONS.find(
      (item) => raw.includes(item.name.toLowerCase()) && raw.includes(item.view.toLowerCase())
    ) ||
    PROJECTIONS[0]
  );
};