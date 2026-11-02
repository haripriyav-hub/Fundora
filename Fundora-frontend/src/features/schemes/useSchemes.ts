import { useCallback, useEffect, useState } from 'react'
import { fetchSchemes } from './api'
import type { Scheme } from './types'

type State = { schemes: Scheme[]; loading: boolean; error: boolean }

// One shared request for the whole app session: every page reads the same list.
let cache: Scheme[] | null = null
let inflight: Promise<Scheme[]> | null = null

function load(force = false) {
  if (force) {
    cache = null
    inflight = null
  }
  if (!inflight) {
    inflight = fetchSchemes().then((list) => (cache = list))
    inflight.catch(() => (inflight = null))
  }
  return inflight
}

export function useSchemes() {
  const [state, setState] = useState<State>(() => ({
    schemes: cache ?? [],
    loading: cache === null,
    error: false,
  }))

  const run = useCallback((force: boolean) => {
    let alive = true
    load(force).then(
      (schemes) => alive && setState({ schemes, loading: false, error: false }),
      () => alive && setState({ schemes: [], loading: false, error: true }),
    )
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => run(false), [run])

  const retry = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: false }))
    run(true)
  }, [run])

  return { ...state, retry }
}
