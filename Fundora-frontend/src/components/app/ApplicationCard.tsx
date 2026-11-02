import { ArrowRight, ExternalLink, FileText, ListChecks } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { buttonClasses } from '@/components/ui/button'
import { deadlineStatus, deadlineText } from '@/features/schemes/format'
import type { Scheme } from '@/features/schemes/types'
import { aidIcons } from './aidIcons'
import { DeadlineTag, EligibilityTag, ModeTag } from './Tags'

type Props = {
  scheme: Scheme
  index: number
  /** Extra controls in the card's top-right corner (e.g. remove). */
  actions?: ReactNode
}

/** A saved scheme: what it is, what it needs and where to apply. No application tracking. */
export function ApplicationCard({ scheme, index, actions }: Props) {
  const { t } = useTranslation()
  const Icon = aidIcons[scheme.aidType]

  return (
    <article className="flex flex-col gap-3.5 rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xl font-extrabold text-brand-strong" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <DeadlineTag status={deadlineStatus(scheme)} />
        <ModeTag mode={scheme.mode} />
        <span className="ml-auto">{actions}</span>
      </div>

      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2">
          <Icon className="size-5" />
        </span>
        <div>
          <h3 className="text-lg leading-snug font-bold">{scheme.name}</h3>
          <p className="text-sm text-muted">{scheme.provider}</p>
        </div>
      </div>

      <EligibilityTag state={scheme.match.state} className="self-start" />

      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-surface p-3.5 text-sm">
        <div>
          <dt className="text-xs font-bold tracking-[0.1em] text-muted uppercase">{t('app.drawer.award')}</dt>
          <dd className="mt-0.5 font-semibold">{scheme.amount}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-[0.1em] text-muted uppercase">{t('app.drawer.deadline')}</dt>
          <dd className="mt-0.5 font-semibold">{deadlineText(scheme, t, false)}</dd>
        </div>
      </dl>

      {/* What the scheme asks for: information, not a checklist we track. */}
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-4" aria-hidden="true" />
          {t('app.applications.docsNeeded', { count: scheme.documents.length })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="size-4" aria-hidden="true" />
          {t('app.drawer.stepsBadge', { count: scheme.steps.length })}
        </span>
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Link
          to={`/schemes/${scheme.id}`}
          className={buttonClasses({}, 'flex-1 basis-36 rounded-xl px-4 text-sm whitespace-nowrap')}
        >
          {t('app.applications.fullDetails')}
          <ArrowRight className="size-4" aria-hidden="true" />
          <span className="sr-only">: {scheme.name}</span>
        </Link>
        <a
          href={scheme.portal.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: 'outline' }, 'rounded-xl px-4 text-sm')}
        >
          {t('app.card.officialSite')}
          <ExternalLink className="size-4" aria-hidden="true" />
          <span className="sr-only">
            {t('app.card.officialSiteFor', { name: scheme.name })} {t('app.newTab')}
          </span>
        </a>
      </div>
    </article>
  )
}
