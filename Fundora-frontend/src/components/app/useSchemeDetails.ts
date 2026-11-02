import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

/** The details panel is driven by `?scheme=<id>`, so it survives a refresh and can be shared. */
export function useSchemeDetails() {
  const [params, setParams] = useSearchParams()
  const openId = params.get('scheme')

  const open = useCallback(
    (id: string) =>
      setParams((p) => {
        const next = new URLSearchParams(p)
        next.set('scheme', id)
        return next
      }),
    [setParams],
  )

  const close = useCallback(
    () =>
      setParams((p) => {
        const next = new URLSearchParams(p)
        next.delete('scheme')
        return next
      }),
    [setParams],
  )

  return { openId, open, close }
}
