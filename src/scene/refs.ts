import type * as THREE from 'three'

/**
 * Cross-world handles.
 *
 * - `screenAnchor`: empty object at the center of the (open) laptop
 *   screen, facing outward — the camera flies to it instead of relying
 *   on hand-computed coordinates.
 * - `frameEl`: the fixed DOM container that hosts the CV content. Every
 *   frame it is re-projected to sit EXACTLY over the 3D screen, so the
 *   DOM content genuinely lives "on" the laptop.
 */
export const sceneRefs: {
  screenAnchor: THREE.Object3D | null
  frameEl: HTMLElement | null
} = {
  screenAnchor: null,
  frameEl: null,
}
