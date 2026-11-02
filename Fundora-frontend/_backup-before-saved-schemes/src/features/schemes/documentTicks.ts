import { useSyncExternalStore } from 'react'

/*
 * Which required documents the student says they already have, per scheme.
 * Only the yes/no tick is kept, never a document. Stored in this browser until
 * the profile API takes the flags.
 */

const KEY = 'fundora.documentTicks'
type Ticks = Record<string, true>

function read(): Ticks {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Ticks
  } catch {
    return {}
  }
}

let ticks: Ticks = read()
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const keyOf = (schemeId: string, docId: string) => `${schemeId}:${docId}`

export function toggleTick(schemeId: string, docId: string) {
  const k = keyOf(schemeId, docId)
  const next = { ...ticks }
  if (next[k]) delete next[k]
  else next[k] = true
  ticks = next
  try {
    localStorage.setItem(KEY, JSON.stringify(ticks))
  } catch {
    // Private mode or storage full: the tick still works for this visit.
  }
  listeners.forEach((l) => l())
}

export function useDocumentTicks() {
  const current = useSyncExternalStore(subscribe, () => ticks)
  return (schemeId: string, docId: string) => Boolean(current[keyOf(schemeId, docId)])
}
