import { CircleCheck, ExternalLink, X } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { buttonClasses } from '@/components/ui/button'
import { track, untrack, useApplications } from '@/features/applications/store'
import { toggleTick, useDocumentTicks } from '@/features/schemes/documentTicks'
import { deadlineText, hostOf } from '@/features/schemes/format'
import type { Scheme } from '@/features/schemes/types'
import { cn } from '@/lib/cn'
import { EligibilityTag } from './Tags'

type Tab = 'documents' | 'steps' | 'offline'
const tabs: Tab[] = ['documents', 'steps', 'offline']

const label = 'text-xs font-bold tracking-[0.12em] text-muted uppercase'

function Documents({ scheme }: { scheme: Scheme }) {
  const { t } = useTranslation()
  const has = useDocumentTicks()
  const ready = scheme.documents.filter((d) => has(scheme.id, d.id)).length
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted">{t('app.drawer.docsHint')}</p>
        <p className="shrink-0 text-sm font-bold">
          {t('app.drawer.docsReady', { ready, total: scheme.documents.length })}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {scheme.documents.map((doc) => (
          <li key={doc.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-4">
              <input
                type="checkbox"
                checked={has(scheme.id, doc.id)}
                onChange={() => toggleTick(scheme.id, doc.id)}
                className="mt-0.5 size-5 shrink-0 accent-brand"
              />
              <span>
                <span className="block font-semibold">{doc.name}</span>
                <span className="block text-sm text-muted">{doc.note}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Steps({ scheme }: { scheme: Scheme }) {
  return (
    <ol className="flex flex-col">
      {scheme.steps.map((step, i) => (
        <li key={step.title} className="flex gap-4 border-b border-line py-4 last:border-b-0">
          <span className="w-9 shrink-0 text-2xl font-extrabold text-brand-strong" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span>
            <span className="block font-bold">{step.title}</span>
            <span className="block text-sm text-muted">{step.text}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

function Offline({ scheme }: { scheme: Scheme }) {
  const { t } = useTranslation()
  const off = scheme.offline
  if (!off) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-5">
        <CircleCheck className="size-7 shrink-0 text-eligible" aria-hidden="true" />
        <div>
          <p className="font-bold">{t('app.drawer.noOffline.title')}</p>
          <p className="text-sm text-muted">{t('app.drawer.noOffline.body')}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-2xl bg-ink p-5 text-white">
        <p className="text-xs font-bold tracking-[0.12em] text-[#F4A9A3] uppercase">
          {t('app.drawer.offline.required')}
        </p>
        <p className="mt-2 font-semibold">{off.summary}</p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-4">
          <dt className={label}>{t('app.drawer.offline.where')}</dt>
          <dd className="mt-1 text-sm font-semibold">{off.where}</dd>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <dt className={label}>{t('app.drawer.offline.when')}</dt>
          <dd className="mt-1 text-sm font-semibold">{off.when}</dd>
        </div>
      </dl>
      <div className="rounded-2xl border border-line bg-white p-4">
        <p className={label}>{t('app.drawer.offline.carry')}</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {off.carry.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm">
              <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      {off.tip && <p className="rounded-xl bg-almost-bg p-4 text-sm text-almost">{off.tip}</p>}
    </div>
  )
}

/** Side panel with everything a student needs before going to the official portal. */
export function SchemeDrawer({ scheme, onClose }: { scheme: Scheme | null; onClose: () => void }) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<Tab>('documents')
  const { list } = useApplications()
  const tracked = scheme ? list.some((a) => a.schemeId === scheme.id) : false

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
            {tab === 'documents' && <Documents scheme={scheme} />}
            {tab === 'steps' && <Steps scheme={scheme} />}
            {tab === 'offline' && <Offline scheme={scheme} />}
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
                aria-pressed={tracked}
                onClick={() => (tracked ? untrack(scheme.id) : track(scheme.id))}
                className={buttonClasses({ variant: 'outline', size: 'lg' }, 'rounded-2xl')}
              >
                {tracked ? t('app.drawer.tracked') : t('app.drawer.track')}
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
