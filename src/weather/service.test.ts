import { describe, it, expect, vi } from 'vitest'
import { fetchWeather, WEATHER_URL } from './service'
import fixture from './__fixtures__/weather.json'

function fakeFetch(ok: boolean, body: unknown) {
  return vi.fn(async () => ({ ok, status: ok ? 200 : 500, json: async () => body }) as unknown as Response)
}

describe('fetchWeather', () => {
  it('JSON을 WeatherBundle로 디코딩한다', async () => {
    const f = fakeFetch(true, fixture)
    const b = await fetchWeather(WEATHER_URL, f)
    expect(f).toHaveBeenCalledWith(WEATHER_URL)
    expect(b.current.tempC).toBe(24.4)
    expect(b.hourly).toHaveLength(3)
    expect(b.daily[0].minC).toBeNull()
    expect(b.airQuality.khaiGrade).toBe(1)
    expect(b.meta.generatedAt).toBe('2026-06-18T23:27:59.958Z')
  })

  it('응답이 ok가 아니면 throw', async () => {
    await expect(fetchWeather(WEATHER_URL, fakeFetch(false, {}))).rejects.toThrow()
  })
})
