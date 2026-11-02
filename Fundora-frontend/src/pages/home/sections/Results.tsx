import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/cn'
import { stateStyles, type MatchState } from './matchState'

const states: MatchState[] = ['eligible', 'almost', 'not']

export function Results() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="results-title" className="bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="results-title"
          eyebrow={t('results.eyebrow')}
          title={t('results.title')}
          description={t('results.description')}
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {states.map((state) => {
            const { pill, icon: Icon } = stateStyles[state]
            return (
              <li
                key={state}
                className="flex flex-col rounded-2xl border border-line bg-surface p-6"
              >
                <span className={cn('flex size-11 items-center justify-center rounded-xl', pill)}>
                  <Icon className="size-6" aria-hidden="true" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-xl font-bold">{t(`results.items.${state}.title`)}</h3>
                <p className="mt-2 flex-1 text-muted">{t(`results.items.${state}.body`)}</p>
                <p className={cn('mt-5 rounded-xl px-4 py-3 font-medium', pill)}>
                  {t(`results.items.${state}.example`)}
                </p>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
