import { describe, it, expect } from 'vitest'
import { skyLabel, precipLabel, weatherIconKey, airGrade, airGradeFor } from './enums'
import type { AirQuality } from './types'

describe('enums', () => {
  it('skyLabel: 한글 라벨, 미상은 null', () => {
    expect(skyLabel('clear')).toBe('맑음')
    expect(skyLabel('partly')).toBe('구름 조금')
    expect(skyLabel('cloudy')).toBe('흐림')
    expect(skyLabel(null)).toBeNull()
    expect(skyLabel('xxx')).toBeNull()
  })

  it('precipLabel: none은 null', () => {
    expect(precipLabel('none')).toBeNull()
    expect(precipLabel('rain')).toBe('비')
    expect(precipLabel('rainSnow')).toBe('비/눈')
    expect(precipLabel('snow')).toBe('눈')
    expect(precipLabel(null)).toBeNull()
  })

  it('weatherIconKey: 강수가 하늘보다 우선', () => {
    expect(weatherIconKey('rain', 'clear')).toBe('rain')
    expect(weatherIconKey('snow', 'clear')).toBe('snow')
    expect(weatherIconKey('rainSnow', 'clear')).toBe('sleet')
    expect(weatherIconKey('none', 'clear')).toBe('sun')
    expect(weatherIconKey('none', 'partly')).toBe('cloud-sun')
    expect(weatherIconKey('none', 'cloudy')).toBe('cloud')
    expect(weatherIconKey('none', null)).toBe('cloud')
  })

  it('airGrade: 1~4 라벨·색 토큰', () => {
    expect(airGrade(1)).toEqual({ label: '좋음', colorVar: 'var(--color-water-blue)' })
    expect(airGrade(2)?.label).toBe('보통')
    expect(airGrade(3)?.label).toBe('나쁨')
    expect(airGrade(4)).toEqual({ label: '매우 나쁨', colorVar: 'var(--color-very-bad)' })
    expect(airGrade(null)).toBeNull()
    expect(airGrade(9)).toBeNull()
  })

  it('airGradeFor: khai > pm10 > pm25 우선', () => {
    const aq: AirQuality = { pm10: 1, pm10Grade: 3, pm25: 1, pm25Grade: 4, khai: 50, khaiGrade: 1 }
    expect(airGradeFor(aq)?.label).toBe('좋음')
    expect(airGradeFor({ ...aq, khaiGrade: null })?.label).toBe('나쁨')
    expect(airGradeFor({ ...aq, khaiGrade: null, pm10Grade: null })?.label).toBe('매우 나쁨')
  })
})
