import { useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function CameraImage({ src, alt, mirrored, children }) {
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  return <div className="absolute inset-0 overflow-hidden" style={{ containerType: 'size' }}>
    <div
      data-camera-frame=""
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-ws-canvas"
      style={{ width: 'min(100cqw, 100cqh)', height: 'min(100cqw, 100cqh)' }}
    >
      <Image
        key={attempt}
        src={src}
        alt={alt}
        fittingType="fit"
        originWidth={1024}
        originHeight={1024}
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full"
        style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
        onLoad={event => {
          if (!event.currentTarget.dataset.errorImage) setStatus('ready');
        }}
        onError={() => setStatus('error')}
      />
      {status === 'ready' && children}
      {status !== 'ready' && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ws-canvas p-4 text-center text-xs text-muted-foreground">
        {status === 'loading' ? <><Loader2 className="h-5 w-5 animate-spin" /><span>Loading camera image…</span></> : <>
          <CameraOff className="h-6 w-6" /><span>Camera image could not be loaded.</span>
          <button onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }} className="rounded-sm border border-border px-3 py-1.5 text-foreground hover:bg-accent">Reload image</button>
        </>}
      </div>}
    </div>
  </div>;
}