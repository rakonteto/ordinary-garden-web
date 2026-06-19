import type { WeatherBundle } from './types'
import type { WeatherCache } from './cache'

export interface WeatherState {
  bundle: WeatherBundle | null
  isRefreshing: boolean
  error: string | null
}

export interface WeatherStore {
  getSnapshot(): WeatherState
  subscribe(listener: () => void): () => void
  refresh(): Promise<void>
}

export interface WeatherStoreDeps {
  fetcher: () => Promise<WeatherBundle>
  cache: WeatherCache
}

export function createWeatherStore({ fetcher, cache }: WeatherStoreDeps): WeatherStore {
  let state: WeatherState = { bundle: cache.load(), isRefreshing: false, error: null }
  const listeners = new Set<() => void>()

  function set(next: WeatherState) {
    state = next
    listeners.forEach((l) => l())
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    async refresh() {
      set({ ...state, isRefreshing: true })
      try {
        const bundle = await fetcher()
        cache.save(bundle)
        set({ bundle, isRefreshing: false, error: null })
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        set({ bundle: state.bundle, isRefreshing: false, error: message })
      }
    },
  }
}
