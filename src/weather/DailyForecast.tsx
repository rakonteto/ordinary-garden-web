import type { DailyPoint } from './types'
import { tempString, percentString, weekdayLabel } from './format'
import { WeatherGlyph } from './icons'

export interface Bounds {
  min: number
  max: number
}

// 값 있는 날들로 전체 최저/최고. 없으면 0..1 폴백.
export function computeBounds(daily: DailyPoint[]): Bounds {
  const mins = daily.map((d) => d.minC).filter((v): v is number => v != null)
  const maxs = daily.map((d) => d.maxC).filter((v): v is number => v != null)
  if (mins.length === 0 || maxs.length === 0) return { min: 0, max: 1 }
  return { min: Math.min(...mins), max: Math.max(...maxs) }
}

export function barStyle(day: DailyPoint, b: Bounds): { left: string; width: string } | null {
  if (day.minC == null || day.maxC == null) return null
  const span = b.max - b.min || 1
  const left = ((day.minC - b.min) / span) * 100
  const width = ((day.maxC - day.minC) / span) * 100
  return { left: `${Math.round(left)}%`, width: `${Math.round(width)}%` }
}

export default function DailyForecast({ daily, today }: { daily: DailyPoint[]; today: string }) {
  if (daily.length === 0) return null
  const bounds = computeBounds(daily)
  return (
    <section className="wd-section">
      <h2 className="wd-section__title">주간 예보</h2>
      <div className="daily">
        {daily.map((d) => {
          const style = barStyle(d, bounds)
          return (
            <div className="daily__row" key={d.date}>
              <span className="daily__day">{weekdayLabel(d.date, today)}</span>
              <WeatherGlyph precipType="none" sky={d.sky} size={18} className="daily__icon" />
              <span className={`daily__pop${d.pop ? '' : ' is-zero'}`}>{percentString(d.pop)}</span>
              <span className="daily__min">{d.minC != null ? `${tempString(d.minC)}°` : '—'}</span>
              <span className="daily__bar">
                {style && <span className="daily__bar-fill" style={{ left: style.left, width: style.width }} />}
              </span>
              <span className="daily__max">{d.maxC != null ? `${tempString(d.maxC)}°` : '—'}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
