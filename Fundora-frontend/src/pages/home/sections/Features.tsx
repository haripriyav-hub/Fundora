import {
  BellRing,
  BookOpen,
  FileText,
  KanbanSquare,
  MessageSquareText,
  ShieldCheck,
  Smartphone,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'

const features = [
  { id: 'oneProfile', icon: UserRound },
  { id: 'reasons', icon: MessageSquareText },
  { id: 'details', icon: FileText },
  { id: 'tracker', icon: KanbanSquare },
  { id: 'reminders', icon: BellRing },
  { id: 'verified', icon: ShieldCheck },
  { id: 'guides', icon: BookOpen },
  { id: 'counsellor', icon: UsersRound },
  { id: 'language', icon: Smartphone },
] as const

export function Features() {
  const { t } = useTranslation()
  return (
    <section id="features" aria-labelledby="features-title" className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          id="features-title"
          eyebrow={t('features.eyebrow')}
          title={t('features.title')}
          description={t('features.description')}
        />
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ id, icon: Icon }) => (
            <li key={id} className="rounded-2xl border border-line bg-white p-6">
              <span className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                <Icon className="size-6" aria-hidden="true" strokeWidth={1.75} />
              </span>
              <h3 className="mt-4 text-lg font-bold">{t(`features.items.${id}.title`)}</h3>
              <p className="mt-2 text-muted">{t(`features.items.${id}.body`)}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
