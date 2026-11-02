import { CalendarClock, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { buttonClasses } from '@/components/ui/button'
import { Container } from '@/components/ui/Container'
import type { MatchState } from './matchState'
import { StatusBadge } from './StatusBadge'

const points = ['free', 'passwords', 'official'] as const

const previewRows: Array<{ id: string; state: MatchState }> = [
  { id: 'one', state: 'eligible' },
  { id: 'two', state: 'almost' },
  { id: 'three', state: 'not' },
]

function ResultsPreview() {
  const { t } = useTranslation()
  return (
    <figure
      aria-label={t('hero.preview.label')}
      className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">{t('hero.preview.title')}</p>
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-sm font-medium text-muted">
          {t('hero.preview.badge')}
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {previewRows.map(({ id, state }) => (
          <li key={id} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusBadge state={state} label={t(`hero.preview.tabs.${state}`)} />
              <span className="inline-flex items-center gap-1 text-sm text-muted">
                <CalendarClock className="size-4" aria-hidden="true" />
                {t('hero.preview.deadline', { date: t(`hero.preview.rows.${id}.date`) })}
              </span>
            </div>
            <p className="mt-3 font-semibold">{t(`hero.preview.rows.${id}.name`)}</p>
            <p className="text-sm text-muted">{t(`hero.preview.rows.${id}.amount`)}</p>
            <p className="mt-2">{t(`hero.preview.rows.${id}.reason`)}</p>
          </li>
        ))}
      </ul>
    </figure>
  )
}

export function Hero() {
  const { t } = useTranslation()
  return (
    <section aria-labelledby="hero-title" className="bg-surface">
      <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">
            {t('hero.eyebrow')}
          </p>
          <h1
            id="hero-title"
            className="mt-5 text-4xl leading-[1.04] font-extrabold tracking-tighter text-ink sm:text-5xl lg:text-6xl"
          >
            {t('hero.title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted sm:text-xl">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup" className={buttonClasses({ size: 'lg' })}>
              {t('hero.primaryCta')}
            </Link>
            <a href="#how-it-works" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
              {t('hero.secondaryCta')}
            </a>
          </div>
          <ul className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {points.map((key) => (
              <li key={key} className="inline-flex items-center gap-2">
                <Check className="size-5 text-eligible" aria-hidden="true" />
                {t(`hero.points.${key}`)}
              </li>
            ))}
          </ul>
        </div>
        {/* Red slide panel behind the preview, per the brand's "big red panels" */}
        <div className="rounded-2xl bg-linear-160 from-brand to-brand-strong p-4 sm:p-8">
          <ResultsPreview />
        </div>
      </Container>
    </section>
  )
}
