import { useEffect, useRef, useState } from 'react';
import { useSize } from '@/hooks/use-size';

/**
 * The single image display standard used everywhere clinical imagery appears.
 * The frame takes the largest box of the image's own aspect ratio that fits the
 * space it is given: it fills the pane, keeps proportions, never crops and
 * never distorts. The frame stays in normal flow so it can never be clipped by
 * a collapsed container, and when no usable height has been measured yet it
 * falls back to a viewport-relative size instead of shrinking away.
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
  const vw = typeof window === 'undefined' ? 900 : window.innerWidth;
  const vh = typeof window === 'undefined' ? 700 : window.innerHeight;
  const spanW = size?.width > 1 ? size.width : vw * 0.5;
  const spanH = size?.height > 1 ? size.height : vh * 0.55;
  const availW = Math.max(220, spanW - 2);
  const availH = Math.max(220, spanH - 2);
  const width = Math.round(Math.min(availW, availH * aspect));
  const height = Math.round(width / aspect);
  return <div ref={hostRef} className={`flex h-full min-h-0 w-full min-w-0 flex-1 items-center justify-center ${className}`}>
    <div
      data-image-frame
      {...frameProps}
      className={`relative overflow-hidden border border-border bg-black ${frameClassName}`}
      style={{ width, height }}
    >
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-contain"
        style={imageStyle}
      />
      {children}
    </div>
  </div>;
}