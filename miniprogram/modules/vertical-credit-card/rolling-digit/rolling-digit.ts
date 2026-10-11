Component({
  properties: { text: String, duration: { type: Number, value: 650 }, staggerDelay: { type: Number, value: 45 } },
  data: { _rollTimer: 0, characters: [] as Array<{ id: number; char: string; numeric: boolean; style: string; digits: number[] }> },
  observers: {
    text(value: string) {
      if (this.data._rollTimer) clearTimeout(this.data._rollTimer)
      const old = this.data.characters
      const characters = value.split('').map((char, id) => {
        const numeric = /^\d$/.test(char)
        const digit = numeric ? Number(char) : 0
        const previous = old[id] && old[id].numeric ? Number(old[id].char) : digit
        const target = digit < previous ? digit + 10 : digit
        return { id, char, numeric, style: `transform:translateY(${-previous * 5}%);transition:none;`, digits: Array.from({ length: 20 }, (_, i) => i % 10), target, digit }
      })
      this.setData({ characters }, () => {
        this.data._rollTimer = setTimeout(() => {
          this.setData({ characters: characters.map(item => ({ ...item, style: `transform:translateY(${-item.target * 5}%);transition:transform ${this.data.duration + item.id * this.data.staggerDelay}ms cubic-bezier(.2,.8,.2,1);` })) })
        }, 20)
      })
    },
  },
  lifetimes: { detached() { if (this.data._rollTimer) clearTimeout(this.data._rollTimer) } },
})
