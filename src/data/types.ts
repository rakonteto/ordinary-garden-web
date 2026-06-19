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

export interface JournalEntry extends BaseRecord {
  plantId: string
  date: number
  note: string
  tags: string[]            // WorkType 세트는 일지 단계(④)에서 enum 확정
  weatherSnapshot?: unknown // 그날 날씨 박제(JSON), 일지 단계에서 타입 확정
}

export interface JournalPhoto extends BaseRecord {
  ownerId: string           // entry id 또는 plant 대표사진
  blob?: Blob
  driveFileId?: string
}

export interface CareRule extends BaseRecord {
  plantId: string
  careType: CareType
  intervalDays: number
  lastCompletedAt?: number
  nextDueAt: number
  weatherAware: boolean
}
