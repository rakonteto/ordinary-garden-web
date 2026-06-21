import type { WeatherBundle } from '../weather/types'
import type { CareType } from '../data/types'

export type CareAdvice = 'none' | 'holdForRain' | 'heat'

const RAIN_POP_THRESHOLD = 60      // 오늘 강수확률(%) 임계
const RAIN_PRECIP_MM_THRESHOLD = 5.0  // 향후 24h 누적 강수(mm) 임계
const HEAT_MAX_C_THRESHOLD = 33.0  // 오늘 최고기온(℃) 임계

export function adviceMessage(a: CareAdvice): string | null {
  switch (a) {
    case 'holdForRain': return '비 예보 — 오늘 물주기는 건너뛰어도 돼요'
    case 'heat': return '더운 날 — 물을 평소보다 자주 주세요'
    default: return null
  }
}

/** weatherAware인 물주기에만 의미. 그 외엔 none. */
export function advice(careType: CareType, weatherAware: boolean, bundle: WeatherBundle | null): CareAdvice {
  if (!weatherAware || careType !== 'water' || !bundle) return 'none'
  const todayPop = bundle.daily[0]?.pop ?? 0
  const next24Precip = bundle.hourly.slice(0, 24).reduce((sum, h) => sum + h.precipMm, 0)
  if (todayPop >= RAIN_POP_THRESHOLD || next24Precip >= RAIN_PRECIP_MM_THRESHOLD) return 'holdForRain'
  const maxC = bundle.daily[0]?.maxC
  if (maxC != null && maxC >= HEAT_MAX_C_THRESHOLD) return 'heat'
  return 'none'
}
