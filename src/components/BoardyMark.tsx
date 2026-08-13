interface BoardyMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  alt?: string;
  className?: string;
}

const SIZE = {
  sm: { className: 'w-7 h-7', px: 28 },
  md: { className: 'w-11 h-11', px: 44 },
  lg: { className: 'w-16 h-16', px: 64 },
  hero: { className: 'w-44 h-52 sm:w-52 sm:h-60', px: 208 },
} as const;

export function BoardyMark({
  size = 'md',
  alt = 'Boardy',
  className = '',
}: BoardyMarkProps) {
  const dim = SIZE[size];
  const src = size === 'hero' ? '/boardy-hero.jpg' : '/boardy-mark.jpg';

  return (
    <img
      src={src}
      alt={alt}
      width={dim.px}
      height={dim.px}
      className={`object-cover ${dim.className} ${className}`.trim()}
      onError={(e) => {
        e.currentTarget.src = '/boardy-pfp.png';
      }}
    />
  );
}
