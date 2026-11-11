export default function ExposureField({ label, unit, value, recommended, min, max, step = 1, disabled, onChange }) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs text-muted-foreground"><span>{label}</span><span>{unit}</span></span>
      <input type="number" aria-label={label} min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={e => { const number = Number(e.target.value); if (e.target.value !== '' && number >= min && number <= max) onChange(number); }}
        className="mt-1 h-10 w-full rounded-sm border border-input bg-ws-canvas px-2 font-mono text-lg text-foreground disabled:opacity-60" />
      {recommended !== undefined && <span className="mt-1 block text-xs text-primary">Recommended: {recommended}</span>}
    </label>
  );
}