const M = 'https://media.base44.com/images/public/6af445986703f21f765252f1/';
const commons = (file) => `https://commons.wikimedia.org/wiki/File:${file}`;
const kneeSource = 'https://radiography101.org/articles/knee-xray-positioning-guide';

// Educational protocol examples, not validated technique charts or hardware instructions.
export const PROJECTIONS = [
  {
    key: 'knee_ap', name: 'Knee', view: 'AP', label: 'Knee — AP', region: 'Lower limb', laterality: 'right',
    detector: '24 × 30 cm · tabletop receptor', default_kvp: 66, default_mas: 4, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: '1.3 cm distal to the patellar apex', cr: 'Anterior to posterior; perpendicular for average habitus',
    angulation: '0° in this demo; 3–5° caudad/cephalad depends on ASIS-to-table distance, not weight alone', angle: 0,
    tolerances: { rotation: 2.5, centring: 8, angle: 2 }, flexion: [0, 5], focus: { x: 0.5, y: 0.55 }, field: { w: 38, h: 58 },
    reference: { male: `${M}e55877066_generated_image.png`, female: `${M}246d8cbff_generated_image.png` }, field_cm: [18, 24], cameraDirection: 'Overhead tube → anterior knee → table receptor',
    prep: ['Confirm patient, examination and side marker.', 'Remove obscuring clothing or metal; never force an injured limb.'],
    positioning: ['Supine; leg extended as tolerated.', 'Femoral epicondyles parallel to the receptor; patella faces the tube.', 'Centre 1.3 cm below the patellar apex.', 'Include distal femur, proximal tibia/fibula and soft-tissue margins.'],
    criteria: ['Distal femur and proximal tibia/fibula included', 'Symmetric condyles and tibial spines', 'Patella superimposed on distal femur', 'Fibular head partially superimposed', 'Sharp trabeculae and soft-tissue margins'],
    limbLabel: 'Leg extended / epicondyles parallel', rotationCriterion: 'Femoral and tibial condyles symmetric', cutoff: 'proximal tibia and fibula',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/32cde5dec_knee-ap.jpg',
    imageSource: commons('X-ray_of_a_normal_knee_by_anteroposterior_projection.jpg'), credit: 'Mikael Häggström · CC0', source: kneeSource,
  },
  {
    key: 'knee_lat', name: 'Knee', view: 'Lateral', label: 'Knee — Lateral', region: 'Lower limb', laterality: 'right',
    detector: '24 × 30 cm · tabletop receptor', default_kvp: 66, default_mas: 4, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: '2.5 cm distal to the medial femoral epicondyle', cr: 'Medial to lateral; 5–7° cephalad', angulation: '5–7° cephalad; 6° in this demo', angle: 6,
    tolerances: { rotation: 2, centring: 8, angle: 1 }, flexion: [20, 30], focus: { x: 0.5, y: 0.54 }, field: { w: 46, h: 58 },
    reference: { male: `${M}1f43c51ae_generated_image.png`, female: `${M}11ba02c91_generated_image.png` }, field_cm: [18, 24], cameraDirection: 'Overhead tube → medial knee → lateral surface / receptor',
    prep: ['Confirm patient and side marker.', 'Routine non-trauma lateral only; do not force flexion after trauma.'],
    positioning: ['Affected side down; opposite leg drawn back.', 'Flex the knee 20–30° if safe.', 'Epicondyles perpendicular to the receptor; condyles superimposed.', 'Centre 2.5 cm below medial epicondyle with 5–7° cephalad CR.'],
    criteria: ['Distal femur and proximal tibia included', 'Femoral condyles superimposed', 'Patella in profile', 'Patellofemoral joint demonstrated', 'No motion blur'],
    limbLabel: 'Affected side down / epicondyles perpendicular', rotationCriterion: 'Femoral condyles superimposed; patella in profile', cutoff: 'proximal tibia',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/90f49bd32_knee-lateral.jpg',
    imageSource: commons('X-ray_of_a_normal_knee_by_lateral_projection.jpg'), credit: 'Mikael Häggström · CC0', source: kneeSource,
  },
  {
    key: 'chest_pa', name: 'Chest', view: 'PA', label: 'Chest — PA', region: 'Thorax', laterality: 'not_applicable',
    detector: '35 × 43 cm · upright Bucky', default_kvp: 120, default_mas: 2, default_ma: 320, default_sid_cm: 180, grid: 'yes', aec: true,
    centring: 'T7 midline, approximately the inferior scapular angle', cr: 'Horizontal, posterior to anterior; perpendicular to receptor', angulation: '0°', angle: 0,
    tolerances: { rotation: 3, centring: 15, angle: 2 }, focus: { x: 0.5, y: 0.48 }, field: { w: 60, h: 70 },
    reference: { male: `${M}a01471036_generated_image.png`, female: `${M}2ae6c592a_generated_image.png` }, field_cm: [35, 43], cameraDirection: 'Horizontal tube → patient back → chest / upright receptor',
    prep: ['Remove necklaces and radiopaque clothing.', 'Explain full-inspiration breath hold.'],
    positioning: ['Erect, anterior chest against the upright receptor.', 'Chin raised; shoulders depressed and rolled forward.', 'Hands at hips; move scapulae out of lung fields.', 'Centre T7; include apices and both costophrenic angles; full inspiration.'],
    criteria: ['Apices and both costophrenic angles included', 'Clavicular heads equidistant from spine', 'Scapulae clear of lungs', 'Adequate inspiration, about 10 posterior ribs', 'Sharp lung and diaphragm margins'],
    limbLabel: 'Shoulders rolled forward / scapulae clear', rotationCriterion: 'Clavicular heads equidistant from spine', cutoff: 'costophrenic angles',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/1a1dd72a1_chest-pa.jpg',
    imageSource: commons('Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg'), credit: 'Mikael Häggström · CC0', source: 'https://radiopaedia.org/articles/chest-pa-view-1',
  },
  {
    key: 'chest_ap', name: 'Chest', view: 'AP', label: 'Chest — AP', region: 'Thorax', laterality: 'not_applicable',
    detector: '35 × 43 cm · receptor behind thorax', default_kvp: 110, default_mas: 3.2, default_ma: 320, default_sid_cm: 120, grid: 'yes', aec: false,
    centring: 'T7 midline, approximately 8–10 cm below jugular notch', cr: 'Anterior to posterior; perpendicular to sternum / receptor', angulation: '0° for this supine demo; adapt to patient / receptor orientation', angle: 0,
    tolerances: { rotation: 4, centring: 20, angle: 2 }, focus: { x: 0.5, y: 0.48 }, field: { w: 64, h: 72 },
    reference: { male: `${M}45db2b70f_generated_image.png`, female: `${M}4d0ec9262_generated_image.png` }, field_cm: [35, 43], cameraDirection: 'Overhead tube → anterior thorax → receptor behind patient',
    prep: ['Remove metal over thorax.', 'Confirm patient can tolerate supine positioning.'],
    positioning: ['Supine for this example; receptor behind thorax.', 'Shoulders level; arms clear of the lateral chest.', 'Centre at T7, about 8–10 cm below jugular notch.', 'Include apices and costophrenic angles; full inspiration if tolerated.'],
    criteria: ['Apices and costophrenic angles included', 'Clavicular symmetry / no rotation', 'Adequate inspiration for patient condition', 'Mediastinum adequately penetrated', 'Sharp diaphragm and vascular margins'],
    limbLabel: 'Arms clear of thorax / shoulders level', rotationCriterion: 'Clavicular symmetry without excessive rotation', cutoff: 'costophrenic angles',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/08f48e2f5_chest-ap.jpg', imageSource: commons('Normal_AP.JPG'), credit: 'James Heilman, MD · CC BY 3.0',
    source: 'https://www.auntminnie.com/clinical-news/article/15559130/mastering-ap-and-lateral-positioning-for-chest-xray',
  },
  {
    key: 'abdomen_ap', name: 'Abdomen', view: 'AP', label: 'Abdomen — AP', region: 'Abdomen', laterality: 'not_applicable',
    detector: '35 × 43 cm · table Bucky', default_kvp: 78, default_mas: 25, default_ma: 250, default_sid_cm: 100, grid: 'yes', aec: true,
    centring: 'Midline at the level of the iliac crests', cr: 'Vertical, anterior to posterior; perpendicular to receptor', angulation: '0°', angle: 0,
    tolerances: { rotation: 3, centring: 15, angle: 2 }, focus: { x: 0.5, y: 0.58 }, field: { w: 66, h: 74 },
    reference: { male: `${M}a072652d8_generated_image.png`, female: `${M}04948d190_generated_image.png` }, field_cm: [35, 43], cameraDirection: 'Overhead tube → anterior abdomen → table receptor',
    prep: ['Check pregnancy status where relevant under local policy.', 'Remove radiopaque objects; explain suspended expiration.'],
    positioning: ['Supine; shoulders and hips equidistant from table.', 'Arms outside the abdominal field; legs extended.', 'Centre at iliac-crest level, midsagittal plane.', 'Include lateral abdominal walls and pubic symphysis; diaphragm if possible. Larger patients may require two images.', 'Expose on suspended expiration.'],
    criteria: ['Required abdominal and pelvic coverage', 'Symmetric iliac crests and obturator foramina', 'Psoas margins / bowel detail demonstrated', 'No respiratory motion blur', 'No external artifact over required anatomy'],
    limbLabel: 'Arms outside field / hips level', rotationCriterion: 'Iliac crests and obturator foramina symmetric', cutoff: 'inferior pelvis / pubic symphysis',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/cd704a467_abdomen-ap.jpg', imageSource: commons('Medical_X-Ray_imaging_ALP02_nevit.jpg'), credit: 'Nevit Dilmen · CC BY-SA 3.0',
    source: 'https://radiopaedia.org/articles/abdomen-ap-supine-view-1',
  },
];

export const REGIONS = Array.from(new Set(PROJECTIONS.map((item) => item.region)));

export const projectionsInRegion = (region) => PROJECTIONS.filter((item) => item.region === region);

export const projectionByKey = (key) => PROJECTIONS.find((item) => item.key === key) || PROJECTIONS[0];

export const referenceFor = (p, sex) => (sex === 'female' ? p.reference.female : p.reference.male);

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