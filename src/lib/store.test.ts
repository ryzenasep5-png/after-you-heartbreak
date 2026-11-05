import { beforeEach, describe, expect, it } from 'vitest'
import { formatClock, readJSON, uid, writeJSON } from './store'

describe('utility store', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('menulis dan membaca JSON dari localStorage', () => {
    const value = { mood: 'Rindu', items: [1, 2, 3] }
    writeJSON('afteryou.test', value)
    expect(readJSON('afteryou.test', null)).toEqual(value)
  })

  it('mengembalikan fallback untuk data rusak', () => {
    window.localStorage.setItem('afteryou.test', 'bukan-json{')
    expect(readJSON('afteryou.test', { aman: true })).toEqual({ aman: true })
  })

  it('uid selalu unik', () => {
    const values = new Set(Array.from({ length: 100 }, () => uid()))
    expect(values.size).toBe(100)
  })

  it('formatClock memformat detik menjadi menit:detik', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(65)).toBe('1:05')
    expect(formatClock(600)).toBe('10:00')
  })
})
