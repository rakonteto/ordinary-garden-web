import type { WeatherBundle } from './types'

export const WEATHER_URL = 'https://rakonteto.github.io/ordinary-garden-data/weather.json'

export type FetchLike = (url: string) => Promise<Response>

export async function fetchWeather(
  url: string = WEATHER_URL,
  fetchImpl: FetchLike = fetch,
): Promise<WeatherBundle> {
  const res = await fetchImpl(url)
  if (!res.ok) throw new Error(`weather fetch failed: ${res.status}`)
  return (await res.json()) as WeatherBundle
}
