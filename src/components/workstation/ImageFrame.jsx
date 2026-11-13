import { useRef } from 'react';
import { Image } from '@/components/ui/image';
import { useSize } from '@/hooks/use-size';

/**
 * The single image display standard used everywhere clinical imagery appears.
 * The frame takes the largest box of the image's own aspect ratio that fits the
 * space it is given: it always fills the pane, keeps proportions, never crops
 * and never distorts. Overlays passed as children are positioned against the
 * frame, so annotation geometry stays locked to the image.
 */
export default function ImageFrame({
  src,
  alt,
  ratio = '4 / 5',
  className = '',
  frameClassName = '',
  imageStyle,
  frameProps,
  children,
}) {
  const hostRef = useRef(null);
  const size = useSize(hostRef);
  const [aw, ah] = String(ratio).split('/').map((value) => Number(value.trim()) || 1);
  const aspect = aw / ah;
  const availW = Math.max(140, (size?.width || 360) - 2);
  const availH = Math.max(140, (size?.height || 360) - 2);
  const width = Math.round(Math.min(availW, availH * aspect));
  const height = Math.round(width / aspect);
  return <div ref={hostRef} className={`flex h-full min-h-0 w-full min-w-0 flex-1 items-center justify-center ${className}`}>
    <div
      data-image-frame
      {...frameProps}
      className={`relative overflow-hidden border border-border bg-black ${frameClassName}`}
      style={{ width, height }}
    >
      <Image src={src} alt={alt} fittingType="fit" className="h-full w-full" style={imageStyle} />
      {children}
    </div>
  </div>;
}