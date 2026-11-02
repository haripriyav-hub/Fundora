import { cn } from '@/lib/cn'

type Props = {
  id?: string
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeading({ id, eyebrow, title, description, align = 'center' }: Props) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className="text-sm font-semibold tracking-[0.14em] text-muted uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-3xl font-extrabold tracking-tighter text-ink sm:text-5xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-lg text-muted">{description}</p>}
    </div>
  )
}
