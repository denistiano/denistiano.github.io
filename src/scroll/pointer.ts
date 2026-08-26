/**
 * Normalized pointer position (-1..1), shared by the parallax rig
 * and any DOM effect that wants it. Updated passively; consumers damp
 * it themselves.
 */
export const pointer = { x: 0, y: 0 }

let attached = false

export function attachPointer() {
  if (attached) return
  attached = true
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    },
    { passive: true },
  )
}
