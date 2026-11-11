import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import useWorkstation from '@/hooks/useWorkstation';
import ConsoleBar from '@/components/workstation/ConsoleBar';
import Worklist from '@/components/workstation/Worklist';
import PatientHeader from '@/components/workstation/PatientHeader';
import AcquisitionPanel from '@/components/workstation/AcquisitionPanel';
import RayidPanel from '@/components/workstation/RayidPanel';
import PreExamStage from '@/components/workstation/PreExamStage';
import PositioningStage from '@/components/workstation/PositioningStage';
import ReviewStage from '@/components/workstation/ReviewStage';
import { centringAdvice, rotationAdvice } from '@/lib/rayid';

function IdleStage({ loading }) {
  return (
    <div className="grid min-h-[280px] flex-1 place-items-center px-6 py-10">
      <div className="max-w-sm text-center">
        <span className="mx-auto grid h-10 w-10 place-items-center rounded-[6px] border border-cyan-300/25 bg-cyan-400/[0.07]">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" strokeWidth={2} />
          ) : (
            <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
          )}
        </span>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
          {loading ? 'Loading worklist' : 'No examination open'}
        </p>
        <h2 className="mt-1.5 font-heading text-[14px] font-medium text-white">
          {loading ? 'Reading the modality worklist' : 'Select a patient from the worklist'}
        </h2>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-slate-500">
          This is the room’s DR console. RAYID runs as a layer inside it: technique before exposure,
          alignment during it, image quality afterwards.
        </p>
      </div>
    </div>
  );
}

function RayidOff() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center border-t border-white/[0.07] px-4 text-center">
      <Sparkles className="h-4 w-4 text-slate-600" strokeWidth={1.8} />
      <p className="mt-2 text-[10.5px] leading-snug text-slate-500">
        RAYID is switched off. Enable it in the toolbar to bring the assistant back into this console.
      </p>
    </div>
  );
}

export default function Workstation() {
  const ws = useWorkstation();
  const open = Boolean(ws.exam);
  const tol = ws.tolerances;

  const rot = rotationAdvice(ws.rotation, tol.rotation);
  const cen = centringAdvice(ws.centring, tol.centring);

  const messages = [];
  if (!rot.ok) messages.push({ ok: false, text: rot.text });
  if (!cen.ok) messages.push({ ok: false, text: cen.text });
  if (rot.ok && cen.ok) messages.push({ ok: true, text: 'Alignment meets criteria — ready to acquire.' });

  const values =
    ws.stage === 'review'
      ? ws.exam
      : ws.plan || {
          kvp: ws.projection.default_kvp,
          mas: ws.projection.default_mas,
          sid_cm: ws.projection.default_sid_cm,
          grid: ws.projection.grid,
          focal_spot_mm: 0.6,
        };

  const source = ws.stage === 'review' ? 'Acquired' : ws.rayidOn && ws.plan ? 'RAYID' : 'Protocol';

  return (
    <div className="flex min-h-0 flex-col lg:h-[calc(100vh-44px)] lg:overflow-hidden">
      <ConsoleBar
        stage={ws.stage}
        open={open}
        rayidOn={ws.rayidOn}
        onToggleRayid={ws.toggleRayid}
      />

      {open ? (
        <PatientHeader exam={ws.exam} stage={ws.stage} onBack={ws.closeExam} />
      ) : (
        <div className="border-b border-white/[0.07] bg-[#0D1216] px-3 py-2">
          <span className="ws-label">Modality worklist · Room 2</span>
          <p className="mt-0.5 text-[11px] text-slate-400">
            DigitalDiagnost console with the RAYID assistant layer · simulated data
          </p>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[236px_minmax(0,1fr)_292px]">
        <div className={cn('min-h-0 flex-col border-r border-white/[0.07]', open ? 'hidden lg:flex' : 'flex')}>
          <Worklist
            exams={ws.exams}
            activeId={ws.exam?.id}
            onSelect={ws.openExam}
            onClose={ws.closeExam}
          />
        </div>

        <div className={cn('flex min-h-0 flex-col bg-[#080B0E]', open ? 'flex' : 'hidden lg:flex')}>
          {!open ? (
            <IdleStage loading={ws.loading} />
          ) : ws.stage === 'pre' ? (
            <PreExamStage
              exam={ws.exam}
              projection={ws.projection}
              plan={ws.plan}
              rayidOn={ws.rayidOn}
              onChooseProjection={ws.chooseProjection}
              onStart={() => ws.setStage('positioning')}
            />
          ) : ws.stage === 'positioning' ? (
            <PositioningStage
              projection={ws.projection}
              rotation={ws.rotation}
              centring={ws.centring}
              onRotation={ws.setRotation}
              onCentring={ws.setCentring}
              onReset={() => {
                ws.setRotation(0);
                ws.setCentring(0);
              }}
              onAcquire={ws.acquire}
              capturing={ws.capturing}
              rayidOn={ws.rayidOn}
            />
          ) : (
            <ReviewStage
              exam={ws.exam}
              projection={ws.projection}
              assessment={ws.assessment}
              evaluating={ws.evaluating}
              variant={ws.variant}
              rayidOn={ws.rayidOn}
              onRepeat={ws.repeat}
              onOverride={ws.override}
              onClose={ws.closeExam}
            />
          )}
        </div>

        <div className={cn('min-h-0 flex-col border-l border-white/[0.07]', open ? 'flex' : 'hidden lg:flex')}>
          <AcquisitionPanel
            values={values}
            baseline={ws.projection}
            source={source}
            note={ws.stage === 'pre' ? 'Compared with the protocol for this projection.' : 'Values as acquired.'}
          />
          {ws.rayidOn ? (
            <RayidPanel
              stage={ws.stage}
              projection={ws.projection}
              plan={ws.plan}
              planning={ws.planning}
              planError={ws.planError}
              rotation={ws.rotation}
              centring={ws.centring}
              tolerance={tol}
              rotOk={rot.ok}
              cenOk={cen.ok}
              messages={messages}
              assessment={ws.assessment}
              evaluating={ws.evaluating}
            />
          ) : (
            <RayidOff />
          )}
        </div>
      </div>
    </div>
  );
}