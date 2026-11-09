import { useId } from 'react';

/**
 * Official NEXSPHERE EDU Logo Component
 * Renders the brand logo with the precise orbital node geometry and typography.
 *
 * @param {Object} props
 * @param {'full'|'icon'} [props.variant='full'] - Whether to show the full brandmark or icon only
 * @param {boolean} [props.inverted=false] - Invert text colors for dark backgrounds (e.g. dark sidebars)
 * @param {string} [props.className] - Tailwind / CSS classes for sizing and spacing
 */
export default function Logo({ variant = 'full', inverted = false, className = 'h-9 w-auto', ...props }) {
  const rawId = useId();
  const gradId = `nexsphere-grad-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  if (variant === 'icon') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 130 130"
        className={className}
        aria-label="NexSphere Edu"
        role="img"
        {...props}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        <circle
          cx="65"
          cy="65"
          r="55"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
        />
        <ellipse
          cx="65"
          cy="65"
          rx="25"
          ry="55"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          transform="rotate(45 65 65)"
        />
        <ellipse
          cx="65"
          cy="65"
          rx="25"
          ry="55"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          transform="rotate(-45 65 65)"
        />
        <path
          d="M35 65 H95 M65 35 V95"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="65" cy="65" r="9" fill="#6366F1" />
        <circle cx="65" cy="10" r="5" fill="#38BDF8" />
        <circle cx="120" cy="65" r="5" fill="#6366F1" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 160"
      className={className}
      aria-label="NexSphere Edu"
      role="img"
      {...props}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Orbital Icon */}
      <g transform="translate(20,15)">
        <circle
          cx="65"
          cy="65"
          r="55"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="5"
        />

        <ellipse
          cx="65"
          cy="65"
          rx="25"
          ry="55"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          transform="rotate(45 65 65)"
        />

        <ellipse
          cx="65"
          cy="65"
          rx="25"
          ry="55"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          transform="rotate(-45 65 65)"
        />

        <path
          d="M35 65 H95 M65 35 V95"
          stroke={`url(#${gradId})`}
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="65" cy="65" r="9" fill="#6366F1" />
        <circle cx="65" cy="10" r="5" fill="#38BDF8" />
        <circle cx="120" cy="65" r="5" fill="#6366F1" />
      </g>

      {/* Typography */}
      <text
        x="160"
        y="82"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="47"
        fontWeight="800"
        letterSpacing="1.5"
        fill={inverted ? '#FFFFFF' : '#172554'}
      >
        NEXSPHERE
      </text>

      <text
        x="163"
        y="116"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="19"
        fontWeight="600"
        letterSpacing="9"
        fill={inverted ? '#A5B4FC' : '#6366F1'}
      >
        EDU
      </text>
    </svg>
  );
}
