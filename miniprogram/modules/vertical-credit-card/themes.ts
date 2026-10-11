import { CardTheme } from './model'

const base: CardTheme = { id: 'custom', name: 'Custom', family: 'Custom', type: 'flat', backgroundColor: '#1e1e2c', textColor: '#ffffff', secondaryTextColor: '#ffffffaa', chipColor: 'gold', textFinish: 'flat', isHolographic: false, enableEdgeGlow: false, edgeGlowColor: '#00f0ff', enableDiamondDust: false, enablePaymentPulse: false, isRgbChroma: false, continuousEdgeTube: false, blur: 12 }
export const flatTheme = (options: Partial<CardTheme> = {}): CardTheme => ({ ...base, ...options, type: 'flat' })
export const metallicTheme = (metal: 'brushedTitanium' | 'gold' | 'silver' | 'obsidian' | 'roseGold' = 'brushedTitanium', options: Partial<CardTheme> = {}): CardTheme => {
  const colors = { brushedTitanium: '#858998,#dee0e8,#8c919f', gold: '#b58a37,#f5dfa0,#bf943d', silver: '#939ca6,#f2f4f7,#8a939e', obsidian: '#101114,#303239,#0d0e10', roseGold: '#bd8778,#f6d4c6,#c69385' }
  const dark = metal === 'brushedTitanium' || metal === 'obsidian'
  return { ...base, type: 'metallic', gradient: `linear-gradient(135deg,${colors[metal]})`, textColor: dark ? '#ffffff' : '#222222', chipColor: metal === 'gold' ? 'gold' : metal === 'obsidian' ? 'black' : 'silver', ...options }
}
export const glassTheme = (options: Partial<CardTheme> = {}): CardTheme => ({ ...base, type: 'glass', backgroundColor: '#ffffff14', chipColor: 'silver', blur: 14, ...options })
export const artisticTheme = (backgroundImage: string, options: Partial<CardTheme> = {}): CardTheme => ({ ...base, type: 'artistic', backgroundImage, ...options })
