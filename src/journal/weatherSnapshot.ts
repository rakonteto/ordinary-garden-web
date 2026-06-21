import type { WeatherBundle, AirQuality } from '../weather/types'
import type { WeatherSnapshot } from '../data/types'
import { skyLabel, precipLabel, airGrade } from '../weather/enums'
import { tempString } from '../weather/format'

function pickGrade(aq: AirQuality): number | null {
  return aq.khaiGrade ?? aq.pm10Grade ?? aq.pm25Grade ?? null
}

export function captureSnapshot(bundle: WeatherBundle, capturedAt: number): WeatherSnapshot {
  const c = bundle.current
  return {
    tempC: c.tempC,
    feelsLikeC: c.feelsLikeC ?? null,
    humidity: c.humidity,
    sky: c.sky,
    precipType: c.precipType,
    airGrade: pickGrade(bundle.airQuality),
    capturedAt,
  }
}

function headline(s: WeatherSnapshot): string {
  const parts: string[] = []
  if (s.tempC != null) parts.push(`${tempString(s.tempC)}°`)
  const wx = precipLabel(s.precipType) ?? skyLabel(s.sky) // 강수 우선, 없으면 하늘
  if (wx) parts.push(wx)
  return parts.join(' ') || '—'
}

export function snapshotShort(s: WeatherSnapshot): string {
  return headline(s)
}

export function snapshotSummary(s: WeatherSnapshot): string {
  const g = airGrade(s.airGrade)
  return g ? `${headline(s)} · 미세먼지 ${g.label}` : headline(s)
}
