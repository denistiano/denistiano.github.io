import type { Lang } from './data/types'

/**
 * Site root as a path with a trailing slash.
 * Vite's base is relative (`./`) so the same build works on a user site
 * and a project site. The `/bg/` prefix is a locale, not part of the root.
 */
export function siteRoot(): string {
  const configured = import.meta.env.BASE_URL
  if (configured.startsWith('/')) {
    return configured.endsWith('/') ? configured : `${configured}/`
  }
  const resolved = new URL(configured, window.location.href)
  let path = resolved.pathname
  if (path.endsWith('/bg/')) path = path.slice(0, -3)
  if (!path.endsWith('/')) path += '/'
  return path
}

export function onBulgarianPath(pathname = window.location.pathname): boolean {
  return /(^|\/)bg(\/|$)/.test(pathname)
}

export function homeHref(lang: Lang): string {
  const root = siteRoot()
  return lang === 'bg' ? `${root}bg/` : root
}

export function cvPageHref(lang: Lang): string {
  const root = siteRoot()
  return lang === 'bg' ? `${root}bg/cv/` : `${root}cv/`
}
