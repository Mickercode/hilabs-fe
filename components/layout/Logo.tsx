/**
 * The HiLabs mark: three arcs for the three phases, two rings sinking toward an amber core.
 * Never redraw, recolour or rotate it.
 */
export function Logo({ size = 32, reversed = false }: { size?: number; reversed?: boolean }) {
  const stroke = reversed ? '#FFFFFF' : '#2B2A7A';

  return (
    <svg viewBox="6 6 108 108" width={size} height={size} role="img" aria-label="HiLabs">
      <g fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round">
        <path d="M74.21 16.25 A46 46 0 0 1 104.99 69.56" />
        <path d="M90.78 94.18 A46 46 0 0 1 29.22 94.18" />
        <path d="M15.01 69.56 A46 46 0 0 1 45.79 16.25" />
      </g>
      <circle cx="60" cy="62" r="28" fill="none" stroke={stroke} strokeWidth="4" />
      <circle cx="60" cy="66" r="16" fill="none" stroke={stroke} strokeWidth="4" />
      <circle cx="60" cy="71" r="6" fill="#F2A93B" />
    </svg>
  );
}
