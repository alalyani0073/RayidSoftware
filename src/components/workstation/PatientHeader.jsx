export default function PatientHeader({ exam, stage, onBack }) {
  return <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-ws-toolbar px-3 py-3 text-xs">
    <button onClick={onBack} disabled={!onBack} className="rounded-sm border border-border bg-secondary px-2 py-1.5 text-muted-foreground disabled:opacity-50">Close exam</button>
    <div><p className="text-[10px] text-muted-foreground">PATIENT / MRN</p><p className="mt-1 text-sm font-semibold">{exam.patient_name}</p><p className="text-muted-foreground">{exam.patient_ref}</p></div>
    <div><p className="text-[10px] text-muted-foreground">DEMOGRAPHICS</p><p className="mt-1">{exam.age || '—'} y · {exam.sex || '—'} · {exam.weight_kg || '—'} kg</p></div>
    <div><p className="text-[10px] text-muted-foreground">EXAMINATION</p><p className="mt-1 font-medium">{exam.protocol_name} · {exam.laterality === 'not_applicable' ? 'Midline' : exam.laterality || 'Side —'}</p></div>
    <div className="ml-auto"><p className="text-[10px] text-muted-foreground">EXAMINATION STATUS</p><p className="mt-1">{stage === 'review' ? 'Acquired · review pending' : stage === 'positioning' ? 'In progress · preparation' : 'Protocol setup'}</p></div>
  </div>;
}