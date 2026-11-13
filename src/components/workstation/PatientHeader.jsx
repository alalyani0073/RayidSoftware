export default function PatientHeader({ exam, stage, onBack }) {
  return <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-border bg-ws-toolbar px-3 py-1.5 text-xs">
    <button onClick={onBack} disabled={!onBack} className="rounded-sm border border-border bg-secondary px-2 py-1 text-[11px] text-muted-foreground disabled:opacity-50">Close exam</button>
    <div><p className="text-[9px] uppercase tracking-wide text-muted-foreground">Patient / MRN</p><p className="text-sm font-semibold leading-tight">{exam.patient_name}</p><p className="text-[10px] text-muted-foreground">{exam.patient_ref}</p></div>
    <div><p className="text-[9px] uppercase tracking-wide text-muted-foreground">Demographics</p><p className="text-[11px]">{exam.age || '—'} y · {exam.sex || '—'} · {exam.weight_kg || '—'} kg</p></div>
    <div><p className="text-[9px] uppercase tracking-wide text-muted-foreground">Examination</p><p className="text-[11px] font-medium">{exam.protocol_name} · {exam.laterality === 'not_applicable' ? 'Midline' : exam.laterality || 'Side —'}</p></div>
    <div className="ml-auto text-right"><p className="text-[9px] uppercase tracking-wide text-muted-foreground">Status</p><p className="text-[11px]">{stage === 'review' ? 'Acquired · review pending' : stage === 'positioning' ? 'In progress · preparation' : 'Protocol setup'}</p></div>
  </div>;
}