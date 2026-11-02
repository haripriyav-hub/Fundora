import { Lightbulb, SquareCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const documents = [
  'marks',
  'income',
  'caste',
  'disability',
  'domicile',
  'bonafide',
  'bank',
  'photo',
] as const
const tips = ['email', 'exact', 'update', 'confirm'] as const

export function Prepare() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="prepare-title" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="prepare-title"
          eyebrow={t('prepare.eyebrow')}
          title={t('prepare.title')}
          description={t('prepare.description')}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h3 className="text-xl font-bold">{t('prepare.checklistLabel')}</h3>
            <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {documents.map((key) => (
                <li key={key} className="flex gap-3">
                  <SquareCheck
                    className="mt-0.5 size-5 shrink-0 text-brand"
                    aria-hidden="true"
                    strokeWidth={1.75}
                  />
                  {t(`prepare.documents.${key}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2 p-6 sm:p-8">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <Lightbulb className="size-6 text-brand" aria-hidden="true" strokeWidth={1.75} />
              {t('prepare.tipsLabel')}
            </h3>
            <ol className="mt-5 space-y-4">
              {tips.map((key, i) => (
                <li key={key} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  {t(`prepare.tips.${key}`)}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  )
}
