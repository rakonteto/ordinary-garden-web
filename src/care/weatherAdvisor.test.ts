import { describe, it, expect } from 'vitest'
import { advice, adviceMessage } from './weatherAdvisor'
import type { WeatherBundle } from '../weather/types'

// 임계 분리 검증용 bundle 빌더: daily[0].pop·maxC, hourly precipMm 합 제어.
function bundle(opts: { pop?: number; maxC?: number; precipMm?: number }): WeatherBundle {
  const precipPerHour = (opts.precipMm ?? 0) / 24
  return {
    current: { tempC: 20, humidity: 50, precip1h: 0, precipType: 'none', windDeg: 0, windSpeed: 0, sky: 'clear' },
    hourly: Array.from({ length: 24 }, () => ({ time: '', tempC: 20, pop: 0, precipType: 'none', precipMm: precipPerHour, sky: 'clear' })),
    daily: [{ date: '2026-06-21', minC: 18, maxC: opts.maxC ?? 25, pop: opts.pop ?? 0, sky: 'clear' }],
    alerts: [],
    airQuality: { pm10: null, pm10Grade: null, pm25: null, pm25Grade: null, khai: null, khaiGrade: null },
    meta: { generatedAt: '', sources: [], locationLabel: '' },
  }
}

describe('advice', () => {
  it('강수확률 60% 이상 → holdForRain', () => {
    expect(advice('water', true, bundle({ pop: 60 }))).toBe('holdForRain')
    expect(advice('water', true, bundle({ pop: 59 }))).not.toBe('holdForRain')
  })
  it('24h 누적 강수 5mm 이상 → holdForRain', () => {
    expect(advice('water', true, bundle({ precipMm: 5 }))).toBe('holdForRain')
    expect(advice('water', true, bundle({ precipMm: 4.9 }))).not.toBe('holdForRain')
  })
  it('최고 33℃ 이상 → heat(비 임계 미만일 때)', () => {
    expect(advice('water', true, bundle({ maxC: 33 }))).toBe('heat')
    expect(advice('water', true, bundle({ maxC: 32 }))).toBe('none')
  })
  it('비가 우선(폭염보다)', () => {
    expect(advice('water', true, bundle({ pop: 80, maxC: 35 }))).toBe('holdForRain')
  })
  it('물주기 아님·weatherAware false·bundle null → none', () => {
    expect(advice('fertilize', true, bundle({ pop: 90 }))).toBe('none')
    expect(advice('water', false, bundle({ pop: 90 }))).toBe('none')
    expect(advice('water', true, null)).toBe('none')
  })
})

describe('adviceMessage', () => {
  it('메시지', () => {
    expect(adviceMessage('holdForRain')).toBe('비 예보 — 오늘 물주기는 건너뛰어도 돼요')
    expect(adviceMessage('heat')).toBe('더운 날 — 물을 평소보다 자주 주세요')
    expect(adviceMessage('none')).toBeNull()
  })
})
