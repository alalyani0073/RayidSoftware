const TONES = {
  high: { stroke: '#FB7185', text: 'text-rose-300', chip: 'bg-rose-500/15 border-rose-400/40' },
  medium: { stroke: '#FBBF24', text: 'text-amber-300', chip: 'bg-amber-500/15 border-amber-400/40' },
  low: { stroke: '#7DD3FC', text: 'text-sky-300', chip: 'bg-sky-500/15 border-sky-400/40' },
};

export default function RadiographStage({ annotations = [], scanning = false, showIdle = false }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#04070B]">
      <div className="relative aspect-[4/3.4] w-full sm:aspect-[4/3]">
        <svg viewBox="0 0 360 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="xrBg" cx="50%" cy="46%" r="64%">
              <stop offset="0%" stopColor="#22303A" stopOpacity="1" />
              <stop offset="70%" stopColor="#0A1118" stopOpacity="1" />
              <stop offset="100%" stopColor="#04070B" stopOpacity="1" />
            </radialGradient>
            <linearGradient id="xrBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DDE6EC" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#9FB3C0" stopOpacity="0.12" />
            </linearGradient>
            <filter id="xrGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <radialGradient id="xrVignette" cx="50%" cy="50%" r="70%">
              <stop offset="60%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
            </radialGradient>
          </defs>

          <rect width="360" height="300" fill="url(#xrBg)" />

          <g>
            <ellipse cx="180" cy="58" rx="24" ry="28" fill="url(#xrBody)" stroke="#CBD5E1" strokeOpacity="0.22" />
            <path d="M180 84 C222 84 252 104 258 132 L262 196 C263 222 261 248 259 276 L101 276 C99 248 97 222 98 196 L102 132 C108 104 138 84 180 84 Z" fill="url(#xrBody)" stroke="#CBD5E1" strokeOpacity="0.2" />
            <ellipse cx="146" cy="176" rx="34" ry="70" fill="#050B11" fillOpacity="0.5" />
            <ellipse cx="214" cy="176" rx="34" ry="70" fill="#050B11" fillOpacity="0.5" />
            <path d="M180 92 L180 272" stroke="#E2E8F0" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const y = 112 + i * 27;
              const spread = 84 - i * 6;
              return (
                <g key={i}>
                  <path d={`M180 ${y} C ${180 - spread * 0.5} ${y - 6} ${180 - spread} ${y + 8} ${180 - spread} ${y + 22}`} fill="none" stroke="#E2E8F0" strokeOpacity="0.3" strokeWidth="1.4" />
                  <g transform="translate(360 0) scale(-1 1)">
                    <path d={`M180 ${y} C ${180 - spread * 0.5} ${y - 6} ${180 - spread} ${y + 8} ${180 - spread} ${y + 22}`} fill="none" stroke="#E2E8F0" strokeOpacity="0.3" strokeWidth="1.4" />
                  </g>
                </g>
              );
            })}
            <path d="M150 100 C164 92 172 90 180 90 C188 90 196 92 210 100" fill="none" stroke="#E2E8F0" strokeOpacity="0.4" strokeWidth="1.6" />
          </g>

          <rect width="360" height="300" filter="url(#xrGrain)" opacity="0.06" />
          <rect width="360" height="300" fill="url(#xrVignette)" />

          {annotations.map((box, i) => {
            const tone = TONES[box.severity] || TONES.low;
            return (
              <g key={`${box.label}-${i}`}>
                <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="none" stroke={tone.stroke} strokeWidth="1.3" strokeDasharray="5 4" rx="3" />
                <rect x={box.x} y={box.y - 13} width={Math.min(box.w + 34, 150)} height="13" fill={tone.stroke} fillOpacity="0.85" rx="2" />
                <text x={box.x + 4} y={box.y - 3.5} fill="#05080D" fontSize="7" fontFamily="JetBrains Mono, monospace" letterSpacing="0.08em">
                  {box.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {scanning && (
          <>
            <div className="pointer-events-none absolute inset-x-0 h-[24%] animate-rayid-sweep bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent" />
            <div className="absolute inset-0 bg-[#04070B]/35" />
            <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200">
              <span className="h-1.5 w-1.5 animate-rayid-pulse rounded-full bg-cyan-300" />
              reading anatomy
            </div>
          </>
        )}

        {showIdle && (
          <div className="absolute inset-0 grid place-items-center bg-[#04070B]/55 backdrop-blur-[1px]">
            <div className="text-center">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">capture received</div>
              <div className="mt-1 text-[13px] text-slate-300">Awaiting RAYID evaluation</div>
            </div>
          </div>
        )}

        <div className="absolute left-3.5 top-3.5 flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/45 px-2.5 py-1 backdrop-blur">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">DICOM · review</span>
        </div>
      </div>
    </div>
  );
}