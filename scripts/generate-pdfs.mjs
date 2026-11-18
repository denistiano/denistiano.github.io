/**
 * Renders the /?print=<lang> route of the built site with headless
 * Chromium and writes ATS-friendly A4 PDFs into dist/cv/ so they ship
 * with the GitHub Pages artifact. Also refreshes the Open Graph card
 * and the Apple touch icon in dist/. PDFs are not committed.
 *
 * Usage: npm run pdf   (expects `npm run build` to have run first)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import puppeteer from 'puppeteer'
import { PDFDocument } from 'pdf-lib'
import { iconDocument, ogDocument, pdfMeta } from './seo-build.mjs'

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

  const pdfPath = path.join(distCv, file)
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
    outline: true,
  })
  await page.close()

  const meta = pdfMeta(lang)
  const doc = await PDFDocument.load(await readFile(pdfPath))
  doc.setTitle(meta.title)
  doc.setAuthor(meta.author)
  doc.setSubject(meta.subject)
  doc.setKeywords(meta.keywords)
  doc.setLanguage(meta.language)
  doc.setCreator('https://denisiliev.site/')
  doc.setProducer('Denis Iliev')
  await writeFile(pdfPath, await doc.save())
  console.log(`✓ ${file}`)
}

const card = await browser.newPage()
await card.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
for (const lang of ['en', 'bg']) {
  await card.setContent(ogDocument(lang), { waitUntil: 'domcontentloaded' })
  const name = lang === 'bg' ? 'og-bg.png' : 'og.png'
  await card.screenshot({ path: path.join(root, 'dist', name), type: 'png' })
  console.log(`✓ ${name}`)
}
await card.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 })
await card.setContent(iconDocument(), { waitUntil: 'domcontentloaded' })
await card.screenshot({ path: path.join(root, 'dist', 'apple-touch-icon.png'), type: 'png' })
console.log('✓ apple-touch-icon.png')
await card.close()

await browser.close()
await new Promise((resolve, reject) =>
  server.httpServer.close((err) => (err ? reject(err) : resolve())),
)
console.log('PDFs generated in dist/cv/.')
