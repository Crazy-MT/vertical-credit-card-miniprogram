Component({
  properties: { cards: { type: Array, value: [] as Array<{ id: string; preset: string; bankName?: string; cardNumber?: string; cardHolder?: string; expiryDate?: string; cvv?: string }> }, cardSpacing: { type: Number, value: 64 }, cardHeight: { type: Number, value: 380 }, width: { type: Number, value: 240 }, initialIndex: { type: Number, value: -1 }, animationDuration: { type: Number, value: 400 }, animationCurve: { type: String, value: 'cubic-bezier(.175,.885,.32,1.275)' } },
  data: { selectedIndex: -1, heightStyle: '', positions: [] as Array<{ id: string; style: string; preset: string; bankName?: string; cardNumber?: string; cardHolder?: string; expiryDate?: string; cvv?: string }> },
  observers: { 'cards,cardSpacing,cardHeight,width,animationDuration,animationCurve': function () { this.layout() }, initialIndex(value: number) { this.setData({ selectedIndex: value }); this.layout() } },
  methods: {
    selectCard(event: WechatMiniprogram.BaseEvent) { const index = Number(event.currentTarget.dataset.index); const selectedIndex = this.data.selectedIndex === index ? -1 : index; this.setData({ selectedIndex }); this.layout(); this.triggerEvent('cardselected', { value: selectedIndex < 0 ? null : selectedIndex }) },
    layout() {
      const { cards, selectedIndex, cardSpacing, cardHeight, animationDuration, animationCurve } = this.data
      const selected = selectedIndex >= 0 && selectedIndex < cards.length
      this.setData({ heightStyle: `height:${!cards.length ? 0 : selected ? cardHeight + (cards.length > 1 ? 90 : 0) : (cards.length - 1) * cardSpacing + cardHeight}px;transition:height ${animationDuration}ms ease;`, positions: cards.map((card, index) => {
        const top = !selected ? index * cardSpacing : index === selectedIndex ? 0 : index < selectedIndex ? -30 * (selectedIndex - index) : cardHeight + 20 + (index - selectedIndex - 1) * 16
        const scale = !selected ? 1 : index === selectedIndex ? 1.02 : index < selectedIndex ? 1 : .94 - (index - selectedIndex - 1) * .02
        const opacity = !selected || index === selectedIndex ? 1 : index < selectedIndex ? 0 : .85
        return { ...card, style: `top:${top}px;transform:scale(${scale});opacity:${opacity};z-index:${selected && index === selectedIndex ? cards.length + 1 : index};pointer-events:${opacity === 0 ? 'none' : 'auto'};transition:all ${animationDuration}ms ${animationCurve};` }
      }) })
    },
  },
})
