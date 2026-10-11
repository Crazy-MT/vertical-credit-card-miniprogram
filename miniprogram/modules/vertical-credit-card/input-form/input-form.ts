import { detectCardBrand, formatCardNumber, formatExpiry } from '../model'
Component({
  properties: { cardNumber: String, cardHolder: String, expiryDate: String, cvv: String },
  data: { numberValue: '', holderValue: '', expiryValue: '', cvvValue: '', brand: 'generic' },
  observers: { 'cardNumber,cardHolder,expiryDate,cvv': function () { this.setData({ numberValue: this.data.cardNumber, holderValue: this.data.cardHolder, expiryValue: this.data.expiryDate, cvvValue: this.data.cvv, brand: detectCardBrand(this.data.cardNumber) }) } },
  methods: {
    changeNumber(event: WechatMiniprogram.Input) { const value = formatCardNumber(event.detail.value); const brand = detectCardBrand(value); const previousBrand = this.data.brand; this.setData({ numberValue: value, brand }); this.triggerEvent('cardnumberchanged', { value }); if (brand !== previousBrand) this.triggerEvent('brandchanged', { value: brand }); return value },
    changeHolder(event: WechatMiniprogram.Input) { const value = event.detail.value.slice(0, 26); this.setData({ holderValue: value }); this.triggerEvent('cardholderchanged', { value }); return value },
    changeExpiry(event: WechatMiniprogram.Input) { const value = formatExpiry(event.detail.value); this.setData({ expiryValue: value }); this.triggerEvent('expirychanged', { value }); return value },
    changeCvv(event: WechatMiniprogram.Input) { const value = event.detail.value.replace(/\D/g, '').slice(0, 4); this.setData({ cvvValue: value }); this.triggerEvent('cvvchanged', { value }); return value },
    focusCvv() { this.triggerEvent('cvvfocuschanged', { value: true }) }, blurCvv() { this.triggerEvent('cvvfocuschanged', { value: false }) },
  },
})
