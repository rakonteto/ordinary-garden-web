import { db } from './db'
import { baseFields } from './record'
import type { JournalPhoto } from './types'

export interface NewPhoto {
  ownerId: string
  blob: Blob
  sortOrder?: number
}

export async function putPhoto({ ownerId, blob, sortOrder }: NewPhoto, now = Date.now()): Promise<JournalPhoto> {
  const photo: JournalPhoto = { ...baseFields(now), ownerId, blob, sortOrder }
  await db.journalPhotos.add(photo)
  return photo
}

export async function getPhoto(id: string): Promise<JournalPhoto | undefined> {
  const p = await db.journalPhotos.get(id)
  return p && !p.deleted ? p : undefined
}

export async function softDeletePhoto(id: string, now = Date.now()): Promise<void> {
  // tombstone으로 남기되 blob은 비워 저장공간을 회수(driveFileId는 동기화 정리용으로 보존).
  const existing = await db.journalPhotos.get(id)
  if (!existing) return
  await db.journalPhotos.put({ ...existing, deleted: true, blob: undefined, updatedAt: now })
}

export async function listPhotosByOwner(ownerId: string): Promise<JournalPhoto[]> {
  const all = await db.journalPhotos.where('ownerId').equals(ownerId).toArray()
  return all
    .filter((p) => !p.deleted && p.blob)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.updatedAt - b.updatedAt)
}
