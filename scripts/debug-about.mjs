import { preview } from 'vite'
import puppeteer from 'puppeteer'

const server = await preview({ preview: { port: 4175, strictPort: false, open: false } })
const url = server.resolvedUrls.local[0]

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage()
page.on('console', (m) => console.log('[console]', m.type(), m.text()))
page.on('pageerror', (e) => console.log('[pageerror]', e.message))
await page.setViewport({ width: 1600, height: 1000 })
await page.goto(url, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 2000))

await page.evaluate(() => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo(0, max * 0.45)
})

for (let i = 0; i < 8; i++) {
  await new Promise((r) => setTimeout(r, 2000))
  const probe = await page.evaluate(() => {
    const os = document.querySelector('.screen-os')
    const about = document.querySelector('.chapter-about')
    return {
      osOpacity: os ? getComputedStyle(os).opacity : null,
      aboutOpacity: about ? getComputedStyle(about).opacity : null,
    }
  })
  console.log(`t=${(i + 1) * 2}s`, JSON.stringify(probe))
}

const info = await page.evaluate(() => {
  const el = document.querySelector('.chapter-about')
  const os = document.querySelector('.screen-os')
  if (!el || !os) return { missing: true }
  const cs = getComputedStyle(el)
  const rect = el.getBoundingClientRect()
  return {
    scrollY: window.scrollY,
    max: document.documentElement.scrollHeight - window.innerHeight,
    osOpacity: getComputedStyle(os).opacity,
    osVisibility: getComputedStyle(os).visibility,
    opacity: cs.opacity,
    visibility: cs.visibility,
    transform: cs.transform,
    rect: { t: rect.top, l: rect.left, w: rect.width, h: rect.height },
    inlineStyle: el.getAttribute('style'),
    text: (el.textContent || '').slice(0, 60),
  }
})
console.log(JSON.stringify(info, null, 2))

await browser.close()
await new Promise((res, rej) => server.httpServer.close((e) => (e ? rej(e) : res())))
