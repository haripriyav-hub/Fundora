import { cn } from '@/lib/cn'

type Variant = 'primary' | 'outline' | 'ghost' | 'onBrand' | 'inverse'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong',
  outline: 'border-[1.5px] border-ink text-ink bg-transparent hover:bg-white',
  ghost: 'text-ink hover:bg-surface-2',
  onBrand: 'border-[1.5px] border-white text-white hover:bg-white/10',
  inverse: 'bg-white text-brand-strong hover:bg-surface',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-base',
  lg: 'h-14 px-7 text-base sm:text-lg',
}

/** Class names for button-styled elements, so links and buttons share one look. */
export function buttonClasses(
  { variant = 'primary', size = 'md' }: { variant?: Variant; size?: Size } = {},
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className)
}
