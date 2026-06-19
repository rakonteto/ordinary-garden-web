import { db } from './db'
import { baseFields } from './record'
import type { JournalPhoto } from './types'

export interface NewPhoto {
  ownerId: string
  blob: Blob
}

export async function putPhoto({ ownerId, blob }: NewPhoto): Promise<JournalPhoto> {
  const photo: JournalPhoto = { ...baseFields(Date.now()), ownerId, blob }
  await db.journalPhotos.add(photo)
  return photo
}

export async function getPhoto(id: string): Promise<JournalPhoto | undefined> {
  const p = await db.journalPhotos.get(id)
  return p && !p.deleted ? p : undefined
}

export async function softDeletePhoto(id: string): Promise<void> {
  // tombstone으로 남기되 blob은 비워 저장공간을 회수(driveFileId는 동기화 정리용으로 보존).
  const existing = await db.journalPhotos.get(id)
  if (!existing) return
  await db.journalPhotos.put({ ...existing, deleted: true, blob: undefined, updatedAt: Date.now() })
}
