import { CircleAlert, CircleCheck, CircleX } from 'lucide-react'

export type MatchState = 'eligible' | 'almost' | 'not'

export const stateStyles: Record<MatchState, { pill: string; icon: typeof CircleCheck }> = {
  eligible: { pill: 'bg-eligible-bg text-eligible', icon: CircleCheck },
  almost: { pill: 'bg-almost-bg text-almost', icon: CircleAlert },
  not: { pill: 'bg-not-bg text-not', icon: CircleX },
}
