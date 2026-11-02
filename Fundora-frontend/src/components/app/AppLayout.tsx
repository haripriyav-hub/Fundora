import { Compass, FileText, House, Target, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'
import { Logo } from '@/components/layout/Logo'
import { usingMockData } from '@/features/schemes/api'
import { useSchemes } from '@/features/schemes/useSchemes'
import { cn } from '@/lib/cn'
import { SchemeDrawer } from './SchemeDrawer'
import { useSchemeDetails } from './useSchemeDetails'

const items: Array<{ to: string; key: string; icon: LucideIcon }> = [
  { to: '/dashboard', key: 'home', icon: House },
  { to: '/matches', key: 'matches', icon: Target },
  { to: '/applications', key: 'applications', icon: FileText },
  { to: '/browse', key: 'browse', icon: Compass },
]

/** Signed-in shell: dark sidebar on desktop, a scrolling tab row on phones. */
export function AppLayout() {
  const { t } = useTranslation()
  const { schemes } = useSchemes()
  const { openId, close } = useSchemeDetails()
  const openScheme = schemes.find((s) => s.id === openId) ?? null

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        {t('nav.skip')}
      </a>
      <aside className="flex flex-col gap-4 bg-ink px-4 py-4 text-white lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:gap-7 lg:py-6">
        <div className="px-2">
          <Logo inverted />
        </div>
        <nav aria-label={t('app.nav.label')}>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {items.map(({ to, key, icon: Icon }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 font-medium',
                      isActive ? 'bg-brand font-semibold text-white' : 'text-[#D8D3CC] hover:bg-white/10',
                    )
                  }
                >
                  <Icon className="size-5" aria-hidden="true" />
                  {t(`app.nav.${key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto hidden rounded-2xl border border-white/15 p-4 lg:block">
          <p className="text-xs font-bold tracking-[0.14em] text-[#F4A9A3] uppercase">
            {t('app.sidebarNote.title')}
          </p>
          <p className="mt-2 text-sm text-[#D8D3CC]">{t('app.sidebarNote.body')}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {usingMockData && (
          <p role="note" className="bg-almost-bg px-4 py-2 text-center text-sm font-medium text-almost">
            {t('app.sampleData')}
          </p>
        )}
        <main id="main" className="flex-1 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>

      <SchemeDrawer scheme={openScheme} onClose={close} />
    </div>
  )
}

/** Loading and error states shared by the app pages. */
export function LoadState({ loading, error, onRetry }: { loading: boolean; error: boolean; onRetry: () => void }) {
  const { t } = useTranslation()
  if (loading) {
    return (
      <p role="status" className="py-16 text-center text-muted">
        {t('app.loading')}
      </p>
    )
  }
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
        <p>{t('app.loadError')}</p>
        <button type="button" onClick={onRetry} className="rounded-xl border-[1.5px] border-ink px-5 py-2.5 font-semibold">
          {t('app.retry')}
        </button>
      </div>
    )
  }
  return null
}
