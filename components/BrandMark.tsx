/**
 * Editorial wordmark: "tj." in Source Serif 4 italic — replaces the prior
 * circular pill mark. The dot is set in the sage accent for a quiet
 * masthead signature.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 32" className={`block ${className}`} aria-label="tj." role="img">
      <text
        x={0}
        y={24}
        textAnchor="start"
        className="fill-[var(--ink)]"
        style={{
          fontFamily: '"Source Serif 4", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 600,
          fontSize: 24,
          fontVariationSettings: '"opsz" 24',
          letterSpacing: '-0.02em',
        }}
      >
        tj
      </text>
      <text
        x={20}
        y={24}
        textAnchor="start"
        className="fill-[var(--sage)]"
        style={{
          fontFamily: '"Source Serif 4", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 24,
        }}
      >
        .
      </text>
    </svg>
  );
}
