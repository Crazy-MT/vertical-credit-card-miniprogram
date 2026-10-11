import { glitterParticles } from './glitter'

export interface EffectState {
  tiltX: number; tiltY: number; glare: boolean; holographic: boolean; dust: boolean
  edge: boolean; rgb: boolean; continuousTube: boolean; color: string; radius: number
}
const width = 240, height = 380.64
const alpha = (hex: string, opacity: number) => {
  const value = hex.replace('#', '').slice(0, 6)
  return `rgba(${parseInt(value.slice(0, 2), 16)},${parseInt(value.slice(2, 4), 16)},${parseInt(value.slice(4, 6), 16)},${opacity})`
}
/** Canvas equivalents of the original dynamic painters. Static art uses original renders. */
export class CardEffects {
  private readonly context
  private frame = 0
  private active = true
  private pulseAt = 0
  private readonly epoch = Date.now()
  private lastDraw = 0
  private state: EffectState = { tiltX: 0, tiltY: 0, glare: false, holographic: false, dust: false, edge: false, rgb: false, continuousTube: false, color: '#00f0ff', radius: 16 }
  constructor(private readonly canvas: WechatMiniprogram.Canvas, dpr: number) {
    canvas.width = width * dpr; canvas.height = height * dpr
    this.context = canvas.getContext('2d'); this.context.scale(dpr, dpr)
  }
  update(state: EffectState) { this.state = state; this.draw(); this.schedule() }
  pulse() { this.pulseAt = Date.now(); this.draw(); this.schedule() }
  pause() { this.active = false; if (this.frame) this.canvas.cancelAnimationFrame(this.frame); this.frame = 0 }
  resume() { this.active = true; this.draw(); this.schedule() }
  private schedule() {
    if (!this.active || this.frame || !(this.state.edge || this.pulseAt)) return
    this.frame = this.canvas.requestAnimationFrame(() => {
      this.frame = 0
      if (Date.now() - this.lastDraw >= 30) this.draw()
      this.schedule()
    })
  }
  private outline() {
    const c = this.context, r = Math.min(50, Math.max(0, this.state.radius))
    c.beginPath(); c.moveTo(r, 0); c.lineTo(width - r, 0); c.arcTo(width, 0, width, r, r)
    c.lineTo(width, height - r); c.arcTo(width, height, width - r, height, r)
    c.lineTo(r, height); c.arcTo(0, height, 0, height - r, r)
    c.lineTo(0, r); c.arcTo(0, 0, r, 0, r); c.closePath()
  }
  private draw() {
    this.lastDraw = Date.now()
    const c = this.context, s = this.state
    c.clearRect(0, 0, width, height); c.save(); this.outline(); c.clip()
    if (s.glare) {
      const x = Math.max(-.1, Math.min(1.1, .5 - s.tiltX * 1.8)) * width
      const y = Math.max(-.1, Math.min(1.1, .5 - s.tiltY * 1.8)) * height
      const gradient = c.createRadialGradient(x, y, 0, x, y, width * .95)
      gradient.addColorStop(0, 'rgba(255,255,255,.14)'); gradient.addColorStop(.45, 'rgba(255,255,255,.0525)'); gradient.addColorStop(1, 'rgba(255,255,255,0)')
      c.fillStyle = gradient; c.fillRect(0, 0, width, height)
      const streak = c.createLinearGradient(s.tiltX * width, s.tiltY * height, width * (1 + s.tiltX), height * (1 + s.tiltY))
      streak.addColorStop(.35, 'rgba(255,255,255,0)'); streak.addColorStop(.5, 'rgba(255,255,255,.063)'); streak.addColorStop(.65, 'rgba(255,255,255,0)')
      c.fillStyle = streak; c.fillRect(0, 0, width, height)
    }
    if (s.holographic) {
      const colors = ['#00ffff00', '#00ffff66', '#00ff6666', '#ffff0088', '#ff007f88', '#7f00ff66', '#00ffff66', '#00ffff00']
      const stops = [0, .15, .3, .5, .7, .85, .95, 1]
      const gradient = c.createConicGradient ? c.createConicGradient(Math.atan2(s.tiltY, s.tiltX) + Math.PI / 4, width * (.5 + s.tiltX * .35), height * (.5 + s.tiltY * .35)) : c.createLinearGradient(0, 0, width, height)
      colors.forEach((color, i) => gradient.addColorStop(stops[i], color))
      c.fillStyle = gradient; c.fillRect(0, 0, width, height)
    }
    if (s.dust) for (const p of glitterParticles) {
      const flash = Math.exp(-Math.hypot(s.tiltX - p.optimumX, s.tiltY - p.optimumY) * p.sensitivity)
      if (flash < .05) continue
      const x = p.x * width, y = p.y * height
      c.fillStyle = alpha('#fff9e6', flash * .9); c.beginPath(); c.arc(x, y, p.size * .35 * flash, 0, Math.PI * 2); c.fill()
      if (flash > .45) {
        const length = p.size * 2.4 * flash
        c.fillStyle = alpha('#ffffff', flash * .8); c.beginPath(); c.moveTo(x - length, y)
        c.quadraticCurveTo(x, y, x, y - length); c.quadraticCurveTo(x, y, x + length, y)
        c.quadraticCurveTo(x, y, x, y + length); c.quadraticCurveTo(x, y, x - length, y); c.fill()
      }
    }
    if (s.edge) {
      const progress = ((Date.now() - this.epoch) % 3200) / 3200
      const length = 2 * (width + height - 4 * s.radius) + 2 * Math.PI * s.radius
      const color = s.rgb ? `hsl(${progress * 360},92%,54%)` : s.color
      c.save(); this.outline(); c.setLineDash(s.continuousTube ? [] : [length * .28, length * .72]); c.lineDashOffset = -progress * length; c.lineCap = 'round'
      c.strokeStyle = color; c.shadowColor = color; c.shadowBlur = 7; c.lineWidth = 6; c.globalAlpha = .45; c.stroke()
      c.shadowBlur = 2.5; c.lineWidth = 3; c.globalAlpha = .85; c.stroke()
      c.shadowBlur = 0; c.strokeStyle = 'rgba(255,255,255,.95)'; c.globalAlpha = 1; c.lineWidth = 1.2; c.stroke(); c.restore()
    }
    if (this.pulseAt) {
      const progress = (Date.now() - this.pulseAt) / 900
      if (progress >= 1) this.pulseAt = 0
      else for (let i = 0; i < 3; i++) {
        const p = progress - i * .22
        if (p <= 0) continue
        const curve = 1 - Math.pow(1 - p, 3), radius = curve * Math.hypot(width, height) * .95
        c.save(); c.beginPath(); c.arc(width * .78, height * .14, radius, 0, Math.PI * 2)
        c.strokeStyle = alpha(s.color, (1 - curve) * .35); c.lineWidth = 3 + (1 - curve) * 4; c.shadowColor = s.color; c.shadowBlur = 4; c.stroke()
        c.strokeStyle = alpha('#ffffff', (1 - curve) * .6); c.shadowBlur = 0; c.lineWidth = 1.5; c.stroke(); c.restore()
      }
    }
    c.restore()
  }
}
/** Original four-orb harmonic fluid mesh, with its original 12-second period. */
export class FluidMesh {
  private readonly context
  private frame = 0
  private active = true
  private readonly epoch = Date.now()
  constructor(private readonly canvas: WechatMiniprogram.Canvas, dpr: number) {
    canvas.width = width * dpr; canvas.height = height * dpr
    this.context = canvas.getContext('2d'); this.context.scale(dpr, dpr); this.draw()
  }
  pause() { this.active = false; this.canvas.cancelAnimationFrame(this.frame) }
  resume() { if (!this.active) { this.active = true; this.draw() } }
  private draw() {
    const c = this.context, t = ((Date.now() - this.epoch) % 12000) / 12000 * 2 * Math.PI
    c.fillStyle = '#0a0a16'; c.fillRect(0, 0, width, height)
    const orbs = [
      [.35 + .3 * Math.sin(t * .8), .3 + .25 * Math.cos(t * .6), .75, '#6c11d9'],
      [.65 + .25 * Math.cos(t * .9 + 1.2), .7 + .2 * Math.sin(t * .7 + 2), .85, '#00e5ff'],
      [.2 + .3 * Math.sin(t * 1.1 + 3), .8 + .2 * Math.cos(t * .85 + .5), .7, '#ff007a'],
      [.75 + .2 * Math.cos(t * .75 + 4), .25 + .25 * Math.sin(t + 1.5), .8, '#4a00e0'],
    ] as Array<[number, number, number, string]>
    for (const [relX, relY, relRadius, color] of orbs) {
      const x = relX * width, y = relY * height, radius = relRadius * width
      const gradient = c.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, alpha(color, .65)); gradient.addColorStop(.55, alpha(color, .25)); gradient.addColorStop(1, alpha(color, 0))
      c.fillStyle = gradient; c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fill()
    }
    if (this.active) this.frame = this.canvas.requestAnimationFrame(() => this.draw())
  }
}
export const effectRenderers = new WeakMap<object, CardEffects>()
export const fluidRenderers = new WeakMap<object, FluidMesh[]>()
