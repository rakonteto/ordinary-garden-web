import type { WeatherAlert } from './types'
import { AlertGlyph } from './icons'

function severityLabel(severity: string): string {
  return severity === 'warning' ? '경보' : '주의보'
}

export default function AlertBanner({ alerts }: { alerts: WeatherAlert[] }) {
  if (alerts.length === 0) return null
  const [first, ...rest] = alerts
  return (
    <div className="alert-banner">
      <AlertGlyph category={first.category} size={22} className="alert-banner__icon" />
      <span className="alert-banner__title">
        {first.title}
        {rest.length > 0 && <span className="alert-banner__more"> 외 {rest.length}건</span>}
      </span>
      <span className="alert-banner__sev">{severityLabel(first.severity)}</span>
    </div>
  )
}
