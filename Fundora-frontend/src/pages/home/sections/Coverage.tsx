import { GraduationCap, MapPinned } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const types = [
  'scholarships',
  'loans',
  'waivers',
  'laptop',
  'hostel',
  'coaching',
  'girls',
  'disability',
  'rural',
] as const

export function Coverage() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="coverage-title" className="bg-white py-16 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            id="coverage-title"
            align="left"
            eyebrow={t('coverage.eyebrow')}
            title={t('coverage.title')}
            description={t('coverage.description')}
          />
          <h3 className="sr-only">{t('coverage.typesLabel')}</h3>
          <ul className="mt-8 flex flex-wrap gap-2">
            {types.map((key) => (
              <li
                key={key}
                className="rounded-full border border-line bg-surface px-4 py-2 font-medium"
              >
                {t(`coverage.types.${key}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-6">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <GraduationCap className="size-7 text-brand" aria-hidden="true" strokeWidth={1.75} />
            <h3 className="mt-3 text-xl font-bold">{t('coverage.coursesTitle')}</h3>
            <p className="mt-2 text-muted">{t('coverage.coursesBody')}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6">
            <MapPinned className="size-7 text-brand" aria-hidden="true" strokeWidth={1.75} />
            <h3 className="mt-3 text-xl font-bold">{t('coverage.rolloutTitle')}</h3>
            <p className="mt-2 text-muted">{t('coverage.rolloutBody')}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
