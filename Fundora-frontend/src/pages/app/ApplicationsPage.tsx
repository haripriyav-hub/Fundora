import { Plus, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ApplicationCard } from '@/components/app/ApplicationCard'
import { LoadState } from '@/components/app/AppLayout'
import { buttonClasses } from '@/components/ui/button'
import { unsave, useSavedSchemes } from '@/features/applications/store'
import { deadlineStatus } from '@/features/schemes/format'
import type { Scheme } from '@/features/schemes/types'
import { useSchemes } from '@/features/schemes/useSchemes'
import { cn } from '@/lib/cn'

type Filter = 'all' | 'closingSoon' | 'open' | 'offline' | 'closed'
const filters: Filter[] = ['all', 'closingSoon', 'open', 'offline', 'closed']
type Sort = 'closing' | 'saved'

const matches: Record<Filter, (s: Scheme) => boolean> = {
  all: () => true,
  closingSoon: (s) => deadlineStatus(s) === 'closingSoon',
  open: (s) => deadlineStatus(s) !== 'closed',
  offline: (s) => s.mode === 'onlineAndOffline',
  closed: (s) => deadlineStatus(s) === 'closed',
}

/** Schemes the student saved to apply for, each with everything needed to apply on the official site. */
export function ApplicationsPage() {
  const { t } = useTranslation()
  const { schemes, loading, error, retry } = useSchemes()
  const { list } = useSavedSchemes()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('closing')

  useEffect(() => {
    document.title = t('app.applications.docTitle')
  }, [t])

  const byId = new Map(schemes.map((s) => [s.id, s]))
  const saved = list.flatMap((a) => {
    const scheme = byId.get(a.schemeId)
    return scheme ? [{ ...a, scheme }] : []
  })
  const q = query.trim().toLowerCase()
  const rows = saved
    .filter((r) => matches[filter](r.scheme) && `${r.scheme.name} ${r.scheme.provider}`.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === 'saved'
        ? b.savedOn.localeCompare(a.savedOn)
        : (a.scheme.closesOn ?? '9999').localeCompare(b.scheme.closesOn ?? '9999'),
    )

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <nav aria-label={t('app.applications.breadcrumb')} className="text-sm font-semibold text-muted">
          <Link to="/dashboard" className="hover:underline">
            {t('app.nav.home')}
          </Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{t('app.nav.applications')}</span>
        </nav>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('app.applications.title')}</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted">{t('app.applications.subtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1 basis-72">
          <label htmlFor="app-search" className="sr-only">
            {t('app.applications.searchLabel')}
          </label>
          <Search className="pointer-events-none absolute top-4 left-4 size-4.5 text-muted" aria-hidden="true" />
          <input
            id="app-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('app.applications.searchPlaceholder')}
            className="h-12 w-full rounded-xl border border-line bg-white pr-4 pl-11"
          />
        </div>
        <label className="sr-only" htmlFor="app-sort">
          {t('app.applications.sortLabel')}
        </label>
        <select
          id="app-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-12 rounded-xl border border-line bg-white px-3 font-medium"
        >
          <option value="closing">{t('app.applications.sort.closing')}</option>
          <option value="saved">{t('app.applications.sort.saved')}</option>
        </select>
        <Link to="/browse" className={buttonClasses({}, 'h-12 rounded-xl bg-ink hover:bg-black')}>
          <Plus className="size-4.5" aria-hidden="true" />
          {t('app.applications.add')}
        </Link>
      </div>

      <div role="group" aria-label={t('app.applications.tabsLabel')} className="flex flex-wrap gap-2 border-b border-line pb-4">
        {filters.map((f) => {
          const on = filter === f
          const n = saved.filter((r) => matches[f](r.scheme)).length
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(f)}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold',
                on ? 'border-ink bg-ink text-white' : 'border-line bg-white',
              )}
            >
              {t(`app.applications.filters.${f}`)}
              <span className={cn('rounded-full px-2 text-xs', on ? 'bg-white/20' : 'bg-surface-2')}>{n}</span>
            </button>
          )
        })}
      </div>

      <LoadState loading={loading} error={error} onRetry={retry} />

      {!loading && !error && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filter === 'all' && !q && (
            <Link
              to="/browse"
              className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border-[1.5px] border-dashed border-line bg-white/60 p-7 text-center"
            >
              <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-surface-2">
                <Plus className="size-6 text-muted" />
              </span>
              <span className="text-lg font-bold">{t('app.applications.add')}</span>
              <span className="max-w-64 text-sm text-muted">{t('app.applications.addBody')}</span>
            </Link>
          )}
          {rows.map(({ scheme }, i) => (
            <ApplicationCard
              key={scheme.id}
              scheme={scheme}
              index={i}
              actions={
                <button
                  type="button"
                  onClick={() => unsave(scheme.id)}
                  aria-label={t('app.applications.remove', { name: scheme.name })}
                  title={t('app.applications.removeShort')}
                  className="flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface"
                >
                  <X className="size-4.5" aria-hidden="true" />
                </button>
              }
            />
          ))}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (filter !== 'all' || q) && (
        <p className="py-8 text-center text-muted">{t('app.applications.empty')}</p>
      )}

      <section
        aria-labelledby="reminders-title"
        className="mt-4 flex flex-col gap-1 border-t border-line pt-6"
      >
        <h2 id="reminders-title" className="text-xl font-bold">
          {t('app.applications.remindersTitle')}
        </h2>
        <p className="text-sm text-muted">{t('app.applications.remindersBody')}</p>
      </section>
    </div>
  )
}
