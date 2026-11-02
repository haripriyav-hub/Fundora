import { ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonClasses } from '@/components/ui/button'
import { deadlineText } from '@/features/schemes/format'
import type { AidType, Scheme } from '@/features/schemes/types'
import { cn } from '@/lib/cn'
import { aidIcons } from './aidIcons'
import { EligibilityTag, EligibilityToggle, ModeTag } from './Tags'

const aidTiles: Record<AidType, string> = {
  scholarship: 'bg-eligible-bg',
  loan: 'bg-info-bg',
  feeWaiver: 'bg-almost-bg',
  device: 'bg-brand-soft',
  hostel: 'bg-surface-2',
  books: 'bg-eligible-bg',
}

type Props = {
  scheme: Scheme
  onOpen: (id: string) => void
  /** Browse shows the reason toggle and the official-site link on every card. */
  detailed?: boolean
  /** Label above the name on the featured card, e.g. "#1 this month". */
  featuredLabel?: string
}

function OfficialLink({ scheme, inverse }: { scheme: Scheme; inverse?: boolean }) {
  const { t } = useTranslation()
  return (
    <a
      href={scheme.portal.url}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses(
        { variant: inverse ? 'inverse' : 'outline' },
        'rounded-xl px-4 text-sm',
      )}
    >
      {t('app.card.officialSite')}
      <ExternalLink className="size-4" aria-hidden="true" />
      <span className="sr-only">
        {t('app.card.officialSiteFor', { name: scheme.name })} {t('app.newTab')}
      </span>
    </a>
  )
}

export function FeaturedSchemeCard({ scheme, onOpen, detailed, featuredLabel }: Props) {
  const { t } = useTranslation()
  const [why, setWhy] = useState(false)
  return (
    <article className="flex h-full min-h-96 flex-col gap-4 rounded-3xl bg-linear-160 from-brand to-brand-strong p-7 text-white">
      <p className="text-xs font-bold tracking-[0.14em] uppercase">
        {featuredLabel} · {t(`app.aidSingular.${scheme.aidType}`)}
      </p>
      <h3 className="text-3xl leading-tight font-extrabold tracking-tight">{scheme.name}</h3>
      <p className="text-white/85">{scheme.provider}</p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white">
          <EligibilityTag state={scheme.match.state} />
        </span>
        <ModeTag mode={scheme.mode} onDark />
      </div>
      {detailed && (
        <div>
          <button
            type="button"
            onClick={() => setWhy((v) => !v)}
            aria-expanded={why}
            className="text-sm font-semibold underline underline-offset-4"
          >
            {t('app.browse.whyLabel')}
          </button>
          {why && <p className="mt-2 rounded-xl bg-white/15 p-3 text-sm">{scheme.match.reason}</p>}
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-extrabold">{scheme.amount}</p>
          <p className="text-sm text-white/85">{deadlineText(scheme, t)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {detailed && <OfficialLink scheme={scheme} inverse />}
          <button
            type="button"
            onClick={() => onOpen(scheme.id)}
            className={buttonClasses({ variant: detailed ? 'onBrand' : 'inverse' }, 'rounded-xl')}
          >
            {t('app.card.viewDetails')}
          </button>
        </div>
      </div>
    </article>
  )
}

export function SchemeCard({ scheme, onOpen, detailed }: Props) {
  const { t } = useTranslation()
  const [why, setWhy] = useState(false)
  const Icon = aidIcons[scheme.aidType]
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', aidTiles[scheme.aidType])}
        >
          <Icon className="size-5" />
        </span>
        <span className="text-xs font-bold tracking-[0.1em] text-muted uppercase">
          {t(`app.aidSingular.${scheme.aidType}`)}
        </span>
      </div>
      <div>
        <h3 className="text-lg leading-snug font-bold">
          <button type="button" onClick={() => onOpen(scheme.id)} className="text-left hover:underline">
            {scheme.name}
          </button>
        </h3>
        <p className="text-sm text-muted">{scheme.provider}</p>
      </div>
      <div>
        <ModeTag mode={scheme.mode} />
      </div>
      {detailed ? (
        <EligibilityToggle
          id={`why-${scheme.id}`}
          state={scheme.match.state}
          reason={scheme.match.reason}
          open={why}
          onToggle={() => setWhy((v) => !v)}
        />
      ) : (
        <EligibilityTag state={scheme.match.state} className="self-start" />
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <p className="font-bold">{scheme.amount}</p>
          <p className="text-sm text-muted">{deadlineText(scheme, t, false)}</p>
        </div>
        {detailed ? (
          <OfficialLink scheme={scheme} />
        ) : (
          <button
            type="button"
            onClick={() => onOpen(scheme.id)}
            className={buttonClasses({ variant: 'outline' }, 'rounded-xl px-4 text-sm')}
          >
            {t('app.card.details')}
          </button>
        )}
      </div>
    </article>
  )
}
