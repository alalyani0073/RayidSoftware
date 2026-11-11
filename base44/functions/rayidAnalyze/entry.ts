import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const PERSONA =
  'You are RAYID, a vendor-neutral assistant for radiographers. You write terse, professional, plain-English guidance. ' +
  'You never invent patient identity, never give a diagnosis, and never reference brands of equipment.';

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    kvp: { type: 'number' },
    mas: { type: 'number' },
    sid_cm: { type: 'number' },
    grid: { type: 'string' },
    focal_spot_mm: { type: 'number' },
    patient_note: { type: 'string' },
    adjustments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          parameter: { type: 'string' },
          change: { type: 'string' },
          reason: { type: 'string' }
        },
        required: ['parameter', 'change', 'reason']
      }
    },
    positioning: { type: 'array', items: { type: 'string' } },
    breathing: { type: 'string' },
    confidence: { type: 'number' }
  },
  required: ['kvp', 'mas', 'sid_cm', 'grid', 'focal_spot_mm', 'patient_note', 'adjustments', 'positioning', 'breathing', 'confidence']
};

const ASSESSMENT_SCHEMA = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['accepted', 'review', 'repeat_required'] },
    quality_score: { type: 'number' },
    criteria: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          status: { type: 'string', enum: ['pass', 'partial', 'fail'] },
          note: { type: 'string' }
        },
        required: ['name', 'status', 'note']
      }
    },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['cutoff', 'artefact', 'positioning', 'exposure', 'collimation'] },
          label: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          note: { type: 'string' }
        },
        required: ['type', 'label', 'severity', 'note']
      }
    },
    summary: { type: 'string' },
    recommendation: { type: 'string' }
  },
  required: ['verdict', 'quality_score', 'criteria', 'findings', 'summary', 'recommendation']
};

const num = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const text = (value, fallback = '—') => (typeof value === 'string' && value.trim() ? value.trim() : fallback);

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode;
    if (mode !== 'pre_exam' && mode !== 'post_exam') {
      return Response.json({ error: 'mode must be pre_exam or post_exam' }, { status: 400 });
    }

    if (mode === 'pre_exam') {
      const protocol = body?.protocol || {};
      const patient = body?.patient || {};
      if (!protocol.name) return Response.json({ error: 'protocol is required' }, { status: 400 });

      const prompt = `${PERSONA}

TASK
Build a patient-specific acquisition plan for a single radiographic projection.

EXAMINATION
- Protocol: ${text(protocol.name)}
- View: ${text(protocol.view, 'AP')}
- Body part: ${text(protocol.region, text(protocol.body_part))}
- Standard technique: ${num(protocol.default_kvp, 110)} kVp, ${num(protocol.default_mas, 5)} mAs, ${num(protocol.default_sid_cm, 180)} cm SID, grid: ${text(protocol.grid, 'yes')}
- Standard positioning: ${(protocol.positioning || []).join('; ') || 'standard departmental technique'}

PATIENT
- Age: ${num(patient.age, 45)} years
- Sex: ${text(patient.sex, 'unspecified')}
- Weight: ${num(patient.weight_kg, 75)} kg
- Mobility: ${text(patient.mobility, 'cooperative, standing or seated as required')}

INSTRUCTIONS
1. Adjust technique for habitus, age and the requested view. Stay inside safe, conventional diagnostic ranges.
2. Each adjustment must state the parameter, the change, and the reason in 18 words or less.
3. Positioning must be actionable instructions for this patient on this view (3-4 items, each under 16 words).
4. patient_note: one sentence (under 30 words) on which patient factors drove the plan.
5. confidence: integer 0-100.
Return JSON only.`;

      const plan = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: PLAN_SCHEMA
      });

      return Response.json({ plan });
    }

    const exam = body?.exam || {};
    const criteria = Array.isArray(body?.criteria) ? body.criteria.slice(0, 12) : [];
    if (!exam.protocol_name) return Response.json({ error: 'exam is required' }, { status: 400 });

    const prompt = `${PERSONA}

TASK
Evaluate a just-acquired radiograph against its anatomical acceptance criteria. This is a concept prototype: the image itself is not available, so reason from the acquisition record, the sensor positioning telemetry and the protocol criteria.

ACQUISITION
- Protocol: ${text(exam.protocol_name)}
- Patient: ${num(exam.age, 45)} years, ${text(exam.sex, 'unspecified')}, ${num(exam.weight_kg, 75)} kg
- Technique used: ${num(exam.kvp, 110)} kVp, ${num(exam.mas, 5)} mAs, ${num(exam.sid_cm, 180)} cm SID
- Sensor telemetry: rotation ${num(exam.rotation_deg, 0).toFixed(1)}°, centring offset ${num(exam.centring_offset_mm, 0)} mm from midline
- Rejection threshold in this department: rotation above 3°, centring offset above 15 mm

CRITERIA TO CHECK
${criteria.length ? criteria.map((c, i) => `${i + 1}. ${c}`).join('\n') : '1. Anatomy of interest fully included\n2. No rotation\n3. Adequate exposure\n4. No avoidable artefact'}

INSTRUCTIONS
1. Judge each criterion as pass, partial or fail with a short note (under 14 words).
2. findings: 0-4 real issues (cut-off anatomy, artefact, positioning error, exposure, collimation). Empty list when the image is clean.
3. quality_score: integer 0-100. Below 75 means repeat. 75-84 means review. 85+ means accepted.
4. verdict must agree with the score and findings.
5. summary: two sentences maximum, radiographer-facing.
6. recommendation: one concrete next action (under 20 words).
Return JSON only.`;

    const assessment = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: ASSESSMENT_SCHEMA
    });

    return Response.json({ assessment });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}