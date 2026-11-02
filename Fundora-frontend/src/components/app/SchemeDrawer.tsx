import { ArrowRight, ExternalLink, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonClasses } from '@/components/ui/button'
import { Link } from 'react-router'
import { save, unsave, useSavedSchemes } from '@/features/applications/store'
import { deadlineText, hostOf } from '@/features/schemes/format'
import type { Scheme } from '@/features/schemes/types'
import { cn } from '@/lib/cn'
import { DocumentsList, OfflineInfo, StepsList } from './SchemeSections'
import { EligibilityTag } from './Tags'

type Tab = 'documents' | 'steps' | 'offline'
const tabs: Tab[] = ['documents', 'steps', 'offline']

const label = 'text-xs font-bold tracking-[0.12em] text-muted uppercase'

/** Side panel with everything a student needs before going to the official portal. */
export function SchemeDrawer({ scheme, onClose }: { scheme: Scheme | null; onClose: () => void }) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<Tab>('documents')
  const { list } = useSavedSchemes()
  const saved = scheme ? list.some((a) => a.schemeId === scheme.id) : false

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (scheme && !dialog.open) dialog.showModal()
    if (!scheme && dialog.open) dialog.close()
  }, [scheme])

  // A different scheme starts on the Documents tab.
  const [shownId, setShownId] = useState(scheme?.id)
  if (scheme?.id !== shownId) {
    setShownId(scheme?.id)
    setTab('documents')
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    const next = tabs[(tabs.indexOf(tab) + step + tabs.length) % tabs.length]
    setTab(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  const badge = (key: Tab) => {
    if (!scheme) return ''
    if (key === 'documents') return String(scheme.documents.length)
    if (key === 'steps') return t('app.drawer.stepsBadge', { count: scheme.steps.length })
    return scheme.offline ? t('app.drawer.offlineRequired') : t('app.drawer.offlineNotNeeded')
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="scheme-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-xl bg-surface p-0 text-ink backdrop:bg-ink/45"
    >
      {scheme && (
        <div className="flex min-h-full flex-col">
          <header className="flex flex-col gap-4 bg-brand px-6 pt-5 pb-6 text-white sm:px-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold tracking-[0.14em] uppercase">
                {t(`app.aidSingular.${scheme.aidType}`)} · {scheme.provider}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('app.drawer.close')}
                className="flex size-11 items-center justify-center rounded-xl border border-white/50 hover:bg-white/10"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <h2 id="scheme-title" className="text-3xl leading-tight font-extrabold tracking-tight">
              {scheme.name}
            </h2>
            <div className="flex items-start gap-3 rounded-2xl bg-white p-4 text-ink">
              <EligibilityTag state={scheme.match.state} className="shrink-0" />
              <p className="pt-0.5 text-sm">{scheme.match.reason}</p>
            </div>
          </header>

          <dl className="grid grid-cols-3 gap-px border-b border-line bg-line">
            <div className="bg-white px-4 py-3">
              <dt className={label}>{t('app.drawer.award')}</dt>
              <dd className="mt-1 text-sm font-bold">{scheme.amount}</dd>
            </div>
            <div className="bg-white px-4 py-3">
              <dt className={label}>{t('app.drawer.deadline')}</dt>
              <dd className="mt-1 text-sm font-bold">{deadlineText(scheme, t)}</dd>
            </div>
            <div className="bg-white px-4 py-3">
              <dt className={label}>{t('app.drawer.submit')}</dt>
              <dd className="mt-1 text-sm font-bold">{t(`app.mode.${scheme.mode}`)}</dd>
            </div>
          </dl>

          <div role="tablist" aria-label={t('app.drawer.tabsLabel')} className="flex flex-wrap gap-2 px-6 pt-5 sm:px-8">
            {tabs.map((key) => {
              const on = tab === key
              const warn = key === 'offline' && scheme.offline
              return (
                <button
                  key={key}
                  id={`tab-${key}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls={`panel-${key}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setTab(key)}
                  onKeyDown={onTabKey}
                  className={cn(
                    'inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold',
                    on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink',
                  )}
                >
                  {t(`app.drawer.tabs.${key}`)}
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-bold',
                      warn ? 'bg-brand text-white' : on ? 'bg-white/20' : 'bg-surface-2',
                    )}
                  >
                    {badge(key)}
                  </span>
                </button>
              )
            })}
          </div>

          <div
            id={`panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            className="flex-1 px-6 py-5 sm:px-8"
          >
            {tab === 'documents' && (
              <>
                <p className="mb-3 text-sm text-muted">{t('app.detail.documentsIntro')}</p>
                <DocumentsList scheme={scheme} />
              </>
            )}
            {tab === 'steps' && <StepsList scheme={scheme} />}
            {tab === 'offline' && <OfflineInfo scheme={scheme} />}
            <Link
              to={`/schemes/${scheme.id}`}
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-bold text-brand-strong hover:underline"
            >
              {t('app.drawer.fullDetails')}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <footer className="sticky bottom-0 flex flex-col gap-2.5 border-t border-line bg-white px-6 py-4 sm:px-8">
            <div className="flex flex-wrap gap-2.5">
              <a
                href={scheme.portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ size: 'lg' }, 'flex-1 basis-60 rounded-2xl')}
              >
                {t('app.drawer.open', { portal: scheme.portal.name })}
                <ExternalLink className="size-4" aria-hidden="true" />
                <span className="sr-only">{t('app.newTab')}</span>
              </a>
              <button
                type="button"
                aria-pressed={saved}
                onClick={() => (saved ? unsave(scheme.id) : save(scheme.id))}
                className={buttonClasses({ variant: 'outline', size: 'lg' }, 'rounded-2xl')}
              >
                {saved ? t('app.drawer.saved') : t('app.drawer.save')}
              </button>
            </div>
            <p className="text-xs text-muted">
              {t('app.drawer.footnote', { domain: hostOf(scheme.portal.url) })}
            </p>
          </footer>
        </div>
      )}
    </dialog>
  )
}
