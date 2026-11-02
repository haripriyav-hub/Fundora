import { LayoutGrid, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'
import { LoadState } from '@/components/app/AppLayout'
import { aidIcons } from '@/components/app/aidIcons'
import { FeaturedSchemeCard, SchemeCard } from '@/components/app/SchemeCard'
import { useSchemeDetails } from '@/components/app/useSchemeDetails'
import type { AidType, MatchState, ProviderType, Scheme, SpecialGroup } from '@/features/schemes/types'
import { useSchemes } from '@/features/schemes/useSchemes'
import { cn } from '@/lib/cn'

type Mode = 'browse' | 'matches'
type Sort = 'best' | 'closing' | 'popular'
type EligFilter = 'all' | MatchState

const aidTypes: AidType[] = ['scholarship', 'loan', 'feeWaiver', 'device', 'hostel', 'books']
const providers: ProviderType[] = ['central', 'state', 'private', 'bank']
const groups: SpecialGroup[] = ['girls', 'disability', 'rural']
const matchOrder: Record<MatchState, number> = { eligible: 0, almost: 1, unknown: 2, not: 3 }
const dot: Record<MatchState, string> = {
  eligible: 'bg-eligible',
  almost: 'bg-almost',
  unknown: 'bg-info',
  not: 'bg-muted',
}

const legend = 'mb-2 text-xs font-bold tracking-[0.12em] text-muted uppercase'

function sortSchemes(list: Scheme[], sort: Sort) {
  return [...list].sort((a, b) => {
    if (sort === 'closing') return (a.closesOn ?? '9999').localeCompare(b.closesOn ?? '9999')
    if (sort === 'popular') return a.popularity - b.popularity
    return matchOrder[a.match.state] - matchOrder[b.match.state] || a.popularity - b.popularity
  })
}

/** Browse every scheme, or (mode="matches") only the ones the student can get or nearly get. */
export function BrowsePage({ mode = 'browse' }: { mode?: Mode }) {
  const { t } = useTranslation()
  const { schemes, loading, error, retry } = useSchemes()
  const { open } = useSchemeDetails()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''

  const [aid, setAid] = useState<'all' | AidType>('all')
  const [elig, setElig] = useState<EligFilter>('all')
  const [openOnly, setOpenOnly] = useState(false)
  const [provider, setProvider] = useState<Record<ProviderType, boolean>>({ central: true, state: true, private: true, bank: true })
  const [group, setGroup] = useState<Record<SpecialGroup, boolean>>({ girls: false, disability: false, rural: false })
  const [sort, setSort] = useState<Sort>('best')

  useEffect(() => {
    document.title = t(mode === 'matches' ? 'app.browse.matchesDocTitle' : 'app.browse.docTitle')
  }, [t, mode])

  function setQuery(value: string) {
    setParams(
      (p) => {
        const next = new URLSearchParams(p)
        if (value) next.set('q', value)
        else next.delete('q')
        return next
      },
      { replace: true },
    )
  }

  function reset() {
    setAid('all')
    setElig('all')
    setOpenOnly(false)
    setProvider({ central: true, state: true, private: true, bank: true })
    setGroup({ girls: false, disability: false, rural: false })
    setQuery('')
  }

  const q = query.trim().toLowerCase()
  const wantedGroups = groups.filter((g) => group[g])
  const pool = schemes.filter((s) => mode === 'browse' || s.match.state === 'eligible' || s.match.state === 'almost')
  const base = pool.filter(
    (s) =>
      (aid === 'all' || s.aidType === aid) &&
      provider[s.providerType] &&
      (!openOnly || s.isOpen) &&
      wantedGroups.every((g) => s.groups.includes(g)) &&
      `${s.name} ${s.provider}`.toLowerCase().includes(q),
  )
  const results = sortSchemes(
    base.filter((s) => elig === 'all' || s.match.state === elig),
    sort,
  )
  const [first, ...rest] = results
  const eligOptions: EligFilter[] =
    mode === 'matches' ? ['all', 'eligible', 'almost'] : ['all', 'eligible', 'almost', 'unknown', 'not']

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t(mode === 'matches' ? 'app.browse.matchesTitle' : 'app.browse.title')}
        </h1>
        <p className="mt-2 text-lg text-muted">
          {t(mode === 'matches' ? 'app.browse.matchesSubtitle' : 'app.browse.subtitle')}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div role="search" className="relative min-w-0 flex-1 basis-80">
          <label htmlFor="browse-search" className="sr-only">
            {t('app.browse.searchLabel')}
          </label>
          <Search className="pointer-events-none absolute top-4.5 left-4 size-5 text-muted" aria-hidden="true" />
          <input
            id="browse-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('app.browse.searchPlaceholder')}
            className="h-14 w-full rounded-2xl border border-line bg-white pr-4 pl-12 text-lg"
          />
        </div>
        <label htmlFor="browse-sort" className="sr-only">
          {t('app.browse.sortLabel')}
        </label>
        <select
          id="browse-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-14 rounded-2xl border border-line bg-white px-4 font-medium"
        >
          <option value="best">{t('app.browse.sort.best')}</option>
          <option value="closing">{t('app.browse.sort.closing')}</option>
          <option value="popular">{t('app.browse.sort.popular')}</option>
        </select>
      </div>

      <div role="group" aria-label={t('app.browse.typesLabel')} className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-7">
        {(['all', ...aidTypes] as const).map((type) => {
          const on = aid === type
          const Icon = type === 'all' ? LayoutGrid : aidIcons[type]
          const n = type === 'all' ? pool.length : pool.filter((s) => s.aidType === type).length
          return (
            <button
              key={type}
              type="button"
              aria-pressed={on}
              onClick={() => setAid(type)}
              className={cn(
                'flex min-h-26 flex-col items-start justify-between gap-2 rounded-2xl border p-3.5 text-left',
                on ? 'border-brand bg-brand text-white' : 'border-line bg-white',
              )}
            >
              <span
                aria-hidden="true"
                className={cn('flex size-9 items-center justify-center rounded-lg', on ? 'bg-white/20' : 'bg-surface-2')}
              >
                <Icon className="size-5" />
              </span>
              <span className="text-sm leading-tight font-semibold">
                {type === 'all' ? t('app.aid.all') : t(`app.aid.${type}`)}
              </span>
              <span className={cn('text-xs font-semibold', on ? 'text-white/90' : 'text-muted')}>{n}</span>
            </button>
          )
        })}
      </div>

      <LoadState loading={loading} error={error} onRetry={retry} />

      {!loading && !error && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <section
            aria-labelledby="filters-title"
            className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-6 lg:w-64 lg:shrink-0"
          >
            <div className="flex items-center justify-between">
              <h2 id="filters-title" className="text-lg font-bold">
                {t('app.browse.filters')}
              </h2>
              <button type="button" onClick={reset} className="min-h-11 px-2 text-sm font-semibold text-brand-strong">
                {t('app.browse.reset')}
              </button>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="font-medium">{t('app.browse.openNow')}</span>
              <input
                type="checkbox"
                role="switch"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="flex h-8 w-13 shrink-0 items-center rounded-full bg-[#C9C3BA] p-1 transition-colors peer-checked:justify-end peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
              >
                <span className="size-6 rounded-full bg-white" />
              </span>
            </label>

            <fieldset>
              <legend className={legend}>{t('app.browse.providerLegend')}</legend>
              {providers.map((p) => (
                <label key={p} className="flex min-h-10 cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={provider[p]}
                    onChange={() => setProvider((v) => ({ ...v, [p]: !v[p] }))}
                    className="size-4.5 accent-brand"
                  />
                  {t(`app.provider.${p}`)}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend className={legend}>{t('app.browse.groupsLegend')}</legend>
              {groups.map((g) => (
                <label key={g} className="flex min-h-10 cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={group[g]}
                    onChange={() => setGroup((v) => ({ ...v, [g]: !v[g] }))}
                    className="size-4.5 accent-brand"
                  />
                  {t(`app.browse.groups.${g}`)}
                </label>
              ))}
            </fieldset>
          </section>

          <section aria-labelledby="results-title" className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="results-title" className="mr-auto text-xl font-bold" aria-live="polite">
                {t('app.browse.results', { count: results.length })}
              </h2>
              <div role="group" aria-label={t('app.browse.eligLabel')} className="flex flex-wrap gap-1 rounded-2xl bg-surface-2 p-1">
                {eligOptions.map((e) => {
                  const on = elig === e
                  const n = e === 'all' ? base.length : base.filter((s) => s.match.state === e).length
                  return (
                    <button
                      key={e}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setElig(e)}
                      className={cn(
                        'inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold',
                        on ? 'bg-white shadow-sm' : 'text-ink/80',
                      )}
                    >
                      {e !== 'all' && <span aria-hidden="true" className={cn('size-2 rounded-full', dot[e])} />}
                      {e === 'all' ? t('app.browse.all') : t(`app.match.${e}`)}
                      <span className="font-medium text-muted">{n}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {first ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="md:col-span-2 xl:col-span-1 xl:row-span-2">
                  <FeaturedSchemeCard scheme={first} onOpen={open} detailed featuredLabel={t('app.browse.bestMatch')} />
                </div>
                {rest.map((s) => (
                  <SchemeCard key={s.id} scheme={s} onOpen={open} detailed />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
                <p className="text-lg font-semibold">{t('app.browse.emptyTitle')}</p>
                <p className="text-muted">{t('app.browse.emptyBody')}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-2 min-h-11 rounded-xl border-[1.5px] border-ink px-5 font-semibold"
                >
                  {t('app.browse.reset')}
                </button>
              </div>
            )}

            <p className="text-sm text-muted">{t('app.browse.footnote')}</p>
          </section>
        </div>
      )}
    </div>
  )
}
