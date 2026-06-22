import { describe, it, expect } from 'vitest'
import { TokenCache } from './auth'

const T = 1_000_000

describe('TokenCache', () => {
  it('만료 전이면 토큰 반환', () => {
    const c = new TokenCache()
    c.set('tok', 3600, T)
    expect(c.get(T + 1000)).toBe('tok')
  })
  it('만료 60초 마진 안쪽이면 null(곧 만료 → 재발급 유도)', () => {
    const c = new TokenCache()
    c.set('tok', 3600, T)
    expect(c.get(T + 3600_000 - 30_000)).toBeNull() // 만료 30초 전
  })
  it('clear 후 null', () => {
    const c = new TokenCache()
    c.set('tok', 3600, T)
    c.clear()
    expect(c.get(T)).toBeNull()
  })
})
