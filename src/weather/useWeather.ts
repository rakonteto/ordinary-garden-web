import { useEffect, useSyncExternalStore } from 'react'
import { createWeatherStore, type WeatherState } from './store'
import { createLocalStorageCache } from './cache'
import { fetchWeather } from './service'

export const weatherStore = createWeatherStore({
  fetcher: () => fetchWeather(),
  cache: createLocalStorageCache(),
})

let started = false
function ensureStarted() {
  if (started) return
  started = true
  void weatherStore.refresh()
}

export function useWeather(): WeatherState & { refresh: () => void } {
  const state = useSyncExternalStore(weatherStore.subscribe, weatherStore.getSnapshot)
  useEffect(() => {
    ensureStarted()
  }, [])
  return { ...state, refresh: () => void weatherStore.refresh() }
}
