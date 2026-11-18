import fs from 'node:fs'
import path from 'node:path'
import {
  applySeo,
  rewriteBuiltAssets,
  siteOrigin,
  staticResponse,
  writeStaticFiles,
  warnIfDescriptionsDrift,
} from './seo-build.mjs'

const avatarPath = path.resolve('src/assets/avatar.jpg')

export function seoPlugin() {
  let outDir = 'dist'
  let root = process.cwd()
  const origin = siteOrigin()
  warnIfDescriptionsDrift()

  return {
    name: 'cv-seo',
    configResolved(config) {
      outDir = config.build.outDir
      root = config.root
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const requestPath = ctx?.path || ''
        const lang = requestPath.includes('/bg/') ? 'bg' : 'en'
        return applySeo(html, lang, origin)
      },
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = req.url || '/'
          const pathname = url.split('?')[0]
          if (pathname === '/bg' || pathname === '/bg/') {
            const raw = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
            let html = await server.transformIndexHtml('/bg/index.html', raw)
            html = html.replace(/(href|src)="\.\/(?!\/)/g, '$1="/')
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(html)
            return
          }
          const hit = staticResponse(pathname, origin)
          if (hit) {
            res.statusCode = 200
            res.setHeader('Content-Type', hit.type)
            res.end(hit.body)
            return
          }
          if (pathname === '/avatar.jpg') {
            res.statusCode = 200
            res.setHeader('Content-Type', 'image/jpeg')
            fs.createReadStream(path.join(root, 'src/assets/avatar.jpg')).pipe(res)
            return
          }
        } catch (error) {
          next(error)
          return
        }
        next()
      })
    },
    closeBundle() {
      const dist = path.resolve(root, outDir)
      writeStaticFiles(dist, origin)
      const built = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
      const bg = rewriteBuiltAssets(applySeo(built, 'bg', origin))
      fs.mkdirSync(path.join(dist, 'bg'), { recursive: true })
      fs.writeFileSync(path.join(dist, 'bg', 'index.html'), bg)
      if (!fs.existsSync(path.join(dist, 'avatar.jpg'))) {
        fs.copyFileSync(avatarPath, path.join(dist, 'avatar.jpg'))
      }
    },
  }
}
