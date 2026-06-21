import { describe, it, expect } from 'vitest'
import type { WeatherBundle } from '../weather/types'
import { captureSnapshot, snapshotSummary, snapshotShort } from './weatherSnapshot'

function bundle(over: Partial<WeatherBundle['current']>, air: Partial<WeatherBundle['airQuality']>): WeatherBundle {
  return {
    current: { tempC: 21, humidity: 60, precip1h: 0, precipType: 'none', windDeg: null, windSpeed: null, sky: 'cloudy', feelsLikeC: 20, ...over },
    hourly: [], daily: [], alerts: [],
    airQuality: { pm10: null, pm10Grade: null, pm25: null, pm25Grade: null, khai: null, khaiGrade: null, ...air },
    meta: { generatedAt: '2026-06-20T15:00:00.000Z', sources: [], locationLabel: '우리집' },
  }
}

describe('weatherSnapshot', () => {
  it('captureSnapshot: current+airQuality 핵심 필드, airGrade는 khai>pm10>pm25', () => {
    const s = captureSnapshot(bundle({ tempC: 21, sky: 'cloudy' }, { khaiGrade: 2, pm10Grade: 3 }), 1000)
    expect(s).toEqual({ tempC: 21, feelsLikeC: 20, humidity: 60, sky: 'cloudy', precipType: 'none', airGrade: 2, capturedAt: 1000 })
  })
  it('captureSnapshot: khai 없으면 pm10, 그것도 없으면 pm25', () => {
    expect(captureSnapshot(bundle({}, { pm10Grade: 3 }), 0).airGrade).toBe(3)
    expect(captureSnapshot(bundle({}, { pm25Grade: 1 }), 0).airGrade).toBe(1)
    expect(captureSnapshot(bundle({}, {}), 0).airGrade).toBeNull()
  })
  it('snapshotSummary: 기온 + (강수 우선, 없으면 하늘) + 미세먼지', () => {
    const s = captureSnapshot(bundle({ tempC: 21, sky: 'cloudy', precipType: 'none' }, { khaiGrade: 2 }), 0)
    expect(snapshotSummary(s)).toBe('21° 흐림 · 미세먼지 보통')
  })
  it('snapshotSummary: 강수가 하늘보다 우선', () => {
    const s = captureSnapshot(bundle({ tempC: 18, sky: 'cloudy', precipType: 'rain' }, {}), 0)
    expect(snapshotSummary(s)).toBe('18° 비')
  })
  it('snapshotShort: 미세먼지 제외', () => {
    const s = captureSnapshot(bundle({ tempC: 21, sky: 'clear' }, { khaiGrade: 1 }), 0)
    expect(snapshotShort(s)).toBe('21° 맑음')
  })
})
