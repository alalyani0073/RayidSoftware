import { ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProjectionReference from '@/components/workstation/ProjectionReference';
import { REGIONS, projectionsInRegion } from '@/lib/protocols';

const num = (value, fallback = '—') =>
  Number.isFinite(Number(value)) ? String(Math.round(Number(value) * 10) / 10) : fallback;

function Spec({ label, value }) {
  return (
    <div>
      <span className="ws-label">{label}</span>
      <p className="mt-0.5 text-[10.5px] leading-snug text-slate-300">{value}</p>
    </div>
  );
}

function Checklist({ title, items, note }) {
  return (
    <div className="rounded-[4px] border border-white/[0.07] bg-white/[0.02] p-2">
      <span className="ws-label">{title}</span>
      <ol className="mt-1 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex gap-1.5 text-[10.5px] leading-snug text-slate-400">
            <span className="num mt-[1px] font-mono text-[9px] text-slate-600">{index + 1}</span>
            {item}
          </li>
        ))}
      </ol>
      {note && <p className="mt-1.5 text-[9.5px] leading-snug text-slate-600">{note}</p>}
    </div>
  );
}

export default function PreExamStage({
  exam,
  projection,
  plan,
  rayidOn,
  onChooseProjection,
  onStart,
}) {
  const options = projectionsInRegion(projection.region);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] bg-[#0A0E12] px-3 py-1.5">
        <span className="ws-label">Examination setup · no image acquired</span>
        <span className="num font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-500">
          {exam.patient_ref || 'ACC-—'} · {projection.detector}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <span className="ws-label">Anatomical region</span>
            <Select
              value={projection.region}
              onValueChange={(region) => onChooseProjection(projectionsInRegion(region)[0].key)}
            >
              <SelectTrigger className="mt-1 h-7 rounded-[3px] border-white/12 bg-white/[0.04] px-2 text-[11px] text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region} className="text-[12px]">
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="ws-label">Projection</span>
            <Select value={projection.key} onValueChange={onChooseProjection}>
              <SelectTrigger className="mt-1 h-7 rounded-[3px] border-white/12 bg-white/[0.04] px-2 text-[11px] text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((item) => (
                  <SelectItem key={item.key} value={item.key} className="text-[12px]">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-2.5 grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_210px]">
          <div>
            <ProjectionReference projection={projection} rayidOn={rayidOn} />
            <div className="mt-1 flex flex-wrap items-center justify-between gap-1 font-mono text-[8px] uppercase tracking-[0.12em] text-slate-600">
              <span>positioning reference · not a live view</span>
              <span>{projection.default_sid_cm} cm SID</span>
            </div>
          </div>

          <div className="space-y-2 rounded-[4px] border border-white/[0.07] bg-white/[0.02] p-2">
            <Spec label="Detector" value={projection.detector} />
            <Spec label="Centring point" value={projection.centring} />
            <Spec label="Central ray" value={projection.cr} />
            <Spec label="Angulation" value={projection.angulation} />
          </div>
        </div>

        {rayidOn ? (
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
            <Checklist title="Patient preparation" items={projection.prep} />
            <Checklist
              title="Positioning requirements"
              items={projection.positioning}
              note="Simulated recommendation — verify against departmental protocol."
            />
          </div>
        ) : (
          <p className="mt-2.5 rounded-[4px] border border-white/[0.07] bg-white/[0.02] px-2 py-2 text-[10.5px] leading-snug text-slate-500">
            RAYID is switched off, so no preparation or positioning guidance is shown. The console
            continues to run the selected protocol.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-[#0D1216] px-3 py-2">
        <div>
          <span className="ws-label">
            {rayidOn ? 'RAYID · suggested technique (simulated)' : 'Protocol technique'}
          </span>
          <p className="num mt-0.5 font-mono text-[11px] text-slate-200">
            {num(rayidOn ? plan?.kvp ?? projection.default_kvp : projection.default_kvp)} kVp ·{' '}
            {num(rayidOn ? plan?.mas ?? projection.default_mas : projection.default_mas)} mAs ·{' '}
            {num(rayidOn ? plan?.sid_cm ?? projection.default_sid_cm : projection.default_sid_cm)} cm
            SID
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-1.5 rounded-[4px] bg-cyan-300 px-3 py-1.5 text-[11.5px] font-semibold text-[#04121A] transition-colors hover:bg-cyan-200"
        >
          Confirm positioning
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}