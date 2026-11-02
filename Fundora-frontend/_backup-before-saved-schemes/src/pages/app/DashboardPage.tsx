import { ArrowRight, Search } from 'lucide-react'
import { useEffect, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { LoadState } from '@/components/app/AppLayout'
import { ApplicationCard } from '@/components/app/ApplicationCard'
import { FeaturedSchemeCard, SchemeCard } from '@/components/app/SchemeCard'
import { useSchemeDetails } from '@/components/app/useSchemeDetails'
import { useApplications } from '@/features/applications/store'
import { useDocumentTicks } from '@/features/schemes/documentTicks'
import { daysUntil } from '@/features/schemes/format'
import { useSchemes } from '@/features/schemes/useSchemes'
import { cn } from '@/lib/cn'

const eyebrow = 'text-xs font-semibold tracking-[0.16em] text-muted uppercase'

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-1.5 rounded-2xl p-5', accent ? 'bg-brand text-white' : 'border border-line bg-white')}>
      <p className={cn('text-xs font-semibold tracking-[0.14em] uppercase', !accent && 'text-muted')}>{label}</p>
      <p className="text-4xl font-extrabold tracking-tight">{value}</p>
      <p className={cn('text-sm', accent ? 'text-white/90' : 'text-muted')}>{sub}</p>
    </div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { schemes, loading, error, retry } = useSchemes()
  const { list: applications } = useApplications()
  const has = useDocumentTicks()
  const { open } = useSchemeDetails()

  useEffect(() => {
    document.title = t('app.dashboard.docTitle')
  }, [t])

  const byId = new Map(schemes.map((s) => [s.id, s]))
  const eligible = schemes.filter((s) => s.match.state === 'eligible' && s.isOpen)
  const closingSoon = eligible.filter((s) => s.closesOn && daysUntil(s.closesOn) >= 0 && daysUntil(s.closesOn) <= 14)
  const active = applications.filter((a) => a.status !== 'awarded' && a.status !== 'applied')
  const activeSchemes = active.map((a) => byId.get(a.schemeId)).filter((s) => s !== undefined)
  const docsTotal = activeSchemes.reduce((n, s) => n + s.documents.length, 0)
  const docsReady = activeSchemes.reduce((n, s) => n + s.documents.filter((d) => has(s.id, d.id)).length, 0)
  const offlineNeeded = activeSchemes.filter((s) => s.mode === 'onlineAndOffline').length
  const popular = [...schemes].filter((s) => s.isOpen).sort((a, b) => a.popularity - b.popularity).slice(0, 5)
  const [featured, ...rest] = popular

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = new FormData(e.currentTarget).get('q')?.toString().trim()
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse')
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <div className="flex flex-wrap items-end gap-4">
        <div className="mr-auto">
          <p className={eyebrow}>{t('app.dashboard.eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{t('app.dashboard.title')}</h1>
        </div>
        <form role="search" onSubmit={onSearch} className="relative w-full sm:w-80">
          <label htmlFor="dash-search" className="sr-only">
            {t('app.browse.searchLabel')}
          </label>
          <Search className="pointer-events-none absolute top-3.5 left-3.5 size-4.5 text-muted" aria-hidden="true" />
          <input
            id="dash-search"
            name="q"
            type="search"
            placeholder={t('app.browse.searchPlaceholder')}
            className="h-12 w-full rounded-xl border border-line bg-white pr-4 pl-10"
          />
        </form>
      </div>

      <LoadState loading={loading} error={error} onRetry={retry} />

      {!loading && !error && (
        <>
          <section aria-label={t('app.dashboard.summary')} className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            <Stat accent label={t('app.dashboard.stats.eligible')} value={String(eligible.length)} sub={t('app.dashboard.stats.eligibleSub')} />
            <Stat label={t('app.dashboard.stats.closing')} value={String(closingSoon.length)} sub={t('app.dashboard.stats.closingSub')} />
            <Stat label={t('app.dashboard.stats.docs')} value={`${docsReady} / ${docsTotal}`} sub={t('app.dashboard.stats.docsSub')} />
            <Stat label={t('app.dashboard.stats.offline')} value={String(offlineNeeded)} sub={t('app.dashboard.stats.offlineSub')} />
          </section>

          <section aria-labelledby="popular-title" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="mr-auto">
                <p className={eyebrow}>{t('app.dashboard.popular.eyebrow')}</p>
                <h2 id="popular-title" className="mt-2 text-2xl font-extrabold tracking-tight">
                  {t('app.dashboard.popular.title')}
                </h2>
              </div>
              <Link to="/browse" className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-strong">
                {t('app.dashboard.popular.all')} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {featured && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="md:col-span-2 xl:col-span-1 xl:row-span-2">
                  <FeaturedSchemeCard scheme={featured} onOpen={open} featuredLabel={t('app.dashboard.popular.top')} />
                </div>
                {rest.map((s) => (
                  <SchemeCard key={s.id} scheme={s} onOpen={open} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="apps-title" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="mr-auto">
                <p className={eyebrow}>{t('app.dashboard.apps.eyebrow')}</p>
                <h2 id="apps-title" className="mt-2 text-2xl font-extrabold tracking-tight">
                  {t('app.dashboard.apps.title')}
                </h2>
              </div>
              <Link to="/applications" className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand-strong">
                {t('app.dashboard.apps.all')} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            {applications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
                <p className="font-semibold">{t('app.dashboard.apps.empty')}</p>
                <Link to="/browse" className="font-semibold text-brand-strong underline">
                  {t('app.dashboard.apps.emptyCta')}
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {applications.slice(0, 3).map((a, i) => {
                  const s = byId.get(a.schemeId)
                  return s ? <ApplicationCard key={a.schemeId} app={a} scheme={s} index={i} onOpen={open} /> : null
                })}
                {applications.length > 3 && (
                  <Link
                    to="/applications"
                    className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-line bg-white p-6 text-center"
                  >
                    <span className="font-semibold">{t('app.dashboard.apps.viewAll', { count: applications.length })}</span>
                    <span className="text-sm text-muted">{t('app.dashboard.apps.viewAllSub')}</span>
                  </Link>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
