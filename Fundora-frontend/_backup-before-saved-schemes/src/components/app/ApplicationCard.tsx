import { ListChecks, FileText } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useDocumentTicks } from '@/features/schemes/documentTicks'
import { deadlineText } from '@/features/schemes/format'
import type { Scheme, TrackedApplication } from '@/features/schemes/types'
import { aidIcons } from './aidIcons'
import { StatusTag } from './Tags'

type Props = {
  app: TrackedApplication
  scheme: Scheme
  index: number
  onOpen: (id: string) => void
  /** Extra controls in the card's top-right corner (e.g. the untrack menu). */
  actions?: ReactNode
}

export function ApplicationCard({ app, scheme, index, onOpen, actions }: Props) {
  const { t } = useTranslation()
  const has = useDocumentTicks()
  const ready = scheme.documents.filter((d) => has(scheme.id, d.id)).length
  const Icon = aidIcons[scheme.aidType]
  const offlinePending = scheme.mode === 'onlineAndOffline' && app.status !== 'applied' && app.status !== 'awarded'

  return (
    <article className="flex flex-col gap-3.5 rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <span className="text-xl font-extrabold text-brand-strong" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <StatusTag status={app.status} />
        {offlinePending && (
          <span className="rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-white">
            {t('app.applications.offlineStep')}
          </span>
        )}
        <span className="ml-auto">{actions}</span>
      </div>
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-2">
          <Icon className="size-5" />
        </span>
        <h3 className="text-lg leading-snug font-bold">{scheme.name}</h3>
      </div>
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label={t('app.applications.progress')}
          aria-valuenow={app.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 flex-1 rounded-full bg-surface-2"
        >
          <div className="h-full rounded-full bg-brand" style={{ width: `${app.progress}%` }} />
        </div>
        <span className="text-sm font-semibold text-muted">{app.progress}%</span>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1">
          <FileText className="size-4" aria-hidden="true" />
          {t('app.applications.docsChip', { ready, total: scheme.documents.length })}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1">
          <ListChecks className="size-4" aria-hidden="true" />
          {t('app.drawer.stepsBadge', { count: scheme.steps.length })}
        </span>
      </div>
      <p className="text-sm text-muted">{deadlineText(scheme, t)}</p>
      <p className="truncate rounded-xl bg-surface px-3.5 py-3 text-sm font-medium">{app.nextStep}</p>
      <button
        type="button"
        onClick={() => onOpen(scheme.id)}
        className="min-h-11 self-start font-bold text-brand-strong hover:underline"
      >
        {t('app.applications.openDetails')}
        <span className="sr-only">: {scheme.name}</span>
      </button>
    </article>
  )
}
