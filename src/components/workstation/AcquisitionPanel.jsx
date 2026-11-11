import { cn } from '@/lib/utils';

const fmt = (value, digits = 0) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return digits ? num.toFixed(digits) : String(Math.round(num));
};

export default function AcquisitionPanel({ values, baseline, source, note }) {
  const rows = [
    { label: 'kVp', value: fmt(values?.kvp), std: fmt(baseline?.default_kvp), unit: '' },
    { label: 'mAs', value: fmt(values?.mas, 1), std: fmt(baseline?.default_mas, 1), unit: '' },
    { label: 'SID', value: fmt(values?.sid_cm), std: fmt(baseline?.default_sid_cm), unit: 'cm' },
    { label: 'Grid', value: values?.grid || '—', std: baseline?.grid || '—', unit: '' },
    { label: 'Focal spot', value: fmt(values?.focal_spot_mm, 1), std: '0.6', unit: 'mm' },
  ];

  return (
    <section className="border-b border-white/[0.07]">
      <div className="flex items-center justify-between px-3 pb-1.5 pt-2">
        <span className="ws-label">Acquisition</span>
        <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-slate-500">{source}</span>
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 border-b border-white/[0.05] pb-1">
          <span className="flex-1" />
          <span className="w-16 text-right font-mono text-[8px] uppercase tracking-[0.1em] text-cyan-300/70">Active</span>
          <span className="w-12 text-right font-mono text-[8px] uppercase tracking-[0.1em] text-slate-600">Std</span>
        </div>

        {rows.map((row) => {
          const changed = row.value !== row.std && row.value !== '—';
          return (
            <div key={row.label} className="flex items-center gap-2 border-b border-white/[0.04] py-1 last:border-0">
              <span className="flex-1 text-[11px] text-slate-400">{row.label}</span>
              <span className="num w-16 truncate text-right text-[13px] text-white">
                {row.value}
                <span className="ml-0.5 text-[9px] text-slate-500">{row.unit}</span>
              </span>
              <span className={cn('num w-12 truncate text-right text-[11px]', changed ? 'text-amber-300/90' : 'text-slate-600')}>
                {row.std}
              </span>
            </div>
          );
        })}
      </div>

      {note && (
        <p className="border-t border-white/[0.05] px-3 py-1.5 text-[10px] leading-snug text-slate-500">{note}</p>
      )}
    </section>
  );
}