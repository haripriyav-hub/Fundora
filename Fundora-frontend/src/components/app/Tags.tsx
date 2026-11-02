import { ChevronDown, CircleAlert, CircleCheck, CircleHelp, CircleX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DeadlineStatus } from '@/features/schemes/format'
import type { MatchState, SubmissionMode } from '@/features/schemes/types'
import { cn } from '@/lib/cn'

const matchStyles: Record<MatchState, { pill: string; icon: typeof CircleCheck }> = {
  eligible: { pill: 'bg-eligible-bg text-eligible', icon: CircleCheck },
  almost: { pill: 'bg-almost-bg text-almost', icon: CircleAlert },
  not: { pill: 'bg-surface-2 text-ink', icon: CircleX },
  unknown: { pill: 'bg-info-bg text-info', icon: CircleHelp },
}

const pillBase = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold'

export function EligibilityTag({ state, className }: { state: MatchState; className?: string }) {
  const { t } = useTranslation()
  const { pill, icon: Icon } = matchStyles[state]
  return (
    <span className={cn(pillBase, pill, className)}>
      <Icon className="size-4" aria-hidden="true" />
      {t(`app.match.${state}`)}
    </span>
  )
}

/** An eligibility tag that opens a one-line reason underneath it. */
export function EligibilityToggle({
  state,
  reason,
  open,
  onToggle,
  id,
}: {
  state: MatchState
  reason: string
  open: boolean
  onToggle: () => void
  id: string
}) {
  const { t } = useTranslation()
  const { pill, icon: Icon } = matchStyles[state]
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={cn(pillBase, pill, 'min-h-9 self-start')}
      >
        <Icon className="size-4" aria-hidden="true" />
        {t(`app.match.${state}`)}
        <span className="sr-only">{t('app.browse.whyLabel')}</span>
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && (
        <p id={id} className="rounded-xl bg-surface p-3 text-sm text-ink">
          {reason}
        </p>
      )}
    </div>
  )
}

export function ModeTag({ mode, onDark = false }: { mode: SubmissionMode; onDark?: boolean }) {
  const { t } = useTranslation()
  const offline = mode === 'onlineAndOffline'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        onDark
          ? 'bg-brand-strong text-white'
          : offline
            ? 'bg-ink text-white'
            : 'bg-surface-2 text-ink',
      )}
    >
      {t(`app.mode.${mode}`)}
    </span>
  )
}

const deadlineStyles: Record<DeadlineStatus, string> = {
  closingSoon: 'bg-not-bg text-not',
  open: 'bg-eligible-bg text-eligible',
  rolling: 'bg-info-bg text-info',
  closed: 'bg-surface-2 text-ink',
}

/** Where the deadline stands, worked out from the scheme's dates (not from anything the student did). */
export function DeadlineTag({ status }: { status: DeadlineStatus }) {
  const { t } = useTranslation()
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', deadlineStyles[status])}>
      {t(`app.deadlineStatus.${status}`)}
    </span>
  )
}
