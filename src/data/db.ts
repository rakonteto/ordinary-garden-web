import Dexie, { type Table } from 'dexie'
import type { Area, Plant, JournalEntry, JournalPhoto, CareRule } from './types'

export class GardenDB extends Dexie {
  areas!: Table<Area, string>
  plants!: Table<Plant, string>
  journalEntries!: Table<JournalEntry, string>
  journalPhotos!: Table<JournalPhoto, string>
  careRules!: Table<CareRule, string>

  constructor() {
    super('ordinary-garden')
    // 인덱스 = id(PK) + 조회/동기화에 쓰는 필드.
    // IndexedDB는 boolean을 키로 못 쓰므로 isArchived·deleted는 인덱스 제외(메모리 필터).
    this.version(1).stores({
      areas: 'id, sortOrder, updatedAt',
      plants: 'id, areaId, sortOrder, updatedAt',
      journalEntries: 'id, plantId, date, updatedAt',
      journalPhotos: 'id, ownerId, updatedAt',
      careRules: 'id, plantId, nextDueAt, updatedAt',
    })
  }
}

export const db = new GardenDB()
