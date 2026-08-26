import * as THREE from 'three'
import { palette } from '../theme'

/**
 * A live "code editor" painted onto a canvas texture for the laptop
 * screen. Lines of colored bars type themselves out on a loop — the
 * screen feels alive long before the visitor dives into it.
 */
export class ScreenCanvasTexture {
  readonly texture: THREE.CanvasTexture
  private ctx: CanvasRenderingContext2D
  private w = 512
  private h = 340
  private lastPaint = 0

  // Fake code: each line is [indent, [width, colorIndex][]]
  private lines: Array<[number, Array<[number, number]>]> = []

  constructor() {
    const canvas = document.createElement('canvas')
    canvas.width = this.w
    canvas.height = this.h
    this.ctx = canvas.getContext('2d')!
    this.texture = new THREE.CanvasTexture(canvas)
    this.texture.colorSpace = THREE.SRGBColorSpace
    this.texture.anisotropy = 4
    this.buildLines()
    this.paint(0)
  }

  private buildLines() {
    const rand = mulberry32(7)
    let indent = 0
    for (let i = 0; i < 16; i++) {
      if (indent > 0 && rand() < 0.3) indent--
      const segs: Array<[number, number]> = []
      const n = 2 + Math.floor(rand() * 3)
      for (let s = 0; s < n; s++) {
        segs.push([26 + rand() * 88, Math.floor(rand() * 4)])
      }
      this.lines.push([indent, segs])
      if (rand() < 0.4 && indent < 3) indent++
    }
  }

  /** t = seconds; throttled internally to ~12fps. */
  update(t: number) {
    if (t - this.lastPaint < 0.085) return
    this.lastPaint = t
    this.paint(t)
    this.texture.needsUpdate = true
  }

  private paint(t: number) {
    const { ctx, w, h } = this
    ctx.fillStyle = palette.screenGlow
    ctx.fillRect(0, 0, w, h)

    // Window chrome
    ctx.fillStyle = '#0b0f14'
    ctx.fillRect(0, 0, w, 30)
    const dots = ['#e0654f', '#e5b243', '#5fb56e']
    dots.forEach((c, i) => {
      ctx.beginPath()
      ctx.fillStyle = c
      ctx.arc(20 + i * 18, 15, 5, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.fillStyle = '#4a545e'
    ctx.font = '600 12px monospace'
    ctx.fillText('architecture.java — denis@loom', 84, 19)

    // Typing loop: reveal lines progressively over ~14s, then hold, reset
    const cycle = 18
    const ct = (t % cycle) / cycle
    const reveal = Math.min(1, ct / 0.72) * this.lines.length

    const colors = ['#6d9fc4', palette.screenText, '#8fbf8f', '#8a93a1']
    const lineH = 18
    for (let i = 0; i < this.lines.length; i++) {
      if (i > reveal) break
      const frac = Math.min(1, Math.max(0, reveal - i))
      const [indent, segs] = this.lines[i]
      let x = 22 + indent * 22
      const y = 52 + i * lineH

      // line number
      ctx.fillStyle = '#39424c'
      ctx.font = '10px monospace'
      ctx.fillText(String(i + 1).padStart(2, ' '), 4, y + 8)

      const total = segs.reduce((a, [sw]) => a + sw + 8, 0)
      let budget = total * frac
      for (const [sw, ci] of segs) {
        const drawW = Math.min(sw, Math.max(0, budget))
        if (drawW <= 0) break
        ctx.fillStyle = colors[ci]
        ctx.globalAlpha = 0.92
        roundRect(ctx, x, y, drawW, 9, 3)
        ctx.globalAlpha = 1
        x += sw + 8
        budget -= sw + 8
      }
    }

    // Caret blink
    const caretLine = Math.min(this.lines.length - 1, Math.floor(reveal))
    if (Math.floor(t * 2.2) % 2 === 0) {
      const [indent, segs] = this.lines[caretLine]
      const frac = Math.min(1, Math.max(0, reveal - caretLine))
      const total = segs.reduce((a, [sw]) => a + sw + 8, 0)
      const x = 22 + indent * 22 + total * frac + 2
      ctx.fillStyle = palette.screenText
      ctx.fillRect(x, 50 + caretLine * lineH, 2, 12)
    }
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
