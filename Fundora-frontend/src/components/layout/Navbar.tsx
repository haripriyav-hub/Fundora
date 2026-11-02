import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/Container'
import { Logo } from './Logo'

const sectionLinks = [
  { hash: '#how-it-works', key: 'nav.howItWorks' },
  { hash: '#features', key: 'nav.features' },
  { hash: '#faq', key: 'nav.faq' },
] as const

export function Navbar() {
  const { t } = useTranslation()
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2"
      >
        {t('nav.skip')}
      </a>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label={t('nav.label')} className="hidden md:block">
          <ul className="flex items-center gap-1">
            {sectionLinks.map((link) => (
              <li key={link.hash}>
                <Link
                  to={{ pathname: '/', hash: link.hash }}
                  className={buttonClasses({ variant: 'ghost' }, 'font-medium')}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className={buttonClasses({ variant: 'ghost' })}>
            {t('nav.login')}
          </Link>
          {/* The brief keeps only logo + Log in on mobile; sign-up stays one tap away in the hero. */}
          <div className="hidden md:block">
            <Link to="/signup" className={buttonClasses({ variant: 'primary' })}>
              {t('nav.signup')}
            </Link>
          </div>
        </div>
      </Container>
    </header>
  )
}
