import { brandLabels, CardBrand, CardTheme, detectCardBrand, displayCardNumber } from '../model'
import { getCardPreset } from '../presets'
import { CardEffects, FluidMesh, effectRenderers, fluidRenderers } from '../effects'

Component({
  options: { multipleSlots: true },
  properties: {
    preset: { type: String, value: 'nubank' }, cardTheme: { type: null, value: null as CardTheme | null },
    cardNumber: { type: String, value: '' }, cardHolder: { type: String, value: '' }, expiryDate: { type: String, value: '' }, cvv: { type: String, value: '' },
    bankName: { type: String, value: '' }, brand: { type: String, value: '' }, width: { type: Number, value: 240 },
    isFrozen: Boolean, isExpired: Boolean, isPrivacyMode: Boolean,
    enablePrivacyToggle: { type: Boolean, value: true }, enableFlip: { type: Boolean, value: true },
    isFlipped: { type: Boolean, value: false }, enable3DTilt: { type: Boolean, value: true },
    enableSpecularGlare: { type: Boolean, value: true }, maxTiltAngle: { type: Number, value: 0.24 },
    enableHolographicFoil: { type: null, value: null }, enableEdgeGlow: { type: null, value: null },
    enableDiamondDust: { type: null, value: null }, enablePaymentPulse: { type: null, value: null },
    isRgbChroma: { type: null, value: null }, edgeGlowColor: String, textFinish: String, useBankLogo: Boolean, useChipWidget: Boolean,
  },
  data: {
    _meltTimer: 0, _flipUntil: 0, _wasFrozen: false, _dragged: false, _startPoint: null as { x: number; y: number } | null, _bounds: null as WechatMiniprogram.BoundingClientRectCallbackResult | null, theme: getCardPreset('nubank'), privateMode: false, flipped: false, numberText: '', expiryText: '', cvvText: '', brandName: '', brandId: 'generic', holderText: '',
    tiltX: 0, tiltY: 0, cardStyle: '', viewportStyle: '', scaleStyle: '', tiltStyle: '', flipStyle: '', textFoilStyle: '', finish: 'flat',
    holographic: false, edgeGlow: false, diamondDust: false, paymentPulse: false, rgb: false, melting: false,
  },
  observers: {
    'preset, cardTheme, width, enableHolographicFoil, enableEdgeGlow, enableDiamondDust, enablePaymentPulse, isRgbChroma, edgeGlowColor, textFinish': function () { this.syncTheme() },
    enableSpecularGlare() { this.updateEffects() },
    'cardNumber, cardHolder, expiryDate, cvv, brand': function () { this.syncText() },
    isPrivacyMode(value: boolean) { this.setData({ privateMode: value }); this.syncText() },
    isFlipped(value: boolean) { this.setFlipped(value, false) },
    isFrozen(value: boolean) {
      if (!value && this.data._wasFrozen) {
        this.setData({ melting: true })
        this.data._meltTimer = setTimeout(() => this.setData({ melting: false }), 750)
      }
      this.data._wasFrozen = value
    },
  },
  pageLifetimes: { hide() { effectRenderers.get(this)?.pause(); fluidRenderers.get(this)?.forEach(renderer => renderer.pause()) }, show() { effectRenderers.get(this)?.resume(); fluidRenderers.get(this)?.forEach(renderer => renderer.resume()) } },
  lifetimes: {
    ready() { this.initEffects() },
    attached() { this.syncTheme(); this.setData({ privateMode: this.data.isPrivacyMode }); this.syncText(); this.setFlipped(this.data.isFlipped, false) },
    detached() { effectRenderers.get(this)?.pause(); fluidRenderers.get(this)?.forEach(renderer => renderer.pause()); effectRenderers.delete(this); fluidRenderers.delete(this); if (this.data._meltTimer) clearTimeout(this.data._meltTimer) },
  },
  methods: {
    initEffects() {
      const dpr = wx.getSystemInfoSync().pixelRatio || 2
      this.createSelectorQuery().select('.effect-canvas').fields({ node: true }).exec(results => {
        const node = results[0]?.node as WechatMiniprogram.Canvas | undefined
        if (!node) return
        effectRenderers.get(this)?.pause()
        effectRenderers.set(this, new CardEffects(node, dpr)); this.updateEffects()
      })
      this.initFluid()
    },
    initFluid() {
      fluidRenderers.get(this)?.forEach(renderer => renderer.pause())
      fluidRenderers.delete(this)
      if (!['chromaticFluid', 'revolutChromatic'].includes(this.data.theme.id)) return
      this.createSelectorQuery().selectAll('.fluid-canvas').fields({ node: true }).exec(results => {
        const nodes = results[0] as Array<{ node: WechatMiniprogram.Canvas }> | undefined
        if (nodes?.length) fluidRenderers.set(this, nodes.map(item => new FluidMesh(item.node, wx.getSystemInfoSync().pixelRatio || 2)))
      })
    },
    updateEffects() {
      effectRenderers.get(this)?.update({ tiltX: this.data.tiltX, tiltY: this.data.tiltY, glare: this.data.enableSpecularGlare, holographic: this.data.holographic, dust: this.data.diamondDust, edge: this.data.edgeGlow, rgb: this.data.rgb, continuousTube: this.data.theme.continuousEdgeTube, color: this.data.edgeGlowColor || this.data.theme.edgeGlowColor, radius: this.data.theme.borderRadius ?? 16 })
    },
    syncTheme() {
      const theme = this.data.cardTheme || getCardPreset(this.data.preset)
      const oldThemeId = this.data.theme.id
      const width = Math.max(60, this.data.width)
      const effect = (override: unknown, fallback: boolean) => typeof override === 'boolean' ? override : fallback
      this.setData({
        theme, viewportStyle: `width:${width}px;height:${width * 1.586}px;`, scaleStyle: `transform:scale(${width / 240});`,
        cardStyle: `color:${theme.textColor};background:${theme.gradient || theme.backgroundColor || (theme.type === 'glass' ? '#182330' : '#10121a')};border-radius:${theme.borderRadius ?? 16}px;--edge-color:${this.data.edgeGlowColor || theme.edgeGlowColor};--secondary:${theme.secondaryTextColor};box-shadow:${theme.shadows || '0 12px 22px #00000045'};${theme.type === 'glass' ? `backdrop-filter:blur(${theme.blur}px);border:1.5px solid ${theme.edgeGlowColor};` : ''}`,
        finish: this.data.textFinish || theme.textFinish,
        holographic: effect(this.data.enableHolographicFoil, theme.isHolographic), edgeGlow: effect(this.data.enableEdgeGlow, theme.enableEdgeGlow),
        diamondDust: effect(this.data.enableDiamondDust, theme.enableDiamondDust), paymentPulse: effect(this.data.enablePaymentPulse, theme.enablePaymentPulse), rgb: effect(this.data.isRgbChroma, theme.isRgbChroma),
      }, () => { this.updateEffects(); if (oldThemeId !== theme.id) this.initFluid() })
    },
    syncText() {
      const brand = (this.data.brand || detectCardBrand(this.data.cardNumber)) as CardBrand
      this.setData({ numberText: displayCardNumber(this.data.cardNumber, this.data.privateMode), expiryText: this.data.privateMode ? '••/••' : this.data.expiryDate || 'MM/YY', cvvText: this.data.privateMode ? '•••' : this.data.cvv || '•••', holderText: (this.data.cardHolder || 'CARDHOLDER NAME').toUpperCase(), brandId: brand, brandName: brandLabels[brand] || '' })
    },
    setFlipped(value: boolean, notify: boolean) {
      if (this.data.flipped !== value) this.data._flipUntil = Date.now() + 550
      this.setData({ flipped: value, flipStyle: `transform:rotateY(${value ? 180 : 0}deg);` })
      if (notify) this.triggerEvent('flipchange', { value })
    },
    tapCard() {
      if (this.data._dragged) { this.data._dragged = false; return }
      if (this.data.paymentPulse) effectRenderers.get(this)?.pulse()
      wx.vibrateShort({ type: 'light' })
      this.triggerEvent('cardtap')
      if (this.data.enableFlip && Date.now() >= this.data._flipUntil) this.setFlipped(!this.data.flipped, true)
    },
    togglePrivacy() {
      if (!this.data.enablePrivacyToggle) { this.tapCard(); return }
      const value = !this.data.privateMode
      this.setData({ privateMode: value }); this.syncText(); this.triggerEvent('privacychange', { value })
    },
    startTilt(event: WechatMiniprogram.TouchEvent) {
      this.data._dragged = false
      const point = event.touches[0]
      if (!this.data.enable3DTilt || !point) return
      this.data._startPoint = { x: point.clientX, y: point.clientY }
      this.createSelectorQuery().select('.viewport').boundingClientRect(rect => {
        if (rect && !Array.isArray(rect)) this.data._bounds = rect
      }).exec()
    },
    moveTilt(event: WechatMiniprogram.TouchEvent) {
      if (!this.data.enable3DTilt || !this.data._bounds || !event.touches[0]) return
      const point = event.touches[0]; const rect = this.data._bounds
      if (this.data._startPoint && Math.abs(point.clientX - this.data._startPoint.x) + Math.abs(point.clientY - this.data._startPoint.y) > 6) this.data._dragged = true
      const x = Math.max(-1, Math.min(1, (point.clientX - rect.left) / rect.width * 2 - 1))
      const y = Math.max(-1, Math.min(1, (point.clientY - rect.top) / rect.height * 2 - 1))
      const angle = this.data.maxTiltAngle * 180 / Math.PI
      this.setData({ tiltX: x * this.data.maxTiltAngle, tiltY: y * this.data.maxTiltAngle, tiltStyle: `transform:rotateX(${-y * angle}deg) rotateY(${x * angle}deg);transition:none;`, textFoilStyle: `--foil-position:${50 + x * 20}%;` })
      this.updateEffects()
    },
    endTilt() { this.setData({ tiltX: 0, tiltY: 0, tiltStyle: 'transform:rotateX(0deg) rotateY(0deg);', textFoilStyle: '' }); this.updateEffects() },
  },
})
