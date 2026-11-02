import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'

const items = ['courses', 'profile', 'states', 'cost'] as const

export function Highlights() {
  const { t } = useTranslation()
  return (
    <section aria-label={t('highlights.label')} className="border-y border-line bg-white">
      <Container>
        <ul className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {items.map((key) => (
            <li key={key} className="text-center">
              <p className="text-3xl font-extrabold text-brand sm:text-4xl">
                {t(`highlights.items.${key}.value`)}
              </p>
              <p className="mt-1 text-muted">{t(`highlights.items.${key}.label`)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
