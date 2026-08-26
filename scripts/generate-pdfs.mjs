/**
 * Renders the /?print=<lang> route of the built site with headless
 * Chromium and writes ATS-friendly A4 PDFs into dist/cv/ so they ship
 * with the GitHub Pages artifact. Nothing is written into the repo.
 *
 * Usage: npm run pdf   (expects `npm run build` to have run first)
 */
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import puppeteer from 'puppeteer'

const FILES = {
  en: 'Denis-Iliev-CV-EN.pdf',
  bg: 'Denis-Iliev-CV-BG.pdf',
}

const root = process.cwd()
const distCv = path.join(root, 'dist', 'cv')

if (!existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error('dist/ not found — run `npm run build` first.')
  process.exit(1)
}

const server = await preview({
  root,
  preview: { port: 4173, strictPort: false, open: false },
})
const url = server.resolvedUrls.local[0]
console.log(`Preview server at ${url}`)

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
})

await mkdir(distCv, { recursive: true })

for (const [lang, file] of Object.entries(FILES)) {
  const page = await browser.newPage()
  await page.goto(`${url}?print=${lang}`, { waitUntil: 'networkidle0' })
  await page.evaluateHandle('document.fonts.ready')

  await page.pdf({
    path: path.join(distCv, file),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  })
  await page.close()
  console.log(`✓ ${file}`)
}

await browser.close()
await new Promise((resolve, reject) =>
  server.httpServer.close((err) => (err ? reject(err) : resolve())),
)
console.log('PDFs generated in dist/cv/.')
