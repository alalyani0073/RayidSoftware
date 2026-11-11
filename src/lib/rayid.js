export const VERDICTS = {
  accepted: { label: 'Accepted', tone: 'text-emerald-300', ring: 'border-emerald-400/30 bg-emerald-400/10', pill: 'accepted' },
  review: { label: 'Review', tone: 'text-amber-300', ring: 'border-amber-400/30 bg-amber-400/10', pill: 'review' },
  repeat_required: { label: 'Repeat required', tone: 'text-rose-300', ring: 'border-rose-400/30 bg-rose-400/10', pill: 'repeat' },
  pending: { label: 'Awaiting evaluation', tone: 'text-slate-400', ring: 'border-white/10 bg-white/[0.04]', pill: 'neutral' },
};

export const scoreTone = (score) => {
  if (score >= 88) return 'text-emerald-300';
  if (score >= 75) return 'text-amber-300';
  return 'text-rose-300';
};

export const scoreBar = (score) => {
  if (score >= 88) return 'bg-emerald-400';
  if (score >= 75) return 'bg-amber-400';
  return 'bg-rose-400';
};

export const verdictOf = (verdict) => VERDICTS[verdict] || VERDICTS.pending;

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

export const dayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

export const mean = (values) => {
  const nums = values.filter((v) => Number.isFinite(v));
  if (!nums.length) return 0;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
};

export const habitusLabel = (weight) => {
  const w = Number(weight) || 0;
  if (w >= 100) return 'Large habitus · higher attenuation';
  if (w >= 80) return 'Above average habitus';
  if (w >= 55) return 'Average habitus';
  if (w > 0) return 'Slim habitus · lower attenuation';
  return 'Awaiting patient data';
};

export const rotationAdvice = (rotation) => {
  const abs = Math.abs(rotation);
  if (abs <= 2) return { ok: true, text: 'Rotation within tolerance' };
  const direction = rotation > 0 ? 'clockwise' : 'counter-clockwise';
  return { ok: false, text: `Rotate patient ${abs.toFixed(1)}° ${direction}` };
};

export const centringAdvice = (offset) => {
  const abs = Math.abs(offset);
  if (abs <= 12) return { ok: true, text: 'Centred on the midline' };
  const direction = offset > 0 ? 'left' : 'right';
  return { ok: false, text: `Shift patient ${abs} mm to the ${direction}` };
};