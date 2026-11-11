export default function SensorStage({ rotation = 0, centring = 0, rotationTolerance = 2, centringTolerance = 12 }) {
  const offsetPx = centring * 1.5;
  const rotationOk = Math.abs(rotation) <= rotationTolerance;
  const centringOk = Math.abs(centring) <= centringTolerance;
  const field = centringOk ? '#3DDCFF' : '#FBBF24';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#05080D]">
      <div className="relative aspect-[4/4.2] w-full">
        <svg viewBox="0 0 360 440" className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="stageGlow" cx="50%" cy="46%" r="62%">
              <stop offset="0%" stopColor="#0E2230" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#070C13" stopOpacity="1" />
              <stop offset="100%" stopColor="#03060A" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8FE9FF" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#3DDCFF" stopOpacity="0.05" />
            </linearGradient>
            <pattern id="stageGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M30 0H0V30" fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width="360" height="440" fill="url(#stageGlow)" />
          <rect width="360" height="440" fill="url(#stageGrid)" />

          <line x1="180" y1="16" x2="180" y2="424" stroke="#3DDCFF" strokeOpacity="0.28" strokeDasharray="3 7" />
          <line x1="26" y1="220" x2="334" y2="220" stroke="#3DDCFF" strokeOpacity="0.14" strokeDasharray="2 8" />

          <g transform={`translate(${offsetPx} 0) rotate(${rotation} 180 220)`}>
            <ellipse cx="180" cy="64" rx="27" ry="31" fill="url(#bodyFill)" stroke="#8FE9FF" strokeOpacity="0.4" strokeWidth="1.2" />
            <path d="M180 96 C214 96 238 108 246 128 L252 196 C254 226 252 254 248 284 L242 372 C240 392 238 404 237 414 L123 414 C122 404 120 392 118 372 L112 284 C108 254 106 226 108 196 L114 128 C122 108 146 96 180 96 Z" fill="url(#bodyFill)" stroke="#8FE9FF" strokeOpacity="0.45" strokeWidth="1.4" />
            <ellipse cx="152" cy="255" rx="34" ry="66" fill="#3DDCFF" fillOpacity="0.07" />
            <ellipse cx="208" cy="255" rx="34" ry="66" fill="#3DDCFF" fillOpacity="0.07" />
            <path d="M180 112 L180 408" stroke="#8FE9FF" strokeOpacity="0.22" strokeDasharray="4 6" />
            {[0, 1, 2, 3, 4].map((i) => {
              const y = 152 + i * 32;
              const spread = 74 - i * 5;
              return (
                <g key={i}>
                  <path d={`M180 ${y} C ${180 - spread * 0.55} ${y - 4} ${180 - spread} ${y + 12} ${180 - spread} ${y + 26}`} fill="none" stroke="#8FE9FF" strokeOpacity="0.3" strokeWidth="1.1" />
                  <g transform="translate(360 0) scale(-1 1)">
                    <path d={`M180 ${y} C ${180 - spread * 0.55} ${y - 4} ${180 - spread} ${y + 12} ${180 - spread} ${y + 26}`} fill="none" stroke="#8FE9FF" strokeOpacity="0.3" strokeWidth="1.1" />
                  </g>
                </g>
              );
            })}
            <path d="M148 132 C162 124 174 122 180 122 C186 122 198 124 212 132" fill="none" stroke="#8FE9FF" strokeOpacity="0.35" strokeWidth="1.1" />
          </g>

          <rect x="54" y="34" width="252" height="372" fill="none" stroke={field} strokeOpacity="0.55" strokeDasharray="6 6" strokeWidth="1.2" style={{ transition: 'stroke 300ms' }} />
          <g stroke={field} strokeWidth="1.6" fill="none" opacity="0.9" style={{ transition: 'stroke 300ms' }}>
            <path d="M54 60 L54 34 L80 34" />
            <path d="M280 34 L306 34 L306 60" />
            <path d="M54 380 L54 406 L80 406" />
            <path d="M280 406 L306 406 L306 380" />
          </g>
        </svg>

        <div
          className="pointer-events-none absolute inset-x-0 h-[38%] animate-rayid-sweep bg-gradient-to-b from-transparent via-cyan-300/[0.06] to-transparent"
          style={{ top: 0 }}
        />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-rayid-pulse rounded-full bg-rose-400" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-rose-300/90">Rec · sensor 02</span>
        </div>

        <div className="absolute right-4 top-4 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">depth · 30 fps</div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
          <div className="rounded-lg border border-white/[0.08] bg-black/45 px-2.5 py-1.5 backdrop-blur">
            <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-500">rotation</div>
            <div className={`num text-[13px] ${rotationOk ? 'text-emerald-300' : 'text-amber-300'}`}>
              {rotation > 0 ? '+' : ''}
              {rotation.toFixed(1)}°
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-black/45 px-2.5 py-1.5 backdrop-blur">
            <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-500">centring</div>
            <div className={`num text-[13px] ${centringOk ? 'text-emerald-300' : 'text-amber-300'}`}>
              {centring > 0 ? '+' : ''}
              {centring} mm
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-black/45 px-2.5 py-1.5 backdrop-blur">
            <div className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-slate-500">field</div>
            <div className="num text-[13px] text-slate-300">{centringOk ? 'fitted' : 'missed'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}