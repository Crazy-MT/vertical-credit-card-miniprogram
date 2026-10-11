export type CardBrand = 'visa' | 'mastercard' | 'americanExpress' | 'discover' | 'dinersClub' | 'jcb' | 'unionPay' | 'generic'
export type CardTextFinish = 'flat' | 'goldFoil' | 'silverFoil' | 'roseGoldFoil' | 'embossed'
export interface CardTheme {
  id: string
  name: string
  family: string
  type: 'flat' | 'metallic' | 'glass' | 'artistic'
  backgroundImage?: string
  backgroundColor?: string
  gradient?: string
  textColor: string
  secondaryTextColor: string
  chipColor: 'gold' | 'silver' | 'black'
  textFinish: CardTextFinish
  isHolographic: boolean
  enableEdgeGlow: boolean
  edgeGlowColor: string
  enableDiamondDust: boolean
  enablePaymentPulse: boolean
  isRgbChroma: boolean
  continuousEdgeTube: boolean
  blur: number
  borderRadius?: number
  shadows?: string
}
export const detectCardBrand = (number: string): CardBrand => {
  const clean = number.replace(/\s/g, '')
  if (/^4/.test(clean)) return 'visa'
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(clean)) return 'mastercard'
  if (/^3[47]/.test(clean)) return 'americanExpress'
  if (/^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5])|64[4-9]|65)/.test(clean)) return 'discover'
  if (/^(30[0-5]|36|38)/.test(clean)) return 'dinersClub'
  if (/^(352[89]|35[3-8][0-9])/.test(clean)) return 'jcb'
  if (/^62/.test(clean)) return 'unionPay'
  return 'generic'
}
export const formatCardNumber = (value: string) => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})(?=.)/g, '$1 ')
export const formatExpiry = (value: string) => value.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
export const displayCardNumber = (value: string, privateMode: boolean) => {
  const clean = value.replace(/\s/g, '')
  if (privateMode) return `••••  ••••  ••••  ${clean.slice(-4)}`
  return clean ? clean.replace(/(.{4})(?=.)/g, '$1  ') : '••••  ••••  ••••  ••••'
}
export const brandLabels: Record<CardBrand, string> = { visa: 'VISA', mastercard: 'mastercard', americanExpress: 'AMERICAN EXPRESS', discover: 'DISCOVER', dinersClub: 'DINERS CLUB', jcb: 'JCB', unionPay: 'UnionPay 银联', generic: '' }
