import { Monitor, Loader2 } from 'lucide-react';
export default function WorkstationIdle({ loading, patientSelected = false, projection }) {
  return <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center bg-ws-canvas p-8 text-center">
    {loading ? <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /> : <Monitor className="h-12 w-12 text-muted-foreground/40" strokeWidth={1} />}
    <h2 className="mt-4 text-base font-medium text-foreground">{loading ? 'Loading modality worklist' : patientSelected ? 'Detector ready for acquisition' : 'No examination selected'}</h2>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">{patientSelected ? `${projection.label} · Position the patient and verify the exposure settings before acquisition.` : 'Select a scheduled patient to open the acquisition protocol.'}</p>
    <span className="mt-8 rounded-sm border border-border px-5 py-3 font-mono text-xs text-muted-foreground">DR ROOM 2 · DETECTOR READY · GENERATOR STANDBY</span>
  </div>;
}