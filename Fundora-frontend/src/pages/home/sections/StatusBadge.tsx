import { cn } from '@/lib/cn'
import { stateStyles, type MatchState } from './matchState'

export function StatusBadge({ state, label }: { state: MatchState; label: string }) {
  const { pill, icon: Icon } = stateStyles[state]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold',
        pill,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </span>
  )
}
