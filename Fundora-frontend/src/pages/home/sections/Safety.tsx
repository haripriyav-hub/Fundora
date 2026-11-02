import { Ban, LockKeyhole, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const never = ['fee', 'password', 'ids', 'submit'] as const
const promise = ['encrypt', 'consent', 'delete', 'official'] as const

export function Safety() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="safety-title" className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="safety-title"
          eyebrow={t('safety.eyebrow')}
          title={t('safety.title')}
          description={t('safety.description')}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="text-xl font-bold">{t('safety.neverTitle')}</h3>
            <ul className="mt-5 space-y-3">
              {never.map((key) => (
                <li key={key} className="flex gap-3">
                  <Ban className="mt-0.5 size-5 shrink-0 text-not" aria-hidden="true" />
                  {t(`safety.never.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h3 className="text-xl font-bold">{t('safety.promiseTitle')}</h3>
            <ul className="mt-5 space-y-3">
              {promise.map((key) => (
                <li key={key} className="flex gap-3">
                  <LockKeyhole
                    className="mt-0.5 size-5 shrink-0 text-eligible"
                    aria-hidden="true"
                  />
                  {t(`safety.promise.${key}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div
          role="note"
          className="mt-6 flex gap-4 rounded-2xl border border-accent bg-almost-bg p-6"
        >
          <TriangleAlert className="size-6 shrink-0 text-almost" aria-hidden="true" />
          <div>
            <p className="font-bold">{t('safety.warningTitle')}</p>
            <p className="mt-1">{t('safety.warningBody')}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
