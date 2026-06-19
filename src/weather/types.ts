// weather.json 와이어 계약(SwiftUI WeatherBundle 1:1). 수치는 대부분 null 가능.
export interface CurrentWeather {
  tempC: number | null
  humidity: number | null
  precip1h: number
  precipType: string
  windDeg: number | null
  windSpeed: number | null
  sky: string | null
  feelsLikeC?: number | null // 발행기 후속(현재 없음)
}

export interface HourlyPoint {
  time: string // ISO8601 +09:00
  tempC: number | null
  pop: number | null
  precipType: string
  precipMm: number
  sky: string | null
}

export interface DailyPoint {
  date: string // "YYYY-MM-DD"
  minC: number | null
  maxC: number | null
  pop: number | null
  sky: string | null
}

export interface AirQuality {
  pm10: number | null
  pm10Grade: number | null
  pm25: number | null
  pm25Grade: number | null
  khai: number | null
  khaiGrade: number | null
}

export interface WeatherMeta {
  generatedAt: string // UTC ISO "Z"(밀리초)
  sources: string[]
  locationLabel: string
}

export interface WeatherAlert {
  category: string // frost|cold|heat|rain|snow|wind
  severity: string // watch(주의보)|warning(경보)
  title: string
}

export interface WeatherBundle {
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[]
  alerts: WeatherAlert[]
  airQuality: AirQuality
  meta: WeatherMeta
}
