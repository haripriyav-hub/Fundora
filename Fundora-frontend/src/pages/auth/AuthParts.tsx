import { CircleAlert, LockKeyhole, type LucideIcon } from 'lucide-react'
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'

export function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} role="alert" className="mt-2 flex gap-2 text-not">
      <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-5 animate-spin rounded-full border-[3px] border-current border-t-transparent',
        className,
      )}
    />
  )
}

type IconInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: LucideIcon
  /** Rendered inside the field on the right, e.g. a Show button */
  trailing?: ReactNode
}

/** Text input with a leading icon; `className` adds to the input's own classes. */
export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(function IconInput(
  { icon: Icon, trailing, className, ...props },
  ref,
) {
  return (
    <div className="relative mt-2">
      <Icon
        className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        ref={ref}
        {...props}
        className={cn(
          'h-12 w-full rounded-xl border border-line bg-white pl-11 text-base text-ink placeholder:text-muted focus:border-brand focus:ring-3 focus:ring-brand/20 focus:outline-none disabled:bg-surface aria-[invalid=true]:border-not',
          trailing ? 'pr-20' : 'pr-4',
          className,
        )}
      />
      {trailing}
    </div>
  )
})

/** Password input with a Show/Hide toggle. */
export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  return (
    <IconInput
      {...props}
      icon={LockKeyhole}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={t(visible ? 'auth.password.hideLabel' : 'auth.password.showLabel')}
          aria-pressed={visible}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg px-3 py-1.5 font-semibold text-brand hover:bg-surface-2"
        >
          {t(visible ? 'auth.password.hide' : 'auth.password.show')}
        </button>
      }
    />
  )
}

/** Green circle that pops in, then draws a tick. */
export function AnimatedCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={cn('size-9 shrink-0', className)} aria-hidden="true">
      <circle cx="18" cy="18" r="18" className="origin-center animate-pop fill-eligible-bg" />
      <path
        d="M11 18.5l5 5 9-10"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="24"
        strokeDashoffset="24"
        className="animate-draw stroke-eligible"
      />
    </svg>
  )
}
