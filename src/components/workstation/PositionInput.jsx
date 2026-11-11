export default function PositionInput({ label, value, min, max, step = 1, unit, onChange }) {
  return (
    <label className="block text-xs text-muted-foreground">
      <span className="flex justify-between gap-2"><span>{label}</span><strong className="font-mono font-medium text-foreground">{value}{unit}</strong></span>
      <input type="range" aria-label={label} value={value} min={min} max={max} step={step} onChange={e => onChange(Number(e.target.value))} className="mt-2 w-full accent-primary" />
    </label>
  );
}