import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'

export function Logo({ inverted = false }: { inverted?: boolean }) {
  const { t } = useTranslation()
  return (
    <Link to="/" aria-label={t('brand.homeLabel')} className="inline-flex items-center gap-2.5">
      {/* Red circle with a white asterisk */}
      <svg viewBox="0 0 36 36" className="size-9" aria-hidden="true">
        <circle cx="18" cy="18" r="18" fill={inverted ? '#FFFFFF' : '#D63229'} />
        <g stroke={inverted ? '#D63229' : '#FFFFFF'} strokeWidth="3.2" strokeLinecap="round">
          <path d="M18 9v18M10.2 13.5l15.6 9M10.2 22.5l15.6-9" />
        </g>
      </svg>
      <span
        className={cn(
          'text-xl font-extrabold tracking-tight',
          inverted ? 'text-white' : 'text-ink',
        )}
      >
        {t('brand.name')}
      </span>
    </Link>
  )
}
