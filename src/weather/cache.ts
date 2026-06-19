import type { WeatherBundle } from './types'

export interface WeatherCache {
  load(): WeatherBundle | null
  save(bundle: WeatherBundle): void
}

const DEFAULT_KEY = 'og.weather.v1'

export function createLocalStorageCache(
  key: string = DEFAULT_KEY,
  storage: Storage | undefined = typeof localStorage !== 'undefined' ? localStorage : undefined,
): WeatherCache {
  return {
    load() {
      if (!storage) return null
      const raw = storage.getItem(key)
      if (!raw) return null
      try {
        return JSON.parse(raw) as WeatherBundle
      } catch {
        return null
      }
    },
    save(bundle) {
      if (!storage) return
      try {
        storage.setItem(key, JSON.stringify(bundle))
      } catch {
        // 용량 초과 등은 무시(캐시는 최선 노력)
      }
    },
  }
}
