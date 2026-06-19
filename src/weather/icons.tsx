import { weatherIconKey, type IconKey } from './enums'

interface GlyphProps {
  size?: number
  className?: string
}

function Svg({ size = 24, className, dataIcon, children }: GlyphProps & { dataIcon?: string; children: React.ReactNode }) {
  return (
    <svg
      data-icon={dataIcon}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const PATHS: Record<IconKey, React.ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  'cloud-sun': (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 2.5v1.5M3.2 8H4.7M3.6 3.6l1 1M11.5 6l1-1" />
      <path d="M17.5 12.5a3.5 3.5 0 0 0-6.9.7A3 3 0 0 0 11 19h7a3 3 0 0 0 .3-6 3.5 3.5 0 0 0-.8-.5z" fill="currentColor" stroke="none" opacity="0.85" />
    </>
  ),
  cloud: (
    <path d="M7 18a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.7-1A3.5 3.5 0 0 1 17 18z" fill="currentColor" stroke="none" opacity="0.85" />
  ),
  rain: (
    <>
      <path d="M7 14a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.7-1A3.5 3.5 0 0 1 17 14z" fill="currentColor" stroke="none" opacity="0.85" />
      <path d="M8 17l-1 2.5M12 17l-1 2.5M16 17l-1 2.5" />
    </>
  ),
  sleet: (
    <>
      <path d="M7 14a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.7-1A3.5 3.5 0 0 1 17 14z" fill="currentColor" stroke="none" opacity="0.85" />
      <path d="M8 17l-1 2.5M16 17l-1 2.5" />
      <circle cx="12" cy="19" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  snow: (
    <>
      <path d="M7 14a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.7-1A3.5 3.5 0 0 1 17 14z" fill="currentColor" stroke="none" opacity="0.85" />
      <path d="M8 18.5h.01M12 19.5h.01M16 18.5h.01" />
    </>
  ),
}

export function WeatherGlyph({
  precipType,
  sky,
  size,
  className,
}: GlyphProps & { precipType: string | null | undefined; sky: string | null | undefined }) {
  const key = weatherIconKey(precipType, sky)
  return (
    <Svg size={size} className={className} dataIcon={key}>
      {PATHS[key]}
    </Svg>
  )
}

export function HumidityIcon({ size, className }: GlyphProps) {
  return (
    <Svg size={size} className={className} dataIcon="humidity">
      <path d="M12 3s5 5.5 5 9a5 5 0 0 1-10 0c0-3.5 5-9 5-9z" />
    </Svg>
  )
}

export function UmbrellaIcon({ size, className }: GlyphProps) {
  return (
    <Svg size={size} className={className} dataIcon="umbrella">
      <path d="M12 3a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8zM12 11v8a2 2 0 0 0 4 0" />
    </Svg>
  )
}

export function WindIcon({ size, className }: GlyphProps) {
  return (
    <Svg size={size} className={className} dataIcon="wind">
      <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 16h13a2.5 2.5 0 1 1-2.5 2.5M3 12h7a2 2 0 1 0-2-2" />
    </Svg>
  )
}

export function AqiIcon({ size, className }: GlyphProps) {
  return (
    <Svg size={size} className={className} dataIcon="aqi">
      <circle cx="7" cy="9" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="13" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="11" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  )
}

const ALERT_PATHS: Record<string, React.ReactNode> = {
  frost: <path d="M12 3v18M5 7l14 10M19 7L5 17" />,
  cold: <path d="M12 3v18M5 7l14 10M19 7L5 17" />,
  heat: (
    <>
      <circle cx="12" cy="14" r="3.2" />
      <path d="M12 3v3M5 9l1.5 1M19 9l-1.5 1" />
    </>
  ),
  rain: (
    <>
      <path d="M7 12a4 4 0 0 1-.6-7.95 5 5 0 0 1 9.7-1A3.5 3.5 0 0 1 17 12z" fill="currentColor" stroke="none" />
      <path d="M8 15l-1 2.5M12 15l-1 2.5M16 15l-1 2.5" />
    </>
  ),
  snow: <path d="M12 4v16M5 8l14 8M19 8L5 16" />,
  wind: <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5M3 16h13a2.5 2.5 0 1 1-2.5 2.5" />,
}
export function AlertGlyph({ category, size, className }: GlyphProps & { category: string }) {
  const path = ALERT_PATHS[category] ?? <path d="M12 4l9 16H3zM12 10v4M12 17h.01" />
  return (
    <Svg size={size} className={className} dataIcon={`alert-${category}`}>
      {path}
    </Svg>
  )
}
