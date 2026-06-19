import { useNavigate } from 'react-router-dom'
import { useWeather } from './useWeather'
import { skyLabel, precipLabel, airGradeFor } from './enums'
import { tempString, percentString, mmString, windString, relativeFreshness } from './format'
import { WeatherGlyph, HumidityIcon, UmbrellaIcon, WindIcon, AqiIcon } from './icons'
import './WeatherSummaryCard.css'

export default function WeatherSummaryCard() {
  const navigate = useNavigate()
  const { bundle } = useWeather()

  if (!bundle) {
    return <div className="glass wsc wsc--empty">날씨 불러오는 중…</div>
  }

  const { current, meta, airQuality } = bundle
  const sky = skyLabel(current.sky)
  const precip = precipLabel(current.precipType)
  const grade = airGradeFor(airQuality)
  const fresh = relativeFreshness(meta.generatedAt, Date.now())

  return (
    <button className="glass wsc" onClick={() => navigate('/weather')} aria-label="날씨 상세 보기">
      <div className="wsc__head">
        <span className="wsc__loc">{meta.locationLabel}</span>
        <WeatherGlyph precipType={current.precipType} sky={current.sky} size={44} className="wsc__glyph" />
      </div>
      <div className="wsc__temp">{tempString(current.tempC)}°</div>
      <div className="wsc__cond">{[sky, precip].filter(Boolean).join(' · ') || '—'}</div>

      <div className="wsc__metrics">
        <span className="wsc__metric"><HumidityIcon size={15} />{percentString(current.humidity)}</span>
        <span className="wsc__metric"><UmbrellaIcon size={15} />{mmString(current.precip1h)}</span>
        <span className="wsc__metric"><WindIcon size={15} />{windString(current.windSpeed)}</span>
        {grade && (
          <span className="wsc__metric" style={{ color: grade.colorVar }}>
            <AqiIcon size={15} />미세 {grade.label}
          </span>
        )}
      </div>

      <div className="wsc__fresh">{fresh} · 기상청</div>
    </button>
  )
}
