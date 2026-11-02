import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Container } from '@/components/ui/Container'
import { Logo } from './Logo'

type FooterLink = { key: string; to: string | { pathname: string; hash: string } }

const columns: Array<{ titleKey: string; links: FooterLink[] }> = [
  {
    titleKey: 'footer.product',
    links: [
      { key: 'nav.howItWorks', to: { pathname: '/', hash: '#how-it-works' } },
      { key: 'nav.features', to: { pathname: '/', hash: '#features' } },
      { key: 'footer.browse', to: '/schemes' },
    ],
  },
  {
    titleKey: 'footer.help',
    links: [
      { key: 'nav.faq', to: { pathname: '/', hash: '#faq' } },
      { key: 'footer.guides', to: '/guides' },
    ],
  },
  {
    titleKey: 'footer.legal',
    links: [
      { key: 'footer.privacy', to: '/privacy' },
      { key: 'footer.terms', to: '/terms' },
    ],
  },
]

const linkClass = 'text-ink hover:text-brand-strong hover:underline'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-line bg-surface text-ink">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-muted">{t('footer.tagline')}</p>
          </div>
          {columns.map((col) => (
            <div key={col.titleKey}>
              <h2 className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">
                {t(col.titleKey)}
              </h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.key}>
                    <Link to={link.to} className={linkClass}>
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 space-y-2 border-t border-line pt-6 text-muted">
          <p>{t('footer.builtBy')}</p>
          <p>{t('footer.disclaimer')}</p>
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </Container>
    </footer>
  )
}
