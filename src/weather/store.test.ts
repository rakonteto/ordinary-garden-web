import { describe, it, expect, vi } from 'vitest'
import { createWeatherStore } from './store'
import type { WeatherCache } from './cache'
import type { WeatherBundle } from './types'
import fixture from './__fixtures__/weather.json'

const bundle = fixture as WeatherBundle

function memCache(initial: WeatherBundle | null = null): WeatherCache {
  let v = initial
  return { load: () => v, save: (b) => void (v = b) }
}

describe('weather store', () => {
  it('초기 상태는 캐시에서 복원', () => {
    const s = createWeatherStore({ fetcher: vi.fn(), cache: memCache(bundle) })
    expect(s.getSnapshot().bundle?.current.tempC).toBe(24.4)
    expect(s.getSnapshot().isRefreshing).toBe(false)
  })

  it('refresh 성공: bundle 갱신 + 캐시 저장 + 구독 통지', async () => {
    const cache = memCache(null)
    const saveSpy = vi.spyOn(cache, 'save')
    const s = createWeatherStore({ fetcher: vi.fn(async () => bundle), cache })
    const listener = vi.fn()
    s.subscribe(listener)
    await s.refresh()
    expect(s.getSnapshot().bundle?.current.tempC).toBe(24.4)
    expect(s.getSnapshot().error).toBeNull()
    expect(saveSpy).toHaveBeenCalledWith(bundle)
    expect(listener).toHaveBeenCalled()
  })

  it('refresh 실패: 기존 bundle 유지 + error 설정', async () => {
    const s = createWeatherStore({
      fetcher: vi.fn(async () => {
        throw new Error('네트워크')
      }),
      cache: memCache(bundle),
    })
    await s.refresh()
    expect(s.getSnapshot().bundle?.current.tempC).toBe(24.4) // 유지
    expect(s.getSnapshot().error).toContain('네트워크')
    expect(s.getSnapshot().isRefreshing).toBe(false)
  })

  it('getSnapshot은 변화 없으면 동일 참조', async () => {
    const s = createWeatherStore({ fetcher: vi.fn(async () => bundle), cache: memCache(null) })
    const a = s.getSnapshot()
    expect(s.getSnapshot()).toBe(a)
    await s.refresh()
    expect(s.getSnapshot()).not.toBe(a)
  })
})
