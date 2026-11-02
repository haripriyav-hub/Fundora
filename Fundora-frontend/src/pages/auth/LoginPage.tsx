import { Mail } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { buttonClasses } from '@/components/ui/button'
import { ApiError, login } from '@/lib/api'
import { cn } from '@/lib/cn'
import { AnimatedCheck, FieldError, IconInput, PasswordInput, Spinner } from './AuthParts'
import { AuthLayout } from './AuthLayout'
import { checkEmail, type EmailError } from './emailCheck'
import { EmailSuggestion } from './EmailSuggestion'
import { GoogleSignIn } from './GoogleSignIn'
import { useShake } from './useShake'

type Step = 'email' | 'checking' | 'password'
type PasswordError = 'required' | 'wrong' | 'network' | 'generic'

// Long enough for the checking animation to register, short enough not to feel slow.
const CHECK_DELAY_MS = 900

const passwordErrorKey: Record<PasswordError, string> = {
  required: 'login.password.errors.required',
  wrong: 'login.password.errors.wrong',
  network: 'auth.errors.network',
  generic: 'auth.errors.generic',
}

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<EmailError | null>(null)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<PasswordError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const emailShake = useShake()
  const passwordShake = useShake()
  const emailInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step !== 'checking') return
    const id = window.setTimeout(() => setStep('password'), CHECK_DELAY_MS)
    return () => window.clearTimeout(id)
  }, [step])

  function verifyEmail(value: string, offerSuggestion: boolean) {
    const result = checkEmail(value)
    if (!result.ok) {
      setEmailError(result.error)
      emailShake.shake()
      emailInput.current?.focus()
      return
    }
    setEmail(result.email)
    setEmailError(null)
    if (offerSuggestion && result.suggestion) {
      setSuggestion(result.suggestion)
      return
    }
    setSuggestion(null)
    setStep('checking')
  }

  function changeEmail() {
    setStep('email')
    setPassword('')
    setPasswordError(null)
    // Wait for the email field to re-enable before focusing it
    window.setTimeout(() => emailInput.current?.focus())
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault()
    if (!password) {
      setPasswordError('required')
      passwordShake.shake()
      return
    }
    setSubmitting(true)
    setPasswordError(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const status = err instanceof ApiError ? err.status : -1
      setPasswordError(
        status === 400 || status === 401 ? 'wrong' : status === 0 ? 'network' : 'generic',
      )
      passwordShake.shake()
    } finally {
      setSubmitting(false)
    }
  }

  const onPasswordStep = step === 'password'

  return (
    <AuthLayout
      mode="login"
      docTitle={t('login.docTitle')}
      title={t('login.title')}
      subtitle={t('login.subtitle')}
    >
      {!onPasswordStep && <GoogleSignIn />}

      {/* Two-step progress: verify email, then password */}
      <div className="mt-8">
        <p className="text-sm font-semibold text-brand" aria-live="polite">
          {t('login.stepLabel', { n: onPasswordStep ? 2 : 1 })}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2" aria-hidden="true">
          <span className="h-1.5 rounded-full bg-brand" />
          <span className="h-1.5 overflow-hidden rounded-full bg-line">
            <span
              className={cn(
                'block h-full rounded-full bg-brand transition-[width] duration-500 ease-out',
                onPasswordStep ? 'w-full' : 'w-0',
              )}
            />
          </span>
        </div>
      </div>

      {!onPasswordStep ? (
        <form
          noValidate
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault()
            verifyEmail(email, true)
          }}
        >
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
              disabled={step === 'checking'}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError(null)
                setSuggestion(null)
              }}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? 'email-error' : undefined}
            />
          </div>
          {emailError && (
            <FieldError id="email-error">{t(`auth.email.errors.${emailError}`)}</FieldError>
          )}

          {suggestion && (
            <EmailSuggestion
              suggestion={suggestion}
              onAccept={() => verifyEmail(suggestion, false)}
              onKeep={() => verifyEmail(email, false)}
            />
          )}

          {step === 'checking' ? (
            <div
              role="status"
              className="mt-6 flex h-13 animate-fade-up items-center justify-center gap-3 rounded-xl bg-surface-2 font-semibold text-brand"
            >
              <Spinner />
              {t('login.email.checking')}
            </div>
          ) : (
            !suggestion && (
              <button type="submit" className={buttonClasses({ size: 'lg' }, 'mt-6 w-full')}>
                {t('login.email.continue')}
              </button>
            )
          )}
        </form>
      ) : (
        <form noValidate className="mt-6 animate-fade-up" onSubmit={submitPassword}>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3">
            <div className="flex min-w-0 items-center gap-3">
              <AnimatedCheck />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-eligible">{t('login.email.verified')}</p>
                <p className="truncate font-medium">{email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={changeEmail}
              aria-label={t('login.email.changeLabel')}
              className="shrink-0 rounded-lg px-2 py-1 font-semibold text-brand underline-offset-4 hover:underline"
            >
              {t('login.email.change')}
            </button>
          </div>

          {/* Lets password managers pair the saved password with this email */}
          <input type="email" autoComplete="username" value={email} readOnly hidden />

          <div className="mt-6 flex items-center justify-between">
            <label htmlFor="password" className="font-semibold">
              {t('auth.password.label')}
            </label>
            <Link
              to="/forgot"
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              {t('login.password.forgot')}
            </Link>
          </div>
          <div {...passwordShake.shakeProps}>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              disabled={submitting}
              onChange={(e) => {
                setPassword(e.target.value)
                setPasswordError(null)
              }}
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={passwordError ? 'password-error' : undefined}
            />
          </div>
          {passwordError && (
            <FieldError id="password-error">{t(passwordErrorKey[passwordError])}</FieldError>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={buttonClasses({ size: 'lg' }, 'mt-6 w-full')}
          >
            {submitting && <Spinner />}
            {t(submitting ? 'login.password.submitting' : 'login.password.submit')}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-muted">
        {t('login.newHere')}{' '}
        <Link to="/signup" className="font-semibold text-brand underline underline-offset-4">
          {t('login.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  )
}
