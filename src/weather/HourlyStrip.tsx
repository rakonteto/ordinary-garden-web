import type { HourlyPoint } from './types'
import { hourLabel, tempString, percentString } from './format'
import { WeatherGlyph } from './icons'

const MAX = 24

export default function HourlyStrip({ hourly }: { hourly: HourlyPoint[] }) {
  if (hourly.length === 0) return null
  return (
    <section className="wd-section">
      <h2 className="wd-section__title">시간별 예보</h2>
      <div className="hourly">
        {hourly.slice(0, MAX).map((h) => (
          <div className="hourly__col" key={h.time}>
            <span className="hourly__hour">{hourLabel(h.time)}</span>
            <WeatherGlyph precipType={h.precipType} sky={h.sky} size={20} className="hourly__icon" />
            <span className="hourly__temp">{tempString(h.tempC)}°</span>
            <span className={`hourly__pop${h.pop ? '' : ' is-zero'}`}>{percentString(h.pop)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
