import { Plus, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ApplicationCard } from '@/components/app/ApplicationCard'
import { LoadState } from '@/components/app/AppLayout'
import { useSchemeDetails } from '@/components/app/useSchemeDetails'
import { buttonClasses } from '@/components/ui/button'
import { untrack, useApplications } from '@/features/applications/store'
import type { ApplicationStatus } from '@/features/schemes/types'
import { useSchemes } from '@/features/schemes/useSchemes'
import { cn } from '@/lib/cn'

type Filter = 'all' | ApplicationStatus
const filters: Filter[] = ['all', 'applying', 'applied', 'renewal', 'awarded', 'saved']
type Sort = 'closing' | 'updated'

export function ApplicationsPage() {
  const { t } = useTranslation()
  const { schemes, loading, error, retry } = useSchemes()
  const { list } = useApplications()
  const { open } = useSchemeDetails()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('closing')

  useEffect(() => {
    document.title = t('app.applications.docTitle')
  }, [t])

  const byId = new Map(schemes.map((s) => [s.id, s]))
  const q = query.trim().toLowerCase()
  const rows = list
    .map((app) => ({ app, scheme: byId.get(app.schemeId) }))
    .filter((r) => r.scheme !== undefined)
    .map((r) => ({ app: r.app, scheme: r.scheme! }))
    .filter((r) => (filter === 'all' || r.app.status === filter) && r.scheme.name.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === 'updated'
        ? b.app.updatedAt.localeCompare(a.app.updatedAt)
        : (a.scheme.closesOn ?? '9999').localeCompare(b.scheme.closesOn ?? '9999'),
    )

  const count = (f: Filter) => (f === 'all' ? list.length : list.filter((a) => a.status === f).length)

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
          <option value="updated">{t('app.applications.sort.updated')}</option>
        </select>
        <Link to="/browse" className={buttonClasses({}, 'h-12 rounded-xl bg-ink hover:bg-black')}>
          <Plus className="size-4.5" aria-hidden="true" />
          {t('app.applications.track')}
        </Link>
      </div>

      <div role="group" aria-label={t('app.applications.tabsLabel')} className="flex flex-wrap gap-2 border-b border-line pb-4">
        {filters.map((f) => {
          const on = filter === f
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
              {f === 'all' ? t('app.browse.all') : t(`app.status.${f}`)}
              <span className={cn('rounded-full px-2 text-xs', on ? 'bg-white/20' : 'bg-surface-2')}>{count(f)}</span>
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
              <span className="text-lg font-bold">{t('app.applications.track')}</span>
              <span className="max-w-64 text-sm text-muted">{t('app.applications.trackBody')}</span>
            </Link>
          )}
          {rows.map(({ app, scheme }, i) => (
            <ApplicationCard
              key={app.schemeId}
              app={app}
              scheme={scheme}
              index={i}
              onOpen={open}
              actions={
                <button
                  type="button"
                  onClick={() => untrack(scheme.id)}
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
        className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6"
      >
        <div>
          <h2 id="reminders-title" className="text-xl font-bold">
            {t('app.applications.remindersTitle')}
          </h2>
          <p className="text-sm text-muted">{t('app.applications.remindersBody')}</p>
        </div>
      </section>
    </div>
  )
}
