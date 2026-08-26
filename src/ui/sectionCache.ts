import type { SectionId } from './sections'
import { SECTION_ORDER, sectionEls } from './sections'

let offsets: number[] = []

/** Rebuild section offset cache — call on resize / language change. */
export function cacheSectionOffsets(boxH: number) {
  void boxH
  offsets = SECTION_ORDER.map((id) => sectionEls[id]?.offsetTop ?? 0)
}

/** Which section owns the given content scroll offset (cached offsets). */
export function activeSectionCached(contentOffset: number, boxH: number): SectionId | null {
  if (!offsets.length) cacheSectionOffsets(boxH)
  let active: SectionId | null = null
  const probe = contentOffset + boxH * 0.42
  for (let i = 0; i < SECTION_ORDER.length; i++) {
    if (offsets[i] <= probe) active = SECTION_ORDER[i]
  }
  return active
}
