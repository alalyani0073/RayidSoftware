import { collimationFindings, centeringOffset } from '@/components/workstation/simulation';

// Guidance sits below the camera pane, never on top of the patient image, so the
// anatomy, collimation field and centering markers stay fully unobstructed.
export default function PositioningTips({ projection, position, recommendation, busy, editable, adjusted }) {
  const hints = [];
  if (busy) hints.push('Locating anatomical landmark…');
  if (adjusted) {
    collimationFindings(position, projection).slice(0, 2).forEach((finding) => hints.push(finding.message));
    if (centeringOffset(position, projection)) hints.push(`Central ray ${Math.abs(position.x)} mm ${position.x >= 0 ? 'lateral' : 'medial'} of ${projection.centring}`);
  }
  if (!position.visible) hints.push('Landmark obscured; centering guidance withheld.');
  if (position.visible && recommendation) hints.push(`Green: recommended landmark · ${projection.centring}`);
  if (editable) hints.push('Drag the crosshair to set centering', 'Drag any of the four shutter edges');
  if (!hints.length) return null;
  return <ul className="flex flex-wrap gap-1 border-t border-border bg-ws-surface px-3 py-1 text-rayid">
    {hints.map((hint) => <li key={hint} title={hint} className="max-w-[340px] truncate rounded-sm border border-rayid/30 bg-rayid/[0.07] px-1.5 py-0.5 text-[10px] leading-snug">{hint}</li>)}
  </ul>;
}