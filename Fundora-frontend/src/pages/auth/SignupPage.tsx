import { Mail } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { buttonClasses } from '@/components/ui/button'
import { ApiError, register } from '@/lib/api'
import { cn } from '@/lib/cn'
import { AnimatedCheck, FieldError, IconInput, PasswordInput, Spinner } from './AuthParts'
import { AuthLayout } from './AuthLayout'
import { checkEmail, type EmailError } from './emailCheck'
import { EmailSuggestion } from './EmailSuggestion'
import { GoogleSignIn } from './GoogleSignIn'
import { MIN_PASSWORD_LENGTH, passwordStrength, type Strength } from './passwordStrength'
import { useShake } from './useShake'

type PasswordError = 'required' | 'short'
type SubmitError = 'exists' | 'network' | 'generic'

const submitErrorKey: Record<SubmitError, string> = {
  exists: 'signup.errors.exists',
  network: 'auth.errors.network',
  generic: 'auth.errors.generic',
}

const meter: Record<Strength, { filled: number; color: string; text: string }> = {
  short: { filled: 0, color: '', text: 'text-muted' },
  fair: { filled: 1, color: 'bg-accent', text: 'text-almost' },
  good: { filled: 2, color: 'bg-brand', text: 'text-brand' },
  strong: { filled: 3, color: 'bg-eligible', text: 'text-eligible' },
}

const linkClass = 'font-semibold text-brand underline underline-offset-4'

/** Envelope that pops in with a tick, shown once the verification email is on its way. */
function EmailSentArt() {
  return (
    <svg viewBox="0 0 120 120" className="mx-auto size-28" aria-hidden="true">
      <circle cx="60" cy="60" r="56" className="origin-center animate-pop fill-surface-2" />
      <g
        className="animate-fade-up stroke-brand"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="28" y="38" width="64" height="46" rx="6" className="fill-white" />
        <path
          d="M30 42l30 22 30-22"
          strokeDasharray="80"
          strokeDashoffset="80"
          className="animate-draw"
        />
      </g>
      <g className="origin-center animate-pop" style={{ animationDelay: '0.35s' }}>
        <circle cx="88" cy="82" r="15" className="fill-eligible-bg stroke-white" strokeWidth="3" />
        <path
          d="M81 82l5 5 9-10"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-eligible"
        />
      </g>
    </svg>
  )
}

