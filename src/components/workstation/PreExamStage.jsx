import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLLIMATION = {
  Thorax: { x: 104, y: 58, w: 192, h: 178 },
  Spine: { x: 148, y: 34, w: 104, h: 228 },
  Pelvis: { x: 108, y: 106, w: 184, h: 138 },
  'Lower limb': { x: 160, y: 60, w: 80, h: 210 },
  'Upper limb': { x: 146, y: 88, w: 108, h: 154 },
};

const num = (value, fallback = '—') => (Number.isFinite(Number(value)) ? String(Math.round(Number(value))) : fallback);

export default function PreExamStage({ exam, plan, onStart, disabled }) {
  const box = COLLIMATION[exam.body_part] || { x: 120, y: 60, w: 160, h: 180 };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#0A0E12] px-3 py-1.5">
        <span className="ws-label">Detector · no image acquired</span>
        <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-500">35 × 43 cm · upright bucky</span>
      </div>

      <div className="relative min-h-0 flex-1 bg-[#05080B]">
        <div className="absolute inset-0 grid-field opacity-40" />

        <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
          <defs>
            <linearGradient id="preBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8FE9FF" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#3DDCFF" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <rect x="44" y="14" width="312" height="272" fill="none" stroke="rgba(255,255,255,0.14)" strokeDasharray="2 6" />
          <g stroke="rgba(255,255,255,0.32)" strokeWidth="1.4">
            <path d="M44 30 L44 14 L60 14" />
            <path d="M340 14 L356 14 L356 30" />
            <path d="M44 270 L44 286 L60 286" />
            <path d="M340 286 L356 286 L356 270" />
          </g>

          <g opacity="0.75">
            <ellipse cx="200" cy="52" rx="22" ry="26" fill="url(#preBody)" stroke="#8FE9FF" strokeOpacity="0.3" />
            <path
              d="M200 76 C238 76 262 92 268 116 L272 172 C273 198 271 222 269 250 L131 250 C129 222 127 198 128 172 L132 116 C138 92 162 76 200 76 Z"
              fill="url(#preBody)"
              stroke="#8FE9FF"
              strokeOpacity="0.32"
            />
            <path d="M200 84 L200 246" stroke="#8FE9FF" strokeOpacity="0.16" strokeDasharray="4 6" />
          </g>

          <rect
            x={box.x}
            y={box.y}
            width={box.w}
            height={box.h}
            fill="none"
            stroke="#3DDCFF"
            strokeOpacity="0.6"
            strokeDasharray="7 5"
            strokeWidth="1.2"
          />

          <line x1="200" y1="20" x2="200" y2="282" stroke="#3DDCFF" strokeOpacity="0.45" strokeDasharray="3 6" />
          <line x1="60" y1="150" x2="340" y2="150" stroke="#3DDCFF" strokeOpacity="0.18" strokeDasharray="2 8" />

          <g stroke="#3DDCFF" strokeWidth="1.4" strokeOpacity="0.9">
            <line x1="200" y1="142" x2="200" y2="158" />
            <line x1="192" y1="150" x2="208" y2="150" />
            <circle cx="200" cy="150" r="7" fill="none" />
          </g>
          <text x="210" y="140" fill="#3DDCFF" fillOpacity="0.75" fontSize="7" fontFamily="JetBrains Mono, monospace" letterSpacing="0.12em">
            CENTRAL RAY
          </text>
          <text x={box.x + 3} y={box.y + 11} fill="#3DDCFF" fillOpacity="0.65" fontSize="7" fontFamily="JetBrains Mono, monospace" letterSpacing="0.1em">
            COLLIMATION
          </text>
        </svg>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span className="w-fit rounded-[3px] border border-white/12 bg-black/50 px-1.5 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-400">
            Awaiting exposure
          </span>
          <span className="w-fit rounded-[3px] border border-white/[0.08] bg-black/40 px-1.5 py-[2px] font-mono text-[8.5px] uppercase tracking-[0.12em] text-slate-500">
            {exam.protocol_name}
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2 rounded-[4px] border border-cyan-300/20 bg-[#08131A]/85 px-2.5 py-1.5 backdrop-blur">
          <div>
            <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-cyan-300/80">RAYID · optimised technique</span>
            <p className="num mt-0.5 font-mono text-[11px] text-slate-200">
              {num(plan?.kvp, num(exam.kvp, 110))} kVp · {plan?.mas ? Number(plan.mas).toFixed(1) : num(exam.mas, 5)} mAs ·{' '}
              {num(plan?.sid_cm, num(exam.sid_cm, 180))} cm SID
            </p>
          </div>
          <span className="rounded-[3px] border border-white/10 px-1.5 py-[2px] font-mono text-[8px] uppercase tracking-[0.1em] text-slate-500">
            Simulated detector
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] bg-[#0D1216] px-3 py-2">
        <div>
          <p className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-slate-500">Patient prepared · room ready</p>
          <p className="text-[10.5px] text-slate-400">
            Confirm identity, then bring up the positioning camera.
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={disabled}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-[4px] px-3 py-1.5 text-[11.5px] font-semibold transition-colors',
            disabled ? 'bg-white/10 text-slate-500' : 'bg-cyan-300 text-[#04121A] hover:bg-cyan-200'
          )}
        >
          {disabled ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} /> : null}
          Start positioning
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}