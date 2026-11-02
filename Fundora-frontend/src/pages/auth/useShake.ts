import { useState } from 'react'

/** Shakes a wrapper once to draw the eye to an error. Spread `shakeProps` on the element. */
export function useShake() {
  const [shaking, setShaking] = useState(false)
  return {
    shake: () => setShaking(true),
    shakeProps: {
      className: shaking ? 'animate-shake' : undefined,
      onAnimationEnd: () => setShaking(false),
    },
  }
}
