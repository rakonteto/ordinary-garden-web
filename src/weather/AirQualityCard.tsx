import type { AirQuality } from './types'
import { airGrade } from './enums'

function Col({ title, value, grade }: { title: string; value: number | null; grade: number | null }) {
  const g = airGrade(grade)
  return (
    <div className="aqc__col">
      <span className="aqc__title">{title}</span>
      <span className="aqc__value">{value == null ? '—' : value}</span>
      {g ? (
        <span className="aqc__badge" style={{ background: g.colorVar }}>{g.label}</span>
      ) : (
        <span className="aqc__badge aqc__badge--none">—</span>
      )}
    </div>
  )
}

export default function AirQualityCard({ airQuality }: { airQuality: AirQuality }) {
  return (
    <section className="wd-section">
      <h2 className="wd-section__title">미세먼지</h2>
      <div className="aqc">
        <Col title="PM10" value={airQuality.pm10} grade={airQuality.pm10Grade} />
        <Col title="초미세먼지" value={airQuality.pm25} grade={airQuality.pm25Grade} />
        <Col title="통합지수" value={airQuality.khai} grade={airQuality.khaiGrade} />
      </div>
      <p className="aqc__src">출처 · 에어코리아(한국환경공단)</p>
    </section>
  )
}
