import { db } from '../data/db'
import type { Area, Plant, JournalEntry, JournalPhoto, CareRule } from '../data/types'

export type PhotoMeta = Omit<JournalPhoto, 'blob'>

export interface GardenSnapshot {
  schemaVersion: number
  areas: Area[]
  plants: Plant[]
  journalEntries: JournalEntry[]
  careRules: CareRule[]
  photos: PhotoMeta[]
}

export const EMPTY_SNAPSHOT: GardenSnapshot = {
  schemaVersion: 1, areas: [], plants: [], journalEntries: [], careRules: [], photos: [],
}

/** Dexie 전 레코드(tombstone 포함)를 직렬화. 사진은 blob 제외(별도 파일로 동기화). */
export async function exportSnapshot(): Promise<GardenSnapshot> {
  const [areas, plants, journalEntries, careRules, photoRows] = await Promise.all([
    db.areas.toArray(), db.plants.toArray(), db.journalEntries.toArray(),
    db.careRules.toArray(), db.journalPhotos.toArray(),
  ])
  const photos: PhotoMeta[] = photoRows.map(({ blob: _blob, ...meta }) => meta)
  return { schemaVersion: 1, areas, plants, journalEntries, careRules, photos }
}

/** 머지된 메타 4테이블을 bulkPut로 직접 반영(원격 updatedAt 보존 — repo 시계 미경유). */
export async function importMergedMeta(merged: {
  areas: Area[]; plants: Plant[]; journalEntries: JournalEntry[]; careRules: CareRule[]
}): Promise<void> {
  await Promise.all([
    db.areas.bulkPut(merged.areas),
    db.plants.bulkPut(merged.plants),
    db.journalEntries.bulkPut(merged.journalEntries),
    db.careRules.bulkPut(merged.careRules),
  ])
}
