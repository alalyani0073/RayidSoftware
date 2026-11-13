import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

const secondary = 'rounded-sm border border-border bg-secondary px-3 py-2 text-xs font-semibold';
const primary = 'rounded-sm bg-rayid px-3 py-2 text-xs font-semibold text-rayid-foreground';

const TITLES = {
  exposure: 'EXPOSURE PARAMETER WARNING',
  collimation: 'COLLIMATION WARNING',
  centering: 'CENTERING WARNING',
  movement: 'PATIENT MOVEMENT DETECTED',
  position: 'POSITIONING ERROR DETECTED',
  auto: 'AUTO-CENTERING REQUIRES CORRECTION',
};

const DESCRIPTIONS = {
  exposure: 'The selected exposure settings differ significantly from the technique recommended for this patient, examination and projection. Review them before exposure.',
  collimation: 'The collimated field does not match the coverage required for this projection. Adjust the shutters before proceeding.',
  centering: 'RAYID compared the selected centering point with the recommended anatomical landmark. You may correct it or continue at your discretion.',
  movement: 'The patient has moved since the position was last checked. Confirm the alignment, centering and collimation again before exposure.',
};

// A flagged setting is corrected here or acknowledged in a second, explicit step,
// so an override is never a single accidental click.
export default function WorkstationAlert({ ws }) {
  const a = ws.alert;
  if (!ws.rayidOn || !a) return null;
  const title = a.confirm ? 'CONFIRM OVERRIDE' : a.kind === 'quality' ? (a.result?.quality_score < 75 ? `LOW IMAGE QUALITY SCORE · ${a.result.quality_score}%` : `${a.result?.critical ? 'CRITICAL IMAGE CRITERION MISSING' : 'IMAGE QUALITY NEEDS CORRECTION'} · ${a.result?.quality_score}%`) : a.kind === 'override' ? 'CONFIRM RADIOGRAPHER OVERRIDE' : TITLES[a.kind];
  const description = a.confirm
    ? 'RAYID flagged the settings shown above for this projection. Confirming records an explicit override against the examination and continues with the values you selected.'
    : DESCRIPTIONS[a.kind] || (a.kind === 'override'
      ? 'Explicitly confirm acceptance despite the displayed technical findings. This decision is recorded with the examination.'
      : a.kind === 'quality'
        ? 'The image does not meet the quality criteria for this projection. Review clinical adequacy before deciding to repeat.'
        : 'The selected positioning does not meet this projection’s criteria.');
  const lines = a.lines || a.result?.detected.map(f => `${f.title}: ${f.detail}`) || [];
  const dismiss = () => ws.setAlert(null);
  const targetId = a.kind === 'exposure' ? 'exposure-controls' : a.kind === 'collimation' ? 'collimation-controls' : 'positioning-controls';
  const review = () => {
    dismiss();
    if (a.kind === 'position') { ws.setSimOpen(true); return; }
    requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  const actions = a.confirm
    ? <><button onClick={ws.cancelOverride} className={secondary}>CANCEL</button><button onClick={ws.continueWarning} className="rounded-sm bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground">CONFIRM AND CONTINUE</button></>
    : a.kind === 'exposure'
      ? <><button onClick={ws.applyRecommendations} className={primary}>CORRECT SETTINGS</button><button onClick={ws.requestOverride} className={secondary}>CONTINUE ANYWAY</button></>
      : a.kind === 'collimation'
        ? <><button onClick={ws.correctCollimation} className={primary}>CORRECT COLLIMATION</button><button onClick={ws.requestOverride} className={secondary}>CONTINUE ANYWAY</button></>
        : a.kind === 'centering'
          ? <><button onClick={ws.correctCentering} className={primary}>CORRECT CENTERING</button><button onClick={ws.requestOverride} className={secondary}>CONTINUE ANYWAY</button></>
          : a.kind === 'movement'
            ? <><button onClick={ws.acknowledgeMovement} className={primary}>REASSESS POSITIONING</button><button onClick={ws.continueWarning} className={secondary}>CONTINUE ANYWAY</button></>
            : a.kind === 'position'
              ? <><button onClick={review} className={primary}>CORRECT POSITIONING</button><button onClick={ws.continueWarning} className={secondary}>CONTINUE ANYWAY</button></>
              : a.kind === 'auto'
                ? <><button onClick={review} className={primary}>REVIEW POSITIONING</button><button onClick={() => { dismiss(); ws.autoCenter(); }} className={secondary}>RETRY AUTO-CENTERING</button></>
                : a.kind === 'quality'
                  ? <><button onClick={dismiss} className={secondary}>REVIEW IMAGE</button><button onClick={ws.repeat} className={primary}>REPEAT EXAMINATION</button><button onClick={ws.continueWarning} className={secondary}>ACCEPT IMAGE & CONTINUE</button></>
                  : <><button onClick={dismiss} className={secondary}>RETURN TO IMAGE</button><button disabled={ws.busy} onClick={ws.continueWarning} className="rounded-sm bg-destructive px-3 py-2 text-xs font-semibold text-destructive-foreground disabled:opacity-50">CONFIRM OVERRIDE & FINISH</button></>;

  return <Dialog open onOpenChange={open => { if (!open && !ws.busy) dismiss(); }}><DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto rounded-sm border-border bg-ws-surface">
    <DialogHeader><DialogTitle className="flex items-start gap-2 text-sm leading-relaxed"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rayid" /><span className="font-mono">{title}</span></DialogTitle><DialogDescription className="pt-2 text-sm">{description}</DialogDescription></DialogHeader>
    <ul className="space-y-2 border-y border-border py-3 text-xs leading-relaxed">{lines.map(line => <li key={line}>• {line}</li>)}</ul>
    <DialogFooter className="mt-2 flex-wrap gap-2 sm:justify-start">{actions}</DialogFooter>
  </DialogContent></Dialog>;
}