import { describe, expect, it } from 'vitest'
import { quotes, quoteThemes } from '../data/quotes'

describe('data kutipan', () => {
  it('memiliki minimal 100 kutipan original', () => {
    expect(quotes.length).toBeGreaterThanOrEqual(100)
  })

  it('setiap kutipan memiliki teks dan tema yang valid', () => {
    for (const quote of quotes) {
      expect(quote.text.trim().length).toBeGreaterThan(20)
      expect(quoteThemes).toContain(quote.theme as (typeof quoteThemes)[number])
    }
  })

  it('tidak ada kutipan duplikat', () => {
    const unique = new Set(quotes.map((quote) => quote.text))
    expect(unique.size).toBe(quotes.length)
  })
})
