import { useEffect, useRef } from 'react'
import { scrollEngine, type ScrollState } from './engine'

/**
 * Subscribe a DOM-side updater to the shared frame loop.
 * The callback mutates element styles directly — never React state —
 * so scroll animation costs zero re-renders.
 */
export function useScrollFrame(cb: (state: ScrollState, dt: number) => void) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => scrollEngine.subscribe((s, dt) => ref.current(s, dt)), [])
}
