import type { AirQuality } from './types'

export type IconKey = 'sun' | 'cloud-sun' | 'cloud' | 'rain' | 'sleet' | 'snow'

const SKY_LABEL: Record<string, string> = {
  clear: '맑음',
  partly: '구름 조금',
  cloudy: '흐림',
}
export function skyLabel(sky: string | null | undefined): string | null {
  return (sky && SKY_LABEL[sky]) ?? null
}

const PRECIP_LABEL: Record<string, string> = {
  rain: '비',
  rainSnow: '비/눈',
  snow: '눈',
}
export function precipLabel(precip: string | null | undefined): string | null {
  return (precip && PRECIP_LABEL[precip]) ?? null
}

export function weatherIconKey(precip: string | null | undefined, sky: string | null | undefined): IconKey {
  switch (precip) {
    case 'rain':
      return 'rain'
    case 'snow':
      return 'snow'
    case 'rainSnow':
      return 'sleet'
  }
  switch (sky) {
    case 'clear':
      return 'sun'
    case 'partly':
      return 'cloud-sun'
    default:
      return 'cloud'
  }
}

export interface AirGradeInfo {
  label: string
  colorVar: string
}
const AIR_GRADE: Record<number, AirGradeInfo> = {
  1: { label: '좋음', colorVar: 'var(--color-water-blue)' },
  2: { label: '보통', colorVar: 'var(--color-healthy)' },
  3: { label: '나쁨', colorVar: 'var(--color-alert)' },
  4: { label: '매우 나쁨', colorVar: 'var(--color-very-bad)' },
}
export function airGrade(grade: number | null | undefined): AirGradeInfo | null {
  if (grade == null) return null
  return AIR_GRADE[grade] ?? null
}
// khaiGrade(통합) > pm10Grade > pm25Grade
export function airGradeFor(aq: AirQuality): AirGradeInfo | null {
  return airGrade(aq.khaiGrade) ?? airGrade(aq.pm10Grade) ?? airGrade(aq.pm25Grade)
}
