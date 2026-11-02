import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/Container'

export function FinalCta() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="cta-title" className="pb-16 sm:pb-24">
      <Container>
        <div className="rounded-2xl bg-linear-160 from-brand to-brand-strong px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2
            id="cta-title"
            className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tighter text-white sm:text-5xl"
          >
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg text-white">{t('cta.body')}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/signup" className={buttonClasses({ variant: 'inverse', size: 'lg' })}>
              {t('cta.primary')}
            </Link>
            <Link to="/login" className={buttonClasses({ variant: 'onBrand', size: 'lg' })}>
              {t('cta.secondary')}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
