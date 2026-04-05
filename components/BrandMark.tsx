/**
 * Circular “T” mark: Fraunces black / text-sm optical size, matches nav + favicon.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`block ${className}`} aria-hidden>
      <rect
        width={32}
        height={32}
        rx={16}
        className="fill-forest transition-colors group-hover:fill-forest/80 dark:fill-white dark:group-hover:fill-white/90"
      />
      <text
        x={16}
        y={16}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-white transition-colors dark:fill-forest"
        style={{
          fontFamily: '"Fraunces", serif',
          fontWeight: 900,
          fontSize: 14,
          fontVariationSettings: '"opsz" 9',
        }}
      >
        T
      </text>
    </svg>
  );
}
