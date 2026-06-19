import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { vi } from 'vitest'
import { WEATHER_URL } from '../weather/service'
import weatherFixture from '../weather/__fixtures__/weather.json'

vi.stubGlobal(
  'fetch',
  vi.fn(async (url: string) => {
    if (url === WEATHER_URL) {
      return { ok: true, status: 200, json: async () => weatherFixture } as unknown as Response
    }
    return { ok: false, status: 404, json: async () => ({}) } as unknown as Response
  }),
)
