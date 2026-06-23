import { db } from './db'
import { putPhoto, softDeletePhoto, listPhotosByOwner, isLivePhoto } from './photos'
import type { JournalPhoto } from './types'

const PREFIX = 'species:'

/** 도감 종 사진의 ownerId 네임스페이스. id는 crypto.randomUUID라 식물·일지 사진과 안 겹친다. */
export function codexOwnerId(speciesId: string): string {
  return PREFIX + speciesId
}

/** 종의 대표사진(단일 커버). 없으면 undefined. */
export async function getSpeciesPhoto(speciesId: string): Promise<JournalPhoto | undefined> {
  const list = await listPhotosByOwner(codexOwnerId(speciesId))
  return list[0]
}

/** 종 대표사진을 설정한다. 기존 커버는 먼저 tombstone(단일 커버 보장). */
export async function setSpeciesPhoto(speciesId: string, blob: Blob, now = Date.now()): Promise<JournalPhoto> {
  const ownerId = codexOwnerId(speciesId)
  const existing = await listPhotosByOwner(ownerId)
  for (const p of existing) await softDeletePhoto(p.id, now)
  return putPhoto({ ownerId, blob }, now)
}

/** 종 대표사진을 제거한다(tombstone). 멱등. */
export async function removeSpeciesPhoto(speciesId: string, now = Date.now()): Promise<void> {
  const existing = await listPhotosByOwner(codexOwnerId(speciesId))
  for (const p of existing) await softDeletePhoto(p.id, now)
}

/** 모든 보유종 커버를 (speciesId, photo)로. 식물·일지 사진은 제외(species: 접두만). */
export async function listSpeciesCovers(): Promise<Array<{ speciesId: string; photo: JournalPhoto }>> {
  const rows = await db.journalPhotos.where('ownerId').startsWith(PREFIX).toArray()
  return rows
    .filter(isLivePhoto)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.updatedAt - b.updatedAt)
    .map((photo) => ({ speciesId: photo.ownerId.slice(PREFIX.length), photo }))
}
