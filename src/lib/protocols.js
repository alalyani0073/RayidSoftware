const M = 'https://media.base44.com/images/public/6af445986703f21f765252f1/';
const commons = (file) => `https://commons.wikimedia.org/wiki/File:${file}`;

// Every projection carries its own collimation limits, centring landmark and
// border anatomy. `field` holds the four required shutter edges (left, right,
// superior, inferior) as a percentage of the tube-mounted camera frame, and
// `borders` names the anatomy each border must include, so the collimation
// engine can explain a specific correction for every projection.
// `support` names the receptor in use (upright Bucky, table Bucky or tabletop)
// and `patientView` how the patient presents to the tube-mounted camera, so the
// reference view is always the scene seen down the central ray.
const PREP = ['Confirm patient, examination and side marker.', 'Remove obscuring clothing, jewellery or metal; never force an injured limb.'];

// Tube-mounted camera reference supplied for the AP tibia/fibula projection:
// overhead view down the central ray onto the lower leg lying on the tabletop
// receptor, foot dorsiflexed, unaffected leg clear of the field.
const TIBIA_AP_REFERENCE = 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/dabb119cd_tibia-ap.jpg';

// Tube-mounted camera reference supplied for the AP chest projection: the
// patient stands with the sternum toward the tube, chest against the upright
// receptor, hands on hips so the scapulae clear the lung fields.
const CHEST_AP_REFERENCE = 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/8289f02ce_chest-ap.jpg';

// Tube-mounted camera reference supplied for the AP pelvis projection, with the
// collimation field and central ray already marked on the image: the supine
// patient is viewed down the central ray, iliac crests to lesser trochanters.
const PELVIS_AP_REFERENCE = 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/5e243a3bd_pelvis-ap.png';

// Tube-mounted camera reference supplied for the AP ankle projection, with the
// collimator light field and the laser central ray marked on the image: the
// foot is dorsiflexed to a right angle, malleoli equidistant from the receptor.
const ANKLE_AP_REFERENCE = 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/c3a24438a_ankle-ap.png';

// Tube-mounted camera reference supplied for the AP knee projection: overhead
// view down the central ray onto the extended leg on the tabletop receptor, the
// knee joint centred with the patella facing the tube.
// Tube-mounted camera reference supplied for the PA chest projection: the
// patient stands back to the camera, anterior chest against the upright
// receptor, hands on hips so the scapulae clear the lung fields.
const CHEST_PA_REFERENCE = 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/868cdf153_chest-pa.png';

// Tube-mounted camera reference supplied for the lateral knee projection: the
// affected side is toward the upright receptor, knee flexed, the joint seen in
// profile down the horizontal central ray.
const KNEE_LAT_REFERENCE = 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/431096365_knee-lateral.png';

const KNEE_AP_REFERENCE = 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/338f04360_knee-ap.png';

