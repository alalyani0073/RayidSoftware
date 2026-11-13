import { useRef, useState } from 'react';
import { CameraOff, Loader2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useSize } from '@/hooks/use-size';

export default function CameraImage({ src, alt, mirrored, children }) {
  const hostRef = useRef(null);
  const size = useSize(hostRef);
  const [loaded, setLoaded] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const current = loaded?.src === src ? loaded : null;
  const status = current?.status || 'loading';
  const aspect = current?.aspect || 1;
  const width = Math.min(size?.width || 360, (size?.height || 360) * aspect);
  const height = width / aspect;
  return <div ref={hostRef} className="absolute inset-0 flex items-center justify-center overflow-hidden">
    <div data-camera-frame="" className="relative isolate shrink-0 overflow-hidden bg-ws-canvas" style={{ width, height }}>
      <Image
        key={`${src}:${attempt}`}
        src={src}
        alt={alt}
        fittingType="fit"
        loading="eager"
        decoding="async"
        className="absolute inset-0 z-0 block h-full w-full object-contain"
        style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
        onLoad={event => {
          const image = event.currentTarget;
          if (!image.dataset.errorImage && image.naturalWidth) {
            setLoaded({ src, status: 'ready', aspect: image.naturalWidth / image.naturalHeight });
          }
        }}
        onError={() => setLoaded({ src, status: 'error', aspect })}
      />
      <div className="absolute inset-0 z-10">{children}</div>
      {status !== 'ready' && <div role="status" className="absolute bottom-3 left-3 z-20 flex max-w-[90%] items-center gap-2 rounded-sm bg-ws-canvas/80 p-2 text-xs text-muted-foreground">
        {status === 'loading' ? <><Loader2 className="h-4 w-4 shrink-0 animate-spin" /><span>Loading camera image…</span></> : <>
          <CameraOff className="h-4 w-4 shrink-0" /><span>Camera image could not be loaded.</span>
          <button onClick={() => { setLoaded(null); setAttempt(value => value + 1); }} className="shrink-0 rounded-sm border border-border px-2 py-1 text-foreground hover:bg-accent">Reload image</button>
        </>}
      </div>}
    </div>
  </div>;
}