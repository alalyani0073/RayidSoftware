import { useOutletContext } from 'react-router-dom';
import useWorkstation from '@/hooks/useWorkstation';
import Worklist from '@/components/workstation/Worklist';
import PatientHeader from '@/components/workstation/PatientHeader';
import AcquisitionPanel from '@/components/workstation/AcquisitionPanel';
import PreExamStage from '@/components/workstation/PreExamStage';
import PositioningStage from '@/components/workstation/PositioningStage';
import ReviewStage from '@/components/workstation/ReviewStage';
import WorkstationIdle from '@/components/workstation/WorkstationIdle';
import TechniqueRecommendations from '@/components/workstation/TechniqueRecommendations';
import CenteringControl from '@/components/workstation/CenteringControl';
import CollimationControl from '@/components/workstation/CollimationControl';
import ImageAssessmentPanel from '@/components/workstation/ImageAssessmentPanel';
import WorkstationAlert from '@/components/workstation/WorkstationAlert';
import PacsStatus from '@/components/workstation/PacsStatus';

export default function Workstation() {
  const mode = useOutletContext();
  const ws = useWorkstation(mode);
  return <div className="flex min-h-[calc(100dvh-48px)] flex-col bg-ws-surface font-body lg:h-full lg:min-h-0 lg:overflow-hidden">
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-ws-toolbar px-3 py-1 text-[10px] text-muted-foreground">
      <span>Detector: ready</span>
      <span>Generator: {ws.busy ? 'simulated acquisition' : 'standby'}</span>
      <PacsStatus hasImage={Boolean(ws.capture)} assessment={ws.assessment} />
      <span className="ml-auto hidden xl:inline">Clinical DR simulation · no hardware, RIS or PACS connection</span>
    </div>
    {ws.exam && <PatientHeader exam={ws.exam} stage={ws.stage} onBack={ws.busy ? undefined : ws.closeExam} />}
    {ws.error && <p role="alert" className="border-b border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{ws.error}</p>}
    <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[196px_minmax(0,1fr)_300px]">
      <div className={`min-h-0 border-r border-border ${ws.exam ? 'hidden lg:flex' : 'flex'}`}><Worklist worklist={ws.worklist} activeId={ws.exam?.id} onSelect={ws.openExam} disabled={ws.busy} /></div>
      <main id="positioning-controls" className={`min-h-0 flex-col bg-ws-canvas ${ws.exam ? 'flex' : 'hidden lg:flex'}`}>{!ws.exam ? <><WorkstationIdle loading={ws.worklist.loading} />{ws.completion && <p className="border-t border-border bg-ws-toolbar p-3 text-xs text-chart-2">{ws.completion}</p>}</> : ws.stage === 'pre' ? <PreExamStage ws={ws} /> : ws.stage === 'positioning' ? <PositioningStage ws={ws} /> : <ReviewStage ws={ws} />}</main>
      <aside className={`min-h-0 overflow-y-auto border-l border-border bg-ws-surface ${ws.exam ? '' : 'hidden lg:block'}`}>{ws.exam ? <><AcquisitionPanel ws={ws} />{ws.rayidOn && (ws.stage === 'review' ? <ImageAssessmentPanel ws={ws} /> : <>{ws.stage === 'positioning' && <><CenteringControl ws={ws} /><CollimationControl ws={ws} /></>}<TechniqueRecommendations ws={ws} /></>)}</> : <div className="p-4 text-xs text-muted-foreground"><h2 className="font-semibold text-foreground">GENERATOR / EXPOSURE</h2><p className="mt-3">Select an examination to load its technique.</p></div>}</aside>
    </div>
    <WorkstationAlert ws={ws} />
  </div>;
}