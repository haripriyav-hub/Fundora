import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/Container'

/** Stand-in for routes linked from the landing page that are built in later phases. */
export function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation()
  return (
    <>
      <Navbar />
      <main id="main" className="py-24">
        <Container className="max-w-xl text-center">
          <h1 className="text-3xl font-bold">{t(titleKey)}</h1>
          <p className="mt-3 text-muted">{t('placeholder.body')}</p>
          <Link to="/" className={buttonClasses({ variant: 'outline' }, 'mt-8')}>
            {t('placeholder.back')}
          </Link>
        </Container>
      </main>
      <Footer />
    </>
  )
}
