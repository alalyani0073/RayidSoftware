export default function ScoreRing({ score = 0, size = 108, label = 'quality' }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  const dash = (clamped / 100) * circumference;
  const stroke = clamped >= 88 ? '#34D399' : clamped >= 75 ? '#FBBF24' : '#FB7185';

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90" width={size} height={size}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="num text-[24px] font-medium leading-none text-white">{clamped}</div>
        <div className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      </div>
    </div>
  );
}