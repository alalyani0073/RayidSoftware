import { useEffect, useRef, useState } from 'react';
import { Image } from '@/components/ui/image';
import { useSize } from '@/hooks/use-size';

/**
 * The single image display standard used everywhere clinical imagery appears.
 * The frame takes the largest box of the image's own aspect ratio that fits the
 * space it is given: it always fills the pane, keeps proportions, never crops
 * and never distorts. The area is measured absolutely (not from its own
 * content), so the frame can never collapse to a fallback size, and the ratio
 * is read from the image itself unless one is given explicitly.
 */
export default function ImageFrame({
  src,
  alt,
  ratio,
  className = '',
  frameClassName = '',
  imageStyle,
  frameProps,
  children,
}) {
  const hostRef = useRef(null);
  const size = useSize(hostRef);
  const [natural, setNatural] = useState(null);

  useEffect(() => {
    if (ratio) return;
    let alive = true;
    const probe = new window.Image();
    probe.onload = () => {
      if (alive && probe.naturalWidth && probe.naturalHeight) setNatural(probe.naturalWidth / probe.naturalHeight);
    };
    probe.src = src;
    return () => { alive = false; };
  }, [src, ratio]);

  const explicit = ratio ? String(ratio).split('/').map((value) => Number(value.trim()) || 1) : null;
  const aspect = explicit ? explicit[0] / explicit[1] : natural || 1;
  const availW = Math.max(120, (size?.width || 320) - 2);
  const availH = Math.max(120, (size?.height || 320) - 2);
  const width = Math.round(Math.min(availW, availH * aspect));
  const height = Math.round(width / aspect);
  return <div ref={hostRef} className={`relative h-full min-h-0 w-full min-w-0 flex-1 ${className}`}>
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        data-image-frame
        {...frameProps}
        className={`relative overflow-hidden border border-border bg-black ${frameClassName}`}
        style={{ width, height }}
      >
        <Image src={src} alt={alt} fittingType="fit" className="h-full w-full" style={imageStyle} />
        {children}
      </div>
    </div>
  </div>;
}