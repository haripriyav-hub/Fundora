import { ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const questions = [
  'free',
  'apply',
  'accuracy',
  'data',
  'almost',
  'who',
  'wrong',
  'language',
] as const

export function Faq() {
  const { t } = useTranslation()
  return (
    <section id="faq" aria-labelledby="faq-title" className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading id="faq-title" eyebrow={t('faq.eyebrow')} title={t('faq.title')} />
        {/* Native <details> keeps the accordion accessible with zero JavaScript. */}
        <div className="mt-10 space-y-3">
          {questions.map((key) => (
            <details key={key} className="group rounded-2xl border border-line bg-white">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {t(`faq.items.${key}.q`)}
                <ChevronDown
                  className="size-5 shrink-0 text-brand transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 pb-5 text-muted">{t(`faq.items.${key}.a`)}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  )
}