export const PROJECTIONS = [
  {
    key: 'chest_pa', name: 'Chest', view: 'PA', label: 'Chest — PA', region: 'Thorax', laterality: 'not_applicable',
    detector: '35 × 43 cm · upright Bucky', support: 'Upright Bucky', patientView: 'back toward tube',
    default_kvp: 120, default_mas: 2, default_ma: 320, default_sid_cm: 180, grid: 'yes', aec: true,
    centring: 'T7 midline, at the level of the inferior scapular angles', cr: 'Horizontal, posterior to anterior; perpendicular to the receptor',
    angulation: '0°', angle: 0, tolerances: { rotation: 3, centring: 15, angle: 2 },
    focus: { x: 0.5, y: 0.5 }, field: { l: 26, r: 74, t: 26, b: 74 }, field_cm: [35, 43],
    borders: { t: 'lung apices', b: 'costophrenic angles', l: 'left lateral chest wall', r: 'right lateral chest wall' },
    reference: { male: CHEST_PA_REFERENCE, female: CHEST_PA_REFERENCE }, cameraDirection: 'Horizontal tube → patient back → chest / upright receptor',
    prep: PREP, positioning: ['Erect at the upright Bucky, back against the receptor, feet slightly apart.', 'Chin raised; shoulders depressed and rolled forward.', 'Hands at hips; move scapulae out of lung fields.', 'Centre T7; include apices and both costophrenic angles; full inspiration.'],
    criteria: ['Apices and both costophrenic angles included', 'Clavicular heads equidistant from spine', 'Scapulae clear of lungs', 'Adequate inspiration, about 10 posterior ribs', 'Sharp lung and diaphragm margins'],
    limbLabel: 'Shoulders rolled forward / scapulae clear', rotationCriterion: 'Clavicular heads equidistant from spine', cutoff: 'costophrenic angles',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/1a1dd72a1_chest-pa.jpg',
    imageSource: commons('Normal_posteroanterior_(PA)_chest_radiograph_(X-ray).jpg'), credit: 'Mikael Häggström · CC0',
  },
  {
    key: 'chest_ap', name: 'Chest', view: 'AP', label: 'Chest — AP', region: 'Thorax', laterality: 'not_applicable',
    detector: '35 × 43 cm · receptor behind thorax', support: 'Table Bucky', patientView: 'supine, front toward tube',
    default_kvp: 110, default_mas: 3.2, default_ma: 320, default_sid_cm: 120, grid: 'yes', aec: false,
    centring: 'T7 midline, about 8–10 cm below the jugular notch', cr: 'Anterior to posterior; perpendicular to the sternum and receptor',
    angulation: '0° supine; adapt to patient / receptor orientation', angle: 0, tolerances: { rotation: 4, centring: 20, angle: 2 },
    focus: { x: 0.5, y: 0.52 }, field: { l: 29, r: 71, t: 25, b: 82 }, field_cm: [35, 43],
    borders: { t: 'lung apices', b: 'costophrenic angles', l: 'left lateral chest wall', r: 'right lateral chest wall' },
    reference: { male: CHEST_AP_REFERENCE, female: CHEST_AP_REFERENCE }, cameraDirection: 'Overhead tube → anterior thorax → receptor behind patient',
    prep: PREP, positioning: ['Supine on the table; receptor in the table Bucky behind the thorax.', 'Shoulders level; arms abducted clear of the lateral chest.', 'Centre at T7, about 8–10 cm below the jugular notch.', 'Include apices and costophrenic angles; full inspiration if tolerated.'],
    criteria: ['Apices and costophrenic angles included', 'Clavicular symmetry / no rotation', 'Adequate inspiration for patient condition', 'Mediastinum adequately penetrated', 'Sharp diaphragm and vascular margins'],
    limbLabel: 'Arms clear of thorax / shoulders level', rotationCriterion: 'Clavicular symmetry without excessive rotation', cutoff: 'costophrenic angles',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/08f48e2f5_chest-ap.jpg',
    imageSource: commons('Normal_AP.JPG'), credit: 'James Heilman, MD · CC BY 3.0',
  },
  {
    key: 'abdomen_ap', name: 'Abdomen', view: 'AP', label: 'Abdomen — AP', region: 'Abdomen', laterality: 'not_applicable',
    detector: '35 × 43 cm · table Bucky', support: 'Table Bucky', patientView: 'supine, front toward tube',
    default_kvp: 78, default_mas: 25, default_ma: 250, default_sid_cm: 100, grid: 'yes', aec: true,
    centring: 'Midline at the level of the iliac crests (L4)', cr: 'Vertical, anterior to posterior; perpendicular to the receptor',
    angulation: '0°', angle: 0, tolerances: { rotation: 3, centring: 15, angle: 2 },
    focus: { x: 0.5, y: 0.58 }, field: { l: 18, r: 82, t: 5, b: 91 }, field_cm: [35, 43],
    borders: { t: 'diaphragmatic domes', b: 'pubic symphysis and inferior pelvis', l: 'left lateral abdominal wall', r: 'right lateral abdominal wall' },
    reference: { male: `${M}afe8b4a60_generated_image.png`, female: `${M}b24139bde_generated_image.png` }, cameraDirection: 'Overhead tube → anterior abdomen → table receptor',
    prep: PREP, positioning: ['Supine on the table; shoulders and hips equidistant from the table.', 'Arms raised clear of the abdomen; legs extended and together.', 'Centre at iliac-crest level, midsagittal plane.', 'Include lateral abdominal walls and pubic symphysis; diaphragm if possible.', 'Expose on suspended expiration.'],
    criteria: ['Required abdominal and pelvic coverage', 'Symmetric iliac crests and obturator foramina', 'Psoas margins / bowel detail demonstrated', 'No respiratory motion blur', 'No external artifact over required anatomy'],
    limbLabel: 'Arms raised / hips level', rotationCriterion: 'Iliac crests and obturator foramina symmetric', cutoff: 'pubic symphysis',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/cd704a467_abdomen-ap.jpg',
    imageSource: commons('Medical_X-Ray_imaging_ALP02_nevit.jpg'), credit: 'Nevit Dilmen · CC BY-SA 3.0',
  },
  {
    key: 'shoulder_ap', name: 'Shoulder', view: 'AP', label: 'Shoulder — AP', region: 'Upper limb', laterality: 'right',
    detector: '24 × 30 cm · upright Bucky', support: 'Upright Bucky', patientView: 'front toward tube',
    default_kvp: 70, default_mas: 6, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Coracoid process, about 2.5 cm inferior to the acromioclavicular joint', cr: 'Horizontal, perpendicular to the coracoid; 0° for the true AP projection',
    angulation: '0°; 15–20° caudal only if the patient cannot rotate', angle: 0, tolerances: { rotation: 3, centring: 10, angle: 2 },
    focus: { x: 0.5, y: 0.3 }, field: { l: 15, r: 85, t: 7, b: 91 }, field_cm: [18, 24],
    borders: { t: 'acromioclavicular joint and acromion', b: 'proximal humeral diaphysis', l: 'medial glenoid margin', r: 'greater tuberosity and lateral soft tissue' },
    reference: { male: `${M}41b0e92b0_generated_image.png`, female: `${M}41b0e92b0_generated_image.png` }, cameraDirection: 'Horizontal tube → anterior shoulder → upright Bucky',
    prep: PREP, positioning: ['Erect at the upright Bucky, facing the receptor; no tabletop exposure.', 'Affected arm alongside the body, elbow extended, palm supinated.', 'Shoulder at the same height as the receptor, no patient rotation.', 'Centre the coracoid process, 2.5 cm below the AC joint; include the AC joint to proximal humerus.'],
    criteria: ['Acromioclavicular joint and glenoid included', 'Humeral head and greater tuberosity in profile', 'No overlap of the humeral head and glenoid', 'Distal clavicle and acromion demonstrated', 'Sharp trabeculae of the proximal humerus'],
    limbLabel: 'Arm alongside body / palm supinated', rotationCriterion: 'Glenohumeral joint space open without overlap', cutoff: 'greater tuberosity',
    radiograph: `${M}0b56ccf25_generated_image.png`, imageSource: `${M}0b56ccf25_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'humerus_ap', name: 'Humerus', view: 'AP', label: 'Humerus — AP', region: 'Upper limb', laterality: 'right',
    detector: '24 × 40 cm · upright Bucky', support: 'Upright Bucky', patientView: 'front toward tube',
    default_kvp: 70, default_mas: 8, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Mid-humerus, midway between the acromion and the olecranon', cr: 'Horizontal, perpendicular to the mid-humeral shaft',
    angulation: '0°', angle: 0, tolerances: { rotation: 4, centring: 15, angle: 2 },
    focus: { x: 0.5, y: 0.5 }, field: { l: 34, r: 66, t: 5, b: 93 }, field_cm: [18, 40],
    borders: { t: 'glenohumeral joint', b: 'elbow joint', l: 'medial soft-tissue margin', r: 'lateral soft-tissue margin' },
    reference: { male: `${M}fc0248934_generated_image.png`, female: `${M}fc0248934_generated_image.png` }, cameraDirection: 'Horizontal tube → anterior humerus → upright Bucky',
    prep: PREP, positioning: ['Erect at the upright Bucky, facing the receptor, arm at the side.', 'Arm extended with the forearm supinated and the humerus in neutral rotation.', 'Both joints must be included on one image in the anatomical position.', 'Centre the mid-humeral shaft; include the shoulder and elbow joints.'],
    criteria: ['Glenohumeral and elbow joints included', 'Whole humeral shaft demonstrated', 'No rotation of the humeral shaft', 'Elbow joint space visible', 'Sharp cortical and trabecular detail'],
    limbLabel: 'Arm extended / palm supinated', rotationCriterion: 'Humeral epicondyles in the same plane as the receptor', cutoff: 'elbow joint',
    radiograph: `${M}c14e974c9_generated_image.png`, imageSource: `${M}c14e974c9_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'elbow_ap', name: 'Elbow', view: 'AP', label: 'Elbow — AP', region: 'Upper limb', laterality: 'right',
    detector: '18 × 24 cm · tabletop receptor', support: 'Tabletop', patientView: 'arm supinated on cassette',
    default_kvp: 62, default_mas: 3.2, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Elbow joint space, at the level of the epicondyles', cr: 'Perpendicular to the elbow joint',
    angulation: '0°', angle: 0, tolerances: { rotation: 3, centring: 10, angle: 2 },
    focus: { x: 0.5, y: 0.5 }, field: { l: 28, r: 72, t: 8, b: 90 }, field_cm: [18, 24],
    borders: { t: 'distal humerus and both epicondyles', b: 'proximal radius and ulna', l: 'medial epicondyle', r: 'lateral epicondyle and radial head' },
    reference: { male: `${M}6176addd6_generated_image.png`, female: `${M}6176addd6_generated_image.png` }, cameraDirection: 'Overhead tube → anterior elbow → tabletop receptor',
    prep: PREP, positioning: ['Seated at the table; elbow fully extended if possible, arm flat on the cassette.', 'Hand supinated so epicondyles are parallel to the receptor.', 'Centre the joint space at epicondylar level.', 'Include distal humerus and proximal radius and ulna.'],
    criteria: ['Distal humerus and both epicondyles included', 'Radial head, neck and tuberosity demonstrated', 'Olecranon within the olecranon fossa', 'No rotation (epicondyles in profile)', 'Sharp joint space'],
    limbLabel: 'Elbow extended / hand supinated', rotationCriterion: 'Epicondyles in profile without rotation', cutoff: 'proximal radius',
    radiograph: `${M}99a2f6c59_generated_image.png`, imageSource: `${M}99a2f6c59_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'forearm_ap', name: 'Forearm', view: 'AP', label: 'Forearm — AP', region: 'Upper limb', laterality: 'right',
    detector: '24 × 40 cm · tabletop receptor', support: 'Tabletop', patientView: 'arm supinated on cassette',
    default_kvp: 62, default_mas: 3.2, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Mid-forearm, midway between the elbow and the wrist', cr: 'Perpendicular to the mid-forearm',
    angulation: '0°', angle: 0, tolerances: { rotation: 3, centring: 12, angle: 2 },
    focus: { x: 0.5, y: 0.5 }, field: { l: 34, r: 66, t: 6, b: 92 }, field_cm: [14, 40],
    borders: { t: 'elbow joint', b: 'radiocarpal joint', l: 'medial ulnar margin', r: 'lateral radial margin' },
    reference: { male: `${M}9df608c95_generated_image.png`, female: `${M}9df608c95_generated_image.png` }, cameraDirection: 'Overhead tube → anterior forearm → tabletop receptor',
    prep: PREP, positioning: ['Seated at the table; forearm fully extended, hand supinated and flat.', 'Both the wrist and elbow joints must be on the image.', 'Centre the mid-forearm.', 'Include the radiocarpal and elbow joints.'],
    criteria: ['Elbow and wrist joints included', 'Radius and ulna demonstrated along their full length', 'Radius and ulna not superimposed at the wrist', 'No rotation of the forearm', 'Sharp cortical detail'],
    limbLabel: 'Forearm extended / hand supinated', rotationCriterion: 'Radius and ulna parallel without cross-over', cutoff: 'radiocarpal joint',
    radiograph: `${M}d4f371bd9_generated_image.png`, imageSource: `${M}d4f371bd9_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'wrist_pa', name: 'Wrist', view: 'PA', label: 'Wrist — PA', region: 'Upper limb', laterality: 'right',
    detector: '18 × 24 cm · tabletop receptor', support: 'Tabletop', patientView: 'palm down on cassette',
    default_kvp: 55, default_mas: 2.5, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Mid-carpal region, at the level of the scaphoid and lunate', cr: 'Perpendicular to the mid-carpal area',
    angulation: '0°', angle: 0, tolerances: { rotation: 2, centring: 8, angle: 2 },
    focus: { x: 0.5, y: 0.5 }, field: { l: 27, r: 73, t: 10, b: 90 }, field_cm: [12, 18],
    borders: { t: 'distal radioulnar joint', b: 'proximal metacarpals', l: 'ulnar styloid', r: 'radial styloid' },
    reference: { male: `${M}b731e4a30_generated_image.png`, female: `${M}b731e4a30_generated_image.png` }, cameraDirection: 'Overhead tube → dorsal wrist → tabletop receptor',
    prep: PREP, positioning: ['Seated; forearm resting on the table, palm down.', 'Wrist in the true PA position without ulnar deviation.', 'Centre the mid-carpal region.', 'Include the distal radius and ulna and the proximal metacarpals.'],
    criteria: ['Distal radius and ulna included', 'All carpal bones demonstrated', 'Proximal metacarpals included', 'Uniform joint spaces without rotation', 'Sharp trabeculae of the carpus'],
    limbLabel: 'Forearm supported / palm flat', rotationCriterion: 'Distal radius and ulna not superimposed', cutoff: 'ulnar styloid',
    radiograph: `${M}36b049d24_generated_image.png`, imageSource: `${M}36b049d24_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'hand_pa', name: 'Hand', view: 'PA', label: 'Hand — PA', region: 'Upper limb', laterality: 'right',
    detector: '24 × 30 cm · tabletop receptor', support: 'Tabletop', patientView: 'palm down on cassette',
    default_kvp: 55, default_mas: 2, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Head of the third metacarpal (third metacarpophalangeal joint)', cr: 'Perpendicular to the third metacarpal head',
    angulation: '0°', angle: 0, tolerances: { rotation: 2, centring: 8, angle: 2 },
    focus: { x: 0.5, y: 0.53 }, field: { l: 20, r: 80, t: 8, b: 92 }, field_cm: [18, 24],
    borders: { t: 'distal radius and ulna', b: 'distal phalanges and fingertips', l: 'thumb and first metacarpal', r: 'fifth metacarpal and soft tissue' },
    reference: { male: `${M}6310385c3_generated_image.png`, female: `${M}6310385c3_generated_image.png` }, cameraDirection: 'Overhead tube → dorsal hand → tabletop receptor',
    prep: PREP, positioning: ['Seated; hand flat, palm down, fingers separated.', 'Centre the third metacarpophalangeal joint.', 'Include fingertips, all metacarpals and the distal radius and ulna.', 'No rotation of the hand.'],
    criteria: ['All phalanges and fingertips included', 'Distal radius and ulna included', 'All carpals and metacarpals demonstrated', 'Uniform joint spaces', 'Sharp trabecular detail'],
    limbLabel: 'Hand flat / fingers separated', rotationCriterion: 'Metacarpal heads in a straight line without rotation', cutoff: 'distal phalanges',
    radiograph: `${M}f4a2f7433_generated_image.png`, imageSource: `${M}f4a2f7433_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'pelvis_ap', name: 'Pelvis', view: 'AP', label: 'Pelvis — AP', region: 'Lower limb', laterality: 'not_applicable',
    detector: '35 × 43 cm · table Bucky', support: 'Table Bucky', patientView: 'supine, front toward tube',
    default_kvp: 80, default_mas: 20, default_ma: 250, default_sid_cm: 100, grid: 'yes', aec: true,
    centring: 'Midline, about 5 cm above the pubic symphysis, at the level of the greater trochanters', cr: 'Vertical, perpendicular to the midline at the level of the symphysis and ASIS', angulation: '0°', angle: 0,
    tolerances: { rotation: 2, centring: 12, angle: 2 },
    focus: { x: 0.505, y: 0.285 }, field: { l: 17.5, r: 83.5, t: 8, b: 58.5 }, field_cm: [35, 43],
    borders: { t: 'iliac crests', b: 'lesser trochanters and proximal femora', l: 'left iliac wing', r: 'right iliac wing' },
    reference: { male: PELVIS_AP_REFERENCE, female: PELVIS_AP_REFERENCE }, cameraDirection: 'Overhead tube → anterior pelvis → table Bucky',
    prep: PREP, positioning: ['Supine; pelvis level, both legs extended straight and slightly separated.', 'ASIS equidistant from the table; no rotation.', 'Centre about 5 cm above the pubic symphysis.', 'Include iliac crests to proximal femora.'],
    criteria: ['Iliac crests and both proximal femora included', 'Symmetric obturator foramina', 'Sacroiliac joints demonstrated', 'Pubic symphysis centred', 'Sharp trabecular detail of the pelvis'],
    limbLabel: 'Legs extended / pelvis level', rotationCriterion: 'Obturator foramina and iliac wings symmetric', cutoff: 'iliac crests',
    radiograph: `${M}aba34ce7f_generated_image.png`, imageSource: `${M}aba34ce7f_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'hip_ap', name: 'Hip', view: 'AP', label: 'Hip — AP', region: 'Lower limb', laterality: 'right',
    detector: '24 × 30 cm · table Bucky', support: 'Table Bucky', patientView: 'supine, front toward tube',
    default_kvp: 75, default_mas: 15, default_ma: 250, default_sid_cm: 100, grid: 'yes', aec: false,
    centring: 'Femoral neck, 2.5 cm distal and medial to the midpoint of the inguinal ligament', cr: 'Vertical, perpendicular to the femoral neck',
    angulation: '0°; 15° cephalad only for the lateral projection', angle: 0, tolerances: { rotation: 2, centring: 10, angle: 2 },
    focus: { x: 0.5, y: 0.42 }, field: { l: 24, r: 76, t: 10, b: 90 }, field_cm: [20, 25],
    borders: { t: 'acetabular roof and iliac crest', b: 'lesser trochanter', l: 'medial pelvic margin', r: 'greater trochanter and lateral soft tissue' },
    reference: { male: `${M}eaa2899d3_generated_image.png`, female: `${M}eaa2899d3_generated_image.png` }, cameraDirection: 'Overhead tube → anterior hip → table Bucky',
    prep: PREP, positioning: ['Supine; affected hip rotated internally 15° to profile the femoral neck.', 'Pelvis not rotated; opposite leg supported.', 'Centre the femoral neck.', 'Include the acetabular roof to the lesser trochanter.'],
    criteria: ['Acetabulum and femoral head included', 'Femoral neck in profile without shortening', 'Greater and lesser trochanters demonstrated', 'Iliac crest and proximal shaft included', 'Sharp joint space'],
    limbLabel: 'Hip internally rotated 15° / pelvis level', rotationCriterion: 'Femoral neck in profile with the greater trochanter lateral', cutoff: 'lesser trochanter',
    radiograph: `${M}29c167932_generated_image.png`, imageSource: `${M}29c167932_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'femur_ap', name: 'Femur', view: 'AP', label: 'Femur — AP', region: 'Lower limb', laterality: 'right',
    detector: '35 × 43 cm · table Bucky', support: 'Table Bucky', patientView: 'supine, front toward tube',
    default_kvp: 75, default_mas: 12, default_ma: 250, default_sid_cm: 100, grid: 'yes', aec: false,
    centring: 'Mid-femur, midway between the greater trochanter and the knee joint', cr: 'Vertical, perpendicular to the mid-femoral shaft',
    angulation: '0°', angle: 0, tolerances: { rotation: 4, centring: 15, angle: 2 },
    focus: { x: 0.5, y: 0.5 }, field: { l: 35, r: 65, t: 5, b: 93 }, field_cm: [20, 43],
    borders: { t: 'hip joint', b: 'knee joint', l: 'medial soft-tissue margin', r: 'lateral soft-tissue margin' },
    reference: { male: `${M}a1dcdb029_generated_image.png`, female: `${M}a1dcdb029_generated_image.png` }, cameraDirection: 'Overhead tube → anterior thigh → table Bucky',
    prep: PREP, positioning: ['Supine; leg extended, hip rotated internally 10–15°.', 'Both hip and knee joints are required on the image.', 'Centre the mid-femoral shaft.', 'Include the hip and knee joints.'],
    criteria: ['Hip and knee joints included', 'Whole femoral shaft demonstrated', 'Femoral neck not foreshortened', 'No rotation of the shaft', 'Sharp cortical detail'],
    limbLabel: 'Leg extended / hip internally rotated', rotationCriterion: 'Femoral neck in profile without foreshortening', cutoff: 'knee joint',
    radiograph: `${M}6b122c125_generated_image.png`, imageSource: `${M}6b122c125_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'knee_ap', name: 'Knee', view: 'AP', label: 'Knee — AP', region: 'Lower limb', laterality: 'right',
    detector: '24 × 30 cm · tabletop receptor', support: 'Tabletop', patientView: 'supine, patella toward tube',
    default_kvp: 66, default_mas: 4, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: '1.3 cm distal to the patellar apex', cr: 'Anterior to posterior; perpendicular for average habitus',
    angulation: '0°; 3–5° caudad/cephalad depends on ASIS-to-table distance, not weight alone', angle: 0,
    tolerances: { rotation: 2.5, centring: 8, angle: 2 }, flexion: [0, 5],
    focus: { x: 0.5, y: 0.33 }, field: { l: 33, r: 67, t: 6, b: 62 }, field_cm: [18, 24],
    borders: { t: 'distal femoral metaphysis', b: 'proximal tibial metaphysis and tibial tuberosity', l: 'medial soft-tissue margin', r: 'fibular head and lateral soft tissue' },
    reference: { male: KNEE_AP_REFERENCE, female: KNEE_AP_REFERENCE }, cameraDirection: 'Overhead tube → anterior knee → table receptor',
    prep: PREP, positioning: ['Supine; leg extended as tolerated.', 'Femoral epicondyles parallel to the receptor; patella faces the tube.', 'Centre 1.3 cm below the patellar apex.', 'Include distal femur, proximal tibia/fibula and soft-tissue margins.'],
    criteria: ['Distal femur and proximal tibia/fibula included', 'Symmetric condyles and tibial spines', 'Patella superimposed on distal femur', 'Fibular head partially superimposed', 'Sharp trabeculae and soft-tissue margins'],
    limbLabel: 'Leg extended / epicondyles parallel', rotationCriterion: 'Femoral and tibial condyles symmetric', cutoff: 'proximal tibia and fibula',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/32cde5dec_knee-ap.jpg',
    imageSource: commons('X-ray_of_a_normal_knee_by_anteroposterior_projection.jpg'), credit: 'Mikael Häggström · CC0',
  },
  {
    key: 'knee_lat', name: 'Knee', view: 'Lateral', label: 'Knee — Lateral', region: 'Lower limb', laterality: 'right',
    detector: '24 × 30 cm · tabletop receptor', support: 'Tabletop', patientView: 'side toward tube',
    default_kvp: 66, default_mas: 4, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: '2.5 cm distal to the medial femoral epicondyle', cr: 'Horizontal, medial to lateral; 5–7° cephalad',
    angulation: '5–7° cephalad; 6° for this projection', angle: 6, tolerances: { rotation: 2, centring: 8, angle: 1 }, flexion: [20, 30],
    focus: { x: 0.655, y: 0.3 }, field: { l: 50, r: 80, t: 15.5, b: 44.5 }, field_cm: [18, 24],
    borders: { t: 'distal femoral metaphysis', b: 'proximal tibial metaphysis', l: 'anterior patella and soft tissue', r: 'posterior femoral and tibial condyles' },
    reference: { male: KNEE_LAT_REFERENCE, female: KNEE_LAT_REFERENCE }, cameraDirection: 'Horizontal tube → medial knee → lateral surface / receptor',
    prep: PREP, positioning: ['Affected side down on the cassette; opposite leg drawn back.', 'Flex the knee 20–30° if safe.', 'Epicondyles perpendicular to the receptor; condyles superimposed.', 'Centre 2.5 cm below the medial epicondyle with 5–7° cephalad CR.'],
    criteria: ['Distal femur and proximal tibia included', 'Femoral condyles superimposed', 'Patella in profile', 'Patellofemoral joint demonstrated', 'No motion blur'],
    limbLabel: 'Affected side down / epicondyles perpendicular', rotationCriterion: 'Femoral condyles superimposed; patella in profile', cutoff: 'proximal tibia',
    radiograph: 'https://base44.app/api/apps/6af445986703f21f765252f1/files/mp/public/6af445986703f21f765252f1/90f49bd32_knee-lateral.jpg',
    imageSource: commons('X-ray_of_a_normal_knee_by_lateral_projection.jpg'), credit: 'Mikael Häggström · CC0',
  },
  {
    key: 'tibia_ap', name: 'Tibia & Fibula', view: 'AP', label: 'Tibia & Fibula — AP', region: 'Lower limb', laterality: 'right',
    detector: '24 × 40 cm · tabletop receptor', support: 'Tabletop', patientView: 'supine, front toward tube',
    default_kvp: 66, default_mas: 6, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Mid-shaft of the tibia, midway between the knee and the ankle', cr: 'Perpendicular to the mid-tibial shaft',
    angulation: '0°', angle: 0, tolerances: { rotation: 3, centring: 15, angle: 2 },
    focus: { x: 0.51, y: 0.51 }, field: { l: 15.5, r: 79.5, t: 44, b: 64 }, field_cm: [40, 14],
    borders: { t: 'posterior soft-tissue margin', b: 'anterior soft-tissue margin', l: 'knee joint', r: 'ankle joint' },
    reference: { male: TIBIA_AP_REFERENCE, female: TIBIA_AP_REFERENCE }, cameraDirection: 'Overhead tube → anterior lower leg → tabletop receptor',
    prep: PREP, positioning: ['Supine; leg extended, toes pointing up.', 'Both knee and ankle joints are required on the image.', 'Centre the mid-tibial shaft.', 'Include the knee and ankle joints.'],
    criteria: ['Knee and ankle joints included', 'Tibia and fibula demonstrated along their length', 'No rotation of the leg', 'Ankle mortise visible', 'Sharp cortical detail'],
    limbLabel: 'Leg extended / toes up', rotationCriterion: 'Tibia and fibula side by side without overlap', cutoff: 'ankle joint',
    radiograph: `${M}ac228431c_generated_image.png`, imageSource: `${M}ac228431c_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'ankle_ap', name: 'Ankle', view: 'AP', label: 'Ankle — AP', region: 'Lower limb', laterality: 'right',
    detector: '18 × 24 cm · tabletop receptor', support: 'Tabletop', patientView: 'supine, front toward tube',
    default_kvp: 60, default_mas: 3.2, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Midway between the medial and lateral malleoli', cr: 'Perpendicular to the ankle joint, midway between the malleoli',
    angulation: '0°; 5° cephalad for the mortise view', angle: 0, tolerances: { rotation: 2, centring: 8, angle: 2 },
    focus: { x: 0.495, y: 0.505 }, field: { l: 28.3, r: 70.7, t: 17.8, b: 88.5 }, field_cm: [15, 18],
    borders: { t: 'distal tibiofibular joint', b: 'proximal talus and metatarsal bases', l: 'medial malleolus', r: 'lateral malleolus' },
    reference: { male: ANKLE_AP_REFERENCE, female: ANKLE_AP_REFERENCE }, cameraDirection: 'Overhead tube → anterior ankle → tabletop receptor',
    prep: PREP, positioning: ['Supine with the knee flexed, foot flat on the cassette; foot dorsiflexed to a right angle.', 'No rotation of the leg; malleoli equidistant from the receptor.', 'Centre midway between the malleoli.', 'Include distal tibia and fibula, talus and proximal metatarsals.'],
    criteria: ['Both malleoli included', 'Ankle mortise demonstrated', 'Distal tibiofibular joint visible', 'Proximal talus and metatarsal bases included', 'Sharp joint space'],
    limbLabel: 'Foot dorsiflexed to 90° / no rotation', rotationCriterion: 'Malleoli equidistant from the receptor', cutoff: 'lateral malleolus',
    radiograph: `${M}e9bb53c08_generated_image.png`, imageSource: `${M}e9bb53c08_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'foot_ap', name: 'Foot', view: 'AP', label: 'Foot — AP', region: 'Lower limb', laterality: 'right',
    detector: '18 × 24 cm · tabletop receptor', support: 'Tabletop', patientView: 'sole on cassette',
    default_kvp: 55, default_mas: 2.5, default_ma: 200, default_sid_cm: 100, grid: 'no', aec: false,
    centring: 'Base of the third metatarsal', cr: 'Perpendicular to the base of the third metatarsal', angulation: '0°', angle: 0,
    tolerances: { rotation: 2, centring: 8, angle: 2 },
    focus: { x: 0.5, y: 0.45 }, field: { l: 26, r: 74, t: 10, b: 92 }, field_cm: [18, 24],
    borders: { t: 'calcaneus and hindfoot', b: 'distal phalanges of the toes', l: 'medial border of the first metatarsal', r: 'lateral border of the fifth metatarsal' },
    reference: { male: `${M}ff942dc57_generated_image.png`, female: `${M}ff942dc57_generated_image.png` }, cameraDirection: 'Overhead tube → dorsal foot → tabletop receptor',
    prep: PREP, positioning: ['Seated with the knee flexed; sole of the foot flat on the cassette.', 'Foot upright, no rotation.', 'Centre the base of the third metatarsal.', 'Include the calcaneus to the tips of the toes.'],
    criteria: ['All metatarsals and phalanges included', 'Calcaneus and tarsal bones demonstrated', 'First and fifth metatarsal borders included', 'Uniform joint spaces', 'Sharp trabecular detail'],
    limbLabel: 'Sole flat on receptor / no rotation', rotationCriterion: 'Metatarsals parallel without overlap', cutoff: 'distal phalanges',
    radiograph: `${M}59cb66aaf_generated_image.png`, imageSource: `${M}59cb66aaf_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'cspine_lat', name: 'Cervical spine', view: 'Lateral', label: 'Cervical spine — Lateral', region: 'Spine', laterality: 'not_applicable',
    detector: '18 × 30 cm · upright Bucky at 150–180 cm', support: 'Upright Bucky', patientView: 'side toward tube',
    default_kvp: 70, default_mas: 8, default_ma: 250, default_sid_cm: 150, grid: 'yes', aec: false,
    centring: 'C4, at the level of the thyroid cartilage', cr: 'Horizontal, perpendicular to C4',
    angulation: '0°; 5° cephalad only if C7–T1 is not demonstrated', angle: 0, tolerances: { rotation: 2, centring: 10, angle: 2 },
    focus: { x: 0.5, y: 0.46 }, field: { l: 32, r: 68, t: 8, b: 90 }, field_cm: [15, 30],
    borders: { t: 'base of skull and C1', b: 'C7–T1 junction', l: 'anterior vertebral bodies and prevertebral soft tissue', r: 'posterior spinous processes' },
    reference: { male: `${M}7d2479067_generated_image.png`, female: `${M}7d2479067_generated_image.png` }, cameraDirection: 'Horizontal tube → lateral cervical spine → upright Bucky',
    prep: PREP, positioning: ['Erect at the upright Bucky, left shoulder against the receptor, chin raised slightly.', 'Shoulders depressed to clear C7–T1.', 'Centre at C4, at the level of the thyroid cartilage.', 'Include the base of skull to the C7–T1 junction.'],
    criteria: ['Base of skull and C1 included', 'C7–T1 junction demonstrated', 'All seven cervical vertebral bodies visible', 'Prevertebral soft tissue included', 'No rotation (Mandibular rami superimposed)'],
    limbLabel: 'Shoulders depressed / true lateral', rotationCriterion: 'Mandibular rami and posterior arches superimposed', cutoff: 'C7–T1 junction',
    radiograph: `${M}78221533f_generated_image.png`, imageSource: `${M}78221533f_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'tspine_ap', name: 'Thoracic spine', view: 'AP', label: 'Thoracic spine — AP', region: 'Spine', laterality: 'not_applicable',
    detector: '35 × 43 cm · table Bucky', support: 'Table Bucky', patientView: 'supine, front toward tube',
    default_kvp: 80, default_mas: 20, default_ma: 250, default_sid_cm: 100, grid: 'yes', aec: true,
    centring: 'T7, about 3–5 cm below the sternal angle', cr: 'Perpendicular to T7', angulation: '0°; 10–15° cephalad for the thoracic kyphosis if required', angle: 0,
    tolerances: { rotation: 2, centring: 12, angle: 2 },
    focus: { x: 0.5, y: 0.5 }, field: { l: 27, r: 73, t: 8, b: 92 }, field_cm: [35, 43],
    borders: { t: 'C7–T1 junction', b: 'T12–L1 junction', l: 'left pedicles and costovertebral joints', r: 'right pedicles and costovertebral joints' },
    reference: { male: `${M}bca22db2d_generated_image.png`, female: `${M}bca22db2d_generated_image.png` }, cameraDirection: 'Overhead tube → anterior thorax → table Bucky',
    prep: PREP, positioning: ['Supine; arms raised clear of the thoracic spine.', 'No rotation; sternum in the midline.', 'Centre T7, about 3–5 cm below the sternal angle.', 'Include C7–T1 to the T12–L1 junction.'],
    criteria: ['C7–T1 to T12–L1 demonstrated', 'Pedicles equidistant from the spinous processes', 'Ribs and costovertebral joints included', 'Intervertebral disc spaces visible', 'No rotation of the vertebral bodies'],
    limbLabel: 'Arms raised / no rotation', rotationCriterion: 'Pedicles equidistant from the spinous processes', cutoff: 'T12–L1 junction',
    radiograph: `${M}46f7ca231_generated_image.png`, imageSource: `${M}46f7ca231_generated_image.png`, credit: 'Departmental reference radiograph',
  },
  {
    key: 'lspine_ap', name: 'Lumbar spine', view: 'AP', label: 'Lumbar spine — AP', region: 'Spine', laterality: 'not_applicable',
    detector: '30 × 35 cm · table Bucky', support: 'Table Bucky', patientView: 'supine, front toward tube',
    default_kvp: 85, default_mas: 25, default_ma: 250, default_sid_cm: 100, grid: 'yes', aec: true,
    centring: 'L3, at the level of the lower costal margin', cr: 'Perpendicular to L3', angulation: '0°', angle: 0,
    tolerances: { rotation: 2, centring: 12, angle: 2 },
    focus: { x: 0.5, y: 0.48 }, field: { l: 28, r: 72, t: 8, b: 92 }, field_cm: [30, 35],
    borders: { t: 'T12 vertebral body', b: 'sacrum and sacroiliac joints', l: 'left transverse processes and psoas margin', r: 'right transverse processes and psoas margin' },
    reference: { male: `${M}1c49a35a4_generated_image.png`, female: `${M}1c49a35a4_generated_image.png` }, cameraDirection: 'Overhead tube → anterior abdomen → table Bucky',
    prep: PREP, positioning: ['Supine; hips and shoulders level, knees slightly flexed if comfortable.', 'Arms raised clear of the lumbar spine.', 'Centre L3, at the level of the lower costal margin.', 'Include T12 to the sacrum and sacroiliac joints.'],
    criteria: ['T12 to sacrum demonstrated', 'Pedicles and spinous processes midline', 'Transverse processes and psoas margins included', 'Sacroiliac joints visible', 'No rotation of the vertebral bodies'],
    limbLabel: 'Knees flexed / no rotation', rotationCriterion: 'Spinous processes central between the pedicles', cutoff: 'sacrum',
    radiograph: `${M}1a547d29d_generated_image.png`, imageSource: `${M}1a547d29d_generated_image.png`, credit: 'Departmental reference radiograph',
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