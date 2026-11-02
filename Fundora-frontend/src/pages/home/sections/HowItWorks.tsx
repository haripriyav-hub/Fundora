import { ClipboardList, ExternalLink, ListChecks, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const steps = [
  { id: 'account', icon: UserPlus },
  { id: 'profile', icon: ClipboardList },
  { id: 'matches', icon: ListChecks },
  { id: 'apply', icon: ExternalLink },
] as const

export function HowItWorks() {
  const { t } = useTranslation()
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="how-title"
          eyebrow={t('howItWorks.eyebrow')}
          title={t('howItWorks.title')}
          description={t('howItWorks.description')}
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ id, icon: Icon }, i) => (
            <li key={id} className="rounded-2xl border border-line bg-white p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="text-6xl leading-none font-extrabold tracking-tighter text-brand">
                  <span className="sr-only">{t('howItWorks.stepLabel', { n: i + 1 })}</span>
                  <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                </span>
                <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                  <Icon className="size-6" aria-hidden="true" strokeWidth={1.75} />
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold">{t(`howItWorks.steps.${id}.title`)}</h3>
              <p className="mt-2 text-muted">{t(`howItWorks.steps.${id}.body`)}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
