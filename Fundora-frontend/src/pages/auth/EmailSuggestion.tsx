import { useTranslation } from 'react-i18next'
import { buttonClasses } from '@/components/ui/button'

type Props = { suggestion: string; onAccept: () => void; onKeep: () => void }

/** "Did you mean …@gmail.com?" prompt for likely typos in the email domain. */
export function EmailSuggestion({ suggestion, onAccept, onKeep }: Props) {
  const { t } = useTranslation()
  return (
    <div
      role="status"
      className="mt-3 animate-fade-up rounded-xl border border-accent bg-almost-bg p-4"
    >
      <p className="font-medium">{t('auth.email.suggestion', { email: suggestion })}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={onAccept} className={buttonClasses({ variant: 'primary' })}>
          {t('auth.email.useSuggestion')}
        </button>
        <button type="button" onClick={onKeep} className={buttonClasses({ variant: 'ghost' })}>
          {t('auth.email.keepMine')}
        </button>
      </div>
    </div>
  )
}
