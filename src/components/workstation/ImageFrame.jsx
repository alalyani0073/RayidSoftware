/**
 * The single image display standard used everywhere clinical imagery appears.
 * The frame is sized in pure CSS: it takes the full height available to it and
 * derives its width from the image's aspect ratio, capped by the pane width.
 * Nothing here depends on a measured container, so the image can never be
 * rendered with a zero, collapsed or unmeasured box.
 */
export default function ImageFrame({
  src,
  alt,
  ratio = '1 / 1',
  className = '',
  frameClassName = '',
  imageStyle,
  frameProps,
  children,
}) {
  return <div className={`relative flex h-full min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden ${className}`}>
    <div
      data-image-frame
      {...frameProps}
      className={`relative overflow-hidden border border-border bg-black ${frameClassName}`}
      style={{ height: '100%', aspectRatio: ratio, maxWidth: '100%' }}
    >
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        className="block h-full w-full object-contain"
        style={imageStyle}
      />
      {children}
    </div>
  </div>;
}