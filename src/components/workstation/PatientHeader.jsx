import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/rayid';

const STEPS = [
  { key: 'pre', label: 'Technique' },
  { key: 'positioning', label: 'Positioning' },
  { key: 'review', label: 'Image review' },
];

const SEX = { male: 'Male', female: 'Female', other: 'Other' };
const LATERALITY = { left: 'Left', right: 'Right', not_applicable: 'Midline' };

function Field({ label, primary, meta }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-600">{label}</div>
      <div className="mt-0.5 truncate text-[12px] font-medium leading-tight text-slate-100">{primary}</div>
      <div className="truncate text-[10px] leading-tight text-slate-500">{meta}</div>
    </div>
  );
}

export default function PatientHeader({ exam, stage, onBack }) {
  const current = STEPS.findIndex((step) => step.key === stage);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-white/[0.07] bg-[#0D1216] px-3 py-2">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-[3px] border border-white/10 px-1.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-400 lg:hidden"
        >
          <ChevronLeft className="h-3 w-3" strokeWidth={2} /> List
        </button>
      )}

      <Field
        label="Patient"
        primary={exam.patient_name}
        meta={`${exam.patient_ref} · ${exam.age ? `${exam.age} y` : 'age —'} · ${SEX[exam.sex] || '—'}`}
      />
      <Field
        label="Examination"
        primary={exam.protocol_name}
        meta={`${exam.body_part || 'Region —'} · ${LATERALITY[exam.laterality] || 'Midline'}`}
      />
      <Field label="Accession" primary={`ACC-${exam.id.slice(-6).toUpperCase()}`} meta={formatDateTime(exam.exam_date)} />
      <Field label="Technologist" primary={exam.technologist || 'S. Al-Rashid'} meta="DR Room 2" />

      <div className="ml-auto flex items-center gap-1.5">
        {STEPS.map((step, index) => {
          const active = index === current;
          const done = index < current;
          return (
            <span
              key={step.key}
              className={cn(
                'flex items-center gap-1.5 rounded-[3px] border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em]',
                active
                  ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-200'
                  : done
                    ? 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-300'
                    : 'border-white/[0.08] text-slate-500'
              )}
            >
              <span className="num opacity-70">{index + 1}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}