import { useNavigate } from 'react-router-dom'
import { useWeather } from './useWeather'
import { skyLabel } from './enums'
import { tempString, relativeFreshness, todayKSTDate } from './format'
import { WeatherGlyph } from './icons'
import AlertBanner from './AlertBanner'
import HourlyStrip from './HourlyStrip'
import DailyForecast from './DailyForecast'
import AirQualityCard from './AirQualityCard'
import './WeatherDetail.css'

export default function WeatherDetail() {
  const navigate = useNavigate()
  const { bundle, isRefreshing, refresh } = useWeather()

  const today = bundle?.daily[0]
  const sky = skyLabel(bundle?.current.sky)

  return (
    <div className="wd">
      <header className="wd__bar">
        <button className="wd__back" onClick={() => navigate('/today')} aria-label="뒤로">←</button>
        <span className="wd__bar-title">날씨</span>
        <button className="wd__refresh" onClick={refresh} aria-label="새로고침" disabled={isRefreshing}>
          {isRefreshing ? '…' : '↻'}
        </button>
      </header>

      {!bundle ? (
        <p className="wd__empty">날씨 불러오는 중…</p>
      ) : (
        <div className="wd__body">
          <section className="glass wd-hero">
            <WeatherGlyph precipType={bundle.current.precipType} sky={bundle.current.sky} size={54} className="wd-hero__glyph" />
            <div className="wd-hero__temp">{tempString(bundle.current.tempC)}°</div>
            {sky && <div className="wd-hero__sky">{sky}</div>}
            <div className="wd-hero__range">
              {bundle.current.feelsLikeC != null && <span>체감 {tempString(bundle.current.feelsLikeC)}°</span>}
              {today?.maxC != null && <span className="wd-hero__hi">최고 {tempString(today.maxC)}°</span>}
              {today?.minC != null && <span className="wd-hero__lo">최저 {tempString(today.minC)}°</span>}
            </div>
            <div className="wd-hero__fresh">{relativeFreshness(bundle.meta.generatedAt, Date.now())} · 기상청</div>
          </section>

          <AlertBanner alerts={bundle.alerts} />
          <HourlyStrip hourly={bundle.hourly} />
          <DailyForecast daily={bundle.daily} today={todayKSTDate(Date.now())} />
          <AirQualityCard airQuality={bundle.airQuality} />
        </div>
      )}
    </div>
  )
}
