import { describe, it, expect } from 'vitest'
import { createLocalStorageCache } from './cache'
import fixture from './__fixtures__/weather.json'
import type { WeatherBundle } from './types'

function memStorage(): Storage {
  const m = new Map<string, string>()
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => void m.set(k, v),
    removeItem: (k) => void m.delete(k),
    clear: () => m.clear(),
    key: () => null,
    length: 0,
  } as Storage
}

describe('weather cache', () => {
  it('save 후 load 라운드트립', () => {
    const c = createLocalStorageCache('k', memStorage())
    expect(c.load()).toBeNull()
    c.save(fixture as WeatherBundle)
    expect(c.load()?.current.tempC).toBe(24.4)
  })

  it('깨진 JSON이면 null', () => {
    const s = memStorage()
    s.setItem('k', '{not json')
    expect(createLocalStorageCache('k', s).load()).toBeNull()
  })
})
