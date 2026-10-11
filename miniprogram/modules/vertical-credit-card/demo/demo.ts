import { cardPresets, getCardPreset } from '../presets'
import { CardTextFinish } from '../model'
import { flatTheme } from '../themes'
Component({
  data: {
    presets: cardPresets, presetNames: cardPresets.map(item => item.name), presetIndex: 0, preset: cardPresets[0].id,
    mode: 'showcase', modes: [{ id: 'showcase', label: '卡片展示' }, { id: 'wallet', label: '卡片堆叠' }, { id: 'checkout', label: '输入联动' }, { id: 'studio', label: '自定义' }],
    cardNumber: '4111 2222 3333 4444', cardHolder: 'ELENA ROJAS', expiryDate: '12/28', cvv: '123', bankName: 'NUBANK',
    flipped: false, frozen: false, expired: false, privateMode: false, tilt: true, glare: true,
    holographic: false, edgeGlow: false, diamondDust: false, paymentPulse: false, rgb: false,
    color: '#233b6e', textColor: '#ffffff', textFinish: 'flat', finishes: ['flat', 'goldFoil', 'silverFoil', 'roseGoldFoil', 'embossed'], finishIndex: 0,
    customTheme: flatTheme({ backgroundColor: '#233b6e' }),
    walletCards: [{ id: 'one', preset: 'appleTitanium', bankName: 'APPLE CARD', cardNumber: '4111222233334444', cardHolder: 'ELENA ROJAS', expiryDate: '12/28', cvv: '123' }, { id: 'two', preset: 'nubankUltravioleta', bankName: 'NUBANK', cardNumber: '5555666677778888', cardHolder: 'ELENA ROJAS', expiryDate: '11/29', cvv: '456' }, { id: 'three', preset: 'worldNavigator', bankName: 'NAVIGATOR', cardNumber: '6222333344445555', cardHolder: 'ELENA ROJAS', expiryDate: '10/30', cvv: '789' }], selectedCard: -1,
  },
  methods: {
    changeMode(event: WechatMiniprogram.BaseEvent) { this.setData({ mode: String(event.currentTarget.dataset.mode) }) },
    changePreset(event: WechatMiniprogram.PickerChange) {
      const presetIndex = Number(event.detail.value); const theme = getCardPreset(cardPresets[presetIndex].id)
      this.setData({ presetIndex, preset: theme.id, bankName: theme.name.toUpperCase(), holographic: theme.isHolographic, edgeGlow: theme.enableEdgeGlow, diamondDust: theme.enableDiamondDust, paymentPulse: theme.enablePaymentPulse, rgb: theme.isRgbChroma, textFinish: theme.textFinish, finishIndex: this.data.finishes.indexOf(theme.textFinish) })
    },
    changeFlag(event: WechatMiniprogram.CustomEvent<{ value: boolean }>) {
      const key = String(event.currentTarget.dataset.key)
      if (['frozen', 'expired', 'privateMode', 'tilt', 'glare', 'holographic', 'edgeGlow', 'diamondDust', 'paymentPulse', 'rgb'].includes(key)) this.setData({ [key]: event.detail.value })
    },
    flip() { this.setData({ flipped: !this.data.flipped }) },
    flipChanged(event: WechatMiniprogram.CustomEvent<{ value: boolean }>) { this.setData({ flipped: event.detail.value }) },
    privacyChanged(event: WechatMiniprogram.CustomEvent<{ value: boolean }>) { this.setData({ privateMode: event.detail.value }) },
    numberChanged(event: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ cardNumber: event.detail.value }) },
    holderChanged(event: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ cardHolder: event.detail.value }) },
    expiryChanged(event: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ expiryDate: event.detail.value }) },
    cvvChanged(event: WechatMiniprogram.CustomEvent<{ value: string }>) { this.setData({ cvv: event.detail.value }) },
    cvvFocusChanged(event: WechatMiniprogram.CustomEvent<{ value: boolean }>) { this.setData({ flipped: event.detail.value }) },
    cardSelected(event: WechatMiniprogram.CustomEvent<{ value: number | null }>) { this.setData({ selectedCard: event.detail.value === null ? -1 : event.detail.value }) },
    colorChanged(event: WechatMiniprogram.Input) { this.setData({ color: event.detail.value }); this.updateTheme() },
    textColorChanged(event: WechatMiniprogram.Input) { this.setData({ textColor: event.detail.value }); this.updateTheme() },
    finishChanged(event: WechatMiniprogram.PickerChange) { const finishIndex = Number(event.detail.value); this.setData({ finishIndex, textFinish: this.data.finishes[finishIndex] }); this.updateTheme() },
    updateTheme() {
      if (!/^#[0-9a-f]{6}$/i.test(this.data.color) || !/^#[0-9a-f]{6}$/i.test(this.data.textColor)) return
      this.setData({ customTheme: flatTheme({ backgroundColor: this.data.color, textColor: this.data.textColor, textFinish: this.data.textFinish as CardTextFinish }) })
    },
    regenerateCvv() { this.setData({ cvv: String(Math.floor(Math.random() * 900) + 100), flipped: true }) },
    exportConfig() {
      wx.setClipboardData({ data: JSON.stringify({ preset: this.data.preset, cardTheme: this.data.mode === 'studio' ? this.data.customTheme : undefined, bankName: this.data.bankName, isFrozen: this.data.frozen, isExpired: this.data.expired, isPrivacyMode: this.data.privateMode, enable3DTilt: this.data.tilt, enableSpecularGlare: this.data.glare, enableHolographicFoil: this.data.holographic, enableEdgeGlow: this.data.edgeGlow, enableDiamondDust: this.data.diamondDust, enablePaymentPulse: this.data.paymentPulse, isRgbChroma: this.data.rgb, textFinish: this.data.textFinish }, null, 2) })
    },
  },
})