export function SignupPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [emailOk, setEmailOk] = useState(false)
  const [emailError, setEmailError] = useState<EmailError | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [suggestionSeen, setSuggestionSeen] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<PasswordError | null>(null)
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)
  const [submitError, setSubmitError] = useState<SubmitError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const emailShake = useShake()
  const passwordShake = useShake()
  const consentShake = useShake()
  const emailInput = useRef<HTMLInputElement>(null)

  const strength = passwordStrength(password)

  /** Checks the email as soon as the student leaves the field, so the tick appears early. */
  function checkEmailField(value = email) {
    const result = checkEmail(value)
    setEmailOk(result.ok)
    if (!result.ok) {
      if (value.trim()) setEmailError(result.error)
      return result
    }
    setEmail(result.email)
    setEmailError(null)
    if (result.suggestion && !suggestionSeen) setSuggestion(result.suggestion)
    return result
  }

  function acceptSuggestion(value: string) {
    setEmail(value)
    setSuggestion(null)
    setSuggestionSeen(true)
    setEmailOk(true)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)

    const emailResult = checkEmailField()
    const emailBlocked = !emailResult.ok || (!!emailResult.suggestion && !suggestionSeen)
    if (!emailResult.ok) {
      setEmailError(emailResult.error)
      emailShake.shake()
    }
    const pwError: PasswordError | null = !password
      ? 'required'
      : password.length < MIN_PASSWORD_LENGTH
        ? 'short'
        : null
    setPasswordError(pwError)
    if (pwError) passwordShake.shake()
    setConsentError(!consent)
    if (!consent) consentShake.shake()

    if (emailBlocked || pwError || !consent) {
      if (emailBlocked) emailInput.current?.focus()
      return
    }

    setSubmitting(true)
    try {
      await register(emailResult.email, password)
      setSent(true)
    } catch (err) {
      const status = err instanceof ApiError ? err.status : -1
      setSubmitError(status === 409 ? 'exists' : status === 0 ? 'network' : 'generic')
    } finally {
      setSubmitting(false)
    }
  }

  function startOver() {
    setSent(false)
    setPassword('')
    setEmailOk(false)
    setSuggestionSeen(false)
    window.setTimeout(() => emailInput.current?.focus())
  }

  return (
    <AuthLayout
      mode="signup"
      docTitle={t('signup.docTitle')}
      title={t('signup.title')}
      subtitle={t('signup.subtitle')}
    >
      {sent ? (
        <div role="status" className="mt-8 animate-fade-up text-center">
          <EmailSentArt />
          <h2 className="mt-6 text-2xl font-bold">{t('signup.sent.title')}</h2>
          <p className="mt-3 text-lg text-muted">
            <Trans
              i18nKey="signup.sent.body"
              values={{ email }}
              components={{ strong: <strong className="break-words text-ink" /> }}
            />
          </p>
          <p className="mt-3 text-muted">{t('signup.sent.spam')}</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/login" className={buttonClasses({ size: 'lg' }, 'w-full')}>
              {t('signup.sent.login')}
            </Link>
            <button
              type="button"
              onClick={startOver}
              className={buttonClasses({ variant: 'ghost' })}
            >
              {t('signup.sent.changeEmail')}
            </button>
          </div>
        </div>
      ) : (
        <>
          <GoogleSignIn />
          <form noValidate className="mt-6" onSubmit={submit}>
            <label htmlFor="email" className="font-semibold">
              {t('auth.email.label')}
            </label>
            <div {...emailShake.shakeProps}>
              <IconInput
                ref={emailInput}
                icon={Mail}
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder={t('auth.email.placeholder')}
                value={email}
                disabled={submitting}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailOk(false)
                  setEmailError(null)
                  setSuggestion(null)
                  setSuggestionSeen(false)
                }}
                onBlur={() => checkEmailField()}
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? 'email-error' : undefined}
                trailing={
                  emailOk &&
                  !suggestion && (
                    <AnimatedCheck className="absolute top-1/2 right-3 size-7 -translate-y-1/2" />
                  )
                }
              />
            </div>
            {emailError && (
              <FieldError id="email-error">{t(`auth.email.errors.${emailError}`)}</FieldError>
            )}
            {suggestion && (
              <EmailSuggestion
                suggestion={suggestion}
                onAccept={() => acceptSuggestion(suggestion)}
                onKeep={() => acceptSuggestion(email)}
              />
            )}

            <label htmlFor="password" className="mt-6 block font-semibold">
              {t('auth.password.label')}
            </label>
            <div {...passwordShake.shakeProps}>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                value={password}
                disabled={submitting}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError(null)
                }}
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={passwordError ? 'password-error' : 'password-hint'}
              />
            </div>
            {password && (
              <div className="mt-3 flex items-center gap-3">
                <div className="grid flex-1 grid-cols-3 gap-1.5" aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <span key={n} className="h-1.5 overflow-hidden rounded-full bg-line">
                      <span
                        className={cn(
                          'block h-full rounded-full transition-[width] duration-300 ease-out',
                          meter[strength].color,
                          n <= meter[strength].filled ? 'w-full' : 'w-0',
                        )}
                      />
                    </span>
                  ))}
                </div>
                <p className={cn('text-sm font-semibold', meter[strength].text)} aria-live="polite">
                  {t('signup.password.strength', {
                    level: t(`signup.password.levels.${strength}`),
                  })}
                </p>
              </div>
            )}
            {passwordError ? (
              <FieldError id="password-error">
                {t(`signup.password.errors.${passwordError}`)}
              </FieldError>
            ) : (
              <p id="password-hint" className="mt-2 text-muted">
                {t('signup.password.hint')}
              </p>
            )}

            <div {...consentShake.shakeProps}>
              <label
                className={cn(
                  'mt-6 flex cursor-pointer gap-3 rounded-xl border p-4',
                  consentError ? 'border-not bg-not-bg' : 'border-line bg-surface',
                )}
              >
                <input
                  type="checkbox"
                  checked={consent}
                  disabled={submitting}
                  onChange={(e) => {
                    setConsent(e.target.checked)
                    setConsentError(false)
                  }}
                  aria-invalid={consentError ? true : undefined}
                  aria-describedby={consentError ? 'consent-error' : undefined}
                  className="mt-0.5 size-5 shrink-0 accent-brand"
                />
                <span>
                  <Trans
                    i18nKey="signup.consent.label"
                    components={{
                      terms: <Link to="/terms" className={linkClass} />,
                      privacy: <Link to="/privacy" className={linkClass} />,
                    }}
                  />
                </span>
              </label>
            </div>
            {consentError && (
              <FieldError id="consent-error">{t('signup.consent.error')}</FieldError>
            )}

            {submitError && (
              <div className="mt-6">
                <FieldError id="submit-error">{t(submitErrorKey[submitError])}</FieldError>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={buttonClasses({ size: 'lg' }, 'mt-6 w-full')}
            >
              {submitting && <Spinner />}
              {t(submitting ? 'signup.submitting' : 'signup.submit')}
            </button>
          </form>
        </>
      )}

      <p className="mt-8 text-center text-muted">
        {t('signup.haveAccount')}{' '}
        <Link to="/login" className={linkClass}>
          {t('signup.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}
