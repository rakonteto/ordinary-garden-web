export interface BaseRecord {
  id: string
  updatedAt: number  // epoch ms
  deleted: boolean   // tombstone
}

export type LightRequirement = 'high' | 'medium' | 'low'
export type CareType = 'water' | 'fertilize' | 'repot'

export interface Area extends BaseRecord {
  name: string
  sortOrder: number
}

export interface Plant extends BaseRecord {
  areaId: string
  name: string
  lightRequirement?: LightRequirement
  photoId?: string
  datePlanted?: number
  note?: string
  isArchived: boolean
  sortOrder: number
}

// 일지에 박제하는 그날 날씨(WeatherBundle 핵심 필드 부분집합). 집 위치 라벨은 프라이버시상 제외.
export interface WeatherSnapshot {
  tempC: number | null
  feelsLikeC: number | null
  humidity: number | null
  sky: string | null       // 'clear'|'partly'|'cloudy'|null
  precipType: string       // 'none'|'rain'|'rainSnow'|'snow'
  airGrade: number | null  // 통합 미세먼지 등급(khai>pm10>pm25)
  capturedAt: number       // epoch ms
}

export interface JournalEntry extends BaseRecord {
  plantId: string
  date: number
  note: string
  tags: string[]                       // WorkType 식별자(다중)
  weatherSnapshot?: WeatherSnapshot
}

export interface JournalPhoto extends BaseRecord {
  ownerId: string          // entry id 또는 plant 대표사진
  blob?: Blob
  driveFileId?: string
  sortOrder?: number       // 일지 다중 사진 표시 순서(대표사진은 생략)
}

export interface CareRule extends BaseRecord {
  plantId: string
  careType: CareType
  intervalDays: number
  lastCompletedAt?: number
  nextDueAt: number
  weatherAware: boolean
  createdAt: number
}
