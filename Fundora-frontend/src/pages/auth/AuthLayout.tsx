import { ShieldCheck } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/cn'
import { LoginIllustration } from './LoginIllustration'

type Props = {
  mode: 'login' | 'signup'
  docTitle: string
  title: string
  subtitle: string
  children: ReactNode
}

const tabClass = 'rounded-lg py-2.5 text-center font-semibold'
const activeTab = 'bg-white text-brand shadow-sm'
const idleTab = 'text-muted hover:text-ink'

/** Split screen shared by log in and sign up: form on the left, illustration on the right. */
export function AuthLayout({ mode, docTitle, title, subtitle, children }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    document.title = docTitle
  }, [docTitle])

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <main id="main" className="flex flex-col bg-white px-4 py-6 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 text-lg text-muted">{subtitle}</p>

          <nav
            aria-label={t('auth.modeLabel')}
            className="mt-8 grid grid-cols-2 rounded-xl bg-surface-2 p-1"
          >
            <Link
              to="/login"
              aria-current={mode === 'login' ? 'page' : undefined}
              className={cn(tabClass, mode === 'login' ? activeTab : idleTab)}
            >
              {t('auth.loginTab')}
            </Link>
            <Link
              to="/signup"
              aria-current={mode === 'signup' ? 'page' : undefined}
              className={cn(tabClass, mode === 'signup' ? activeTab : idleTab)}
            >
              {t('auth.signupTab')}
            </Link>
          </nav>

          {children}

          <p className="mt-6 flex items-start gap-2 rounded-xl bg-surface-2 p-4 text-muted">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
            {t('auth.safety')}
          </p>
        </div>
      </main>

      <aside className="hidden flex-col items-center justify-center gap-10 bg-surface-2 p-12 lg:flex">
        <p className="max-w-md text-center text-3xl font-bold tracking-tight">
          {t('auth.panel.title')}
        </p>
        <LoginIllustration label={t('auth.panel.illustration')} className="w-full max-w-lg" />
        <p className="max-w-md text-center text-lg text-muted">{t('auth.panel.body')}</p>
      </aside>
    </div>
  )
}
