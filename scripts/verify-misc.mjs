import { preview } from 'vite'
import puppeteer from 'puppeteer'

const server = await preview({ preview: { port: 4176, strictPort: false, open: false } })
const url = server.resolvedUrls.local[0]
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})

// 1. Bulgarian landing
let page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1000 })
await page.goto(`${url}?lang=bg`, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3000))
await page.screenshot({ path: '/tmp/cv-shots/bg-landing.png' })
console.log('✓ bg landing')

// 2. Download dropdown open + link targets
const links = await page.evaluate(() => {
  document.querySelector('.nav-download')?.classList.add('open')
  return [...document.querySelectorAll('.nav-download-menu a')].map((a) => a.getAttribute('href'))
})
console.log('download links:', links)
await page.screenshot({ path: '/tmp/cv-shots/bg-dropdown.png' })
await page.close()

// 3. Mobile landing + a chapter
page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
await page.goto(url, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 2500))
await page.screenshot({ path: '/tmp/cv-shots/mobile-landing.png' })
await page.evaluate(() => {
  const max = document.documentElement.scrollHeight - window.innerHeight
  window.scrollTo(0, max * 0.45)
})
await new Promise((r) => setTimeout(r, 9000))
await page.screenshot({ path: '/tmp/cv-shots/mobile-about.png' })
console.log('✓ mobile')
await page.close()

// 4. Reduced motion static page
page = await browser.newPage()
await page.setViewport({ width: 1280, height: 1400 })
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await page.goto(url, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1200))
await page.screenshot({ path: '/tmp/cv-shots/static-fallback.png' })
console.log('✓ static fallback')
await page.close()

await browser.close()
await new Promise((res, rej) => server.httpServer.close((e) => (e ? rej(e) : res())))
