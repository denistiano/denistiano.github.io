/**
 * Dev utility: captures the experience at several scroll positions so
 * composition and choreography can be verified headlessly.
 * Usage: node scripts/shots.mjs [fractions...]
 */
import { mkdir } from 'node:fs/promises'
import { preview } from 'vite'
import puppeteer from 'puppeteer'

const OUT = '/tmp/cv-shots'
await mkdir(OUT, { recursive: true })

const fractions = process.argv.slice(2).map(Number)
const points = fractions.length ? fractions : [0, 0.08, 0.16, 0.24, 0.3, 0.36, 0.45, 0.58, 0.72, 0.88, 0.98]

const server = await preview({ preview: { port: 4174, strictPort: false, open: false } })
const url = server.resolvedUrls.local[0]

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 2500))

for (const f of points) {
  await page.evaluate((frac) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo(0, max * frac)
  }, f)
  // Wait for the damped progress to settle.
  await new Promise((r) => setTimeout(r, 2600))
  await page.screenshot({ path: `${OUT}/p${String(Math.round(f * 100)).padStart(3, '0')}.png` })
  console.log(`✓ p=${f}`)
}

await browser.close()
await new Promise((res, rej) => server.httpServer.close((e) => (e ? rej(e) : res())))
