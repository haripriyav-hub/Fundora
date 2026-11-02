import { cn } from '@/lib/cn'

const ink = '#161616'
const brand = '#D63229'
const accent = '#E0A030'

/** Line-art student at a desk, checking results sorted into the three eligibility states. */
export function LoginIllustration({ label, className }: { label: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 480 380"
      role="img"
      aria-label={label}
      className={cn('h-auto', className)}
      fill="none"
      stroke={ink}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Floating items */}
      <g className="animate-float">
        <path d="M58 88l38-16 38 16-38 16z" fill={brand} />
        <path d="M74 95v16c0 7 44 7 44 0V95" fill="#FFFFFF" />
        <path d="M134 88v22" />
        <circle cx="134" cy="114" r="4" fill={accent} />
      </g>
      <g className="animate-float" style={{ animationDelay: '-2s' }}>
        <circle cx="236" cy="70" r="24" fill={accent} />
        <path d="M226 60h20M226 68h20M232 60c10 0 10 16 0 16l12 12" strokeWidth={2.5} />
      </g>
      <g className="animate-float" style={{ animationDelay: '-4s' }}>
        <rect
          x="336"
          y="40"
          width="64"
          height="80"
          rx="8"
          fill="#FFFFFF"
          transform="rotate(8 368 80)"
        />
        <path d="M352 64l32 4M350 78l24 3" strokeWidth={2.5} />
        <circle cx="372" cy="102" r="11" fill="#E5F3EB" stroke="#1F6E46" strokeWidth={2.5} />
        <path d="M367 102l4 4 7-8" stroke="#1F6E46" strokeWidth={2.5} />
      </g>

      {/* Floor and desk */}
      <ellipse cx="240" cy="352" rx="214" ry="14" fill="#FFFFFF" />
      <rect x="40" y="236" width="300" height="12" rx="4" fill="#FFFFFF" />
      <path d="M62 248v100M318 248v100" />

      {/* Laptop showing results */}
      <rect x="112" y="146" width="146" height="90" rx="8" fill="#FFFFFF" />
      <path d="M96 236h178" strokeWidth={4} />
      <circle cx="132" cy="170" r="6" fill="#1F6E46" stroke="none" />
      <circle cx="132" cy="192" r="6" fill={accent} stroke="none" />
      <circle cx="132" cy="214" r="6" fill="#9B2C2C" stroke="none" />
      <path d="M146 170h84M146 192h64M146 214h74" strokeWidth={2.5} />

      {/* Books */}
      <rect x="274" y="216" width="54" height="20" rx="3" fill={accent} />
      <rect x="280" y="198" width="44" height="18" rx="3" fill="#FFFFFF" />

      {/* Student */}
      <path d="M376 262h52M384 262l-8 86M420 262l8 86" />
      <path d="M384 252l-16 96M414 252l6 96" />
      <path d="M376 178c0-8 6-12 14-12h12c8 0 14 4 14 12l8 82h-56z" fill={brand} />
      <path d="M380 196l-60 30" strokeWidth={6} stroke={brand} />
      <circle cx="318" cy="227" r="5" fill="#FFFFFF" />
      <circle cx="396" cy="140" r="20" fill="#FFFFFF" />
      <path d="M376 138c0-14 9-22 20-22s20 8 20 20c-8-6-24-6-40 2z" fill={ink} />

      {/* Lamp */}
      <path d="M64 236v-62l20-22" />
      <path d="M76 142l26 2-10 22z" fill={accent} />
    </svg>
  )
}
