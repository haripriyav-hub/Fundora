import { useEffect, useSyncExternalStore } from 'react'
import { fetchApplications } from '@/features/schemes/api'
import type { ApplicationStatus, TrackedApplication } from '@/features/schemes/types'

/*
 * The student's tracked applications. Loaded once from the API, then kept here so
 * every page sees the same list. Add/remove are local until the API has
 * POST/DELETE /applications; wire them in `track` and `untrack`.
 */

type Snapshot = { list: TrackedApplication[]; loaded: boolean }

let snapshot: Snapshot = { list: [], loaded: false }
let started = false
const listeners = new Set<() => void>()

function set(list: TrackedApplication[]) {
  snapshot = { list, loaded: true }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useApplications() {
  const state = useSyncExternalStore(subscribe, () => snapshot)
  useEffect(() => {
    if (started) return
    started = true
    fetchApplications().then(set, () => set([]))
  }, [])
  return state
}

export function track(schemeId: string) {
  if (snapshot.list.some((a) => a.schemeId === schemeId)) return
  const status: ApplicationStatus = 'saved'
  set([
    {
      schemeId,
      status,
      progress: 0,
      nextStep: 'You haven’t started this application yet',
      updatedAt: new Date().toISOString().slice(0, 10),
    },
    ...snapshot.list,
  ])
}

export function untrack(schemeId: string) {
  set(snapshot.list.filter((a) => a.schemeId !== schemeId))
}
