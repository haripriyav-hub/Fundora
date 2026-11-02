import { CircleCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Scheme } from '@/features/schemes/types'

/** Section content shared by the details panel and the full scheme page. */

const label = 'text-xs font-bold tracking-[0.12em] text-muted uppercase'

export function DocumentsList({ scheme }: { scheme: Scheme }) {
  return (
    <ol className="flex flex-col gap-2">
      {scheme.documents.map((doc, i) => (
        <li key={doc.id} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-strong"
          >
            {i + 1}
          </span>
          <span>
            <span className="block font-semibold">{doc.name}</span>
            <span className="block text-sm text-muted">{doc.note}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

export function StepsList({ scheme }: { scheme: Scheme }) {
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

export function OfflineInfo({ scheme }: { scheme: Scheme }) {
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
