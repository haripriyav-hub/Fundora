import { useEffect, useSyncExternalStore } from 'react'
import { fetchSavedSchemes } from '@/features/schemes/api'
import type { SavedScheme } from '@/features/schemes/types'

/*
 * The schemes a student saved to apply for ("My applications"). Fundora only
 * keeps the list; the application itself happens on the official portal.
 * Loaded once from the API. Save/remove are local until the API has
 * POST/DELETE /saved; wire them in `save` and `unsave`.
 */

type Snapshot = { list: SavedScheme[]; loaded: boolean }

let snapshot: Snapshot = { list: [], loaded: false }
let started = false
const listeners = new Set<() => void>()

function set(list: SavedScheme[]) {
  snapshot = { list, loaded: true }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useSavedSchemes() {
  const state = useSyncExternalStore(subscribe, () => snapshot)
  useEffect(() => {
    if (started) return
    started = true
    fetchSavedSchemes().then(set, () => set([]))
  }, [])
  return state
}

export function save(schemeId: string) {
  if (snapshot.list.some((a) => a.schemeId === schemeId)) return
  set([{ schemeId, savedOn: new Date().toISOString().slice(0, 10) }, ...snapshot.list])
}

export function unsave(schemeId: string) {
  set(snapshot.list.filter((a) => a.schemeId !== schemeId))
}
