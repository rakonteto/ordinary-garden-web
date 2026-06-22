import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../data/db'
import { exportSnapshot, importMergedMeta, EMPTY_SNAPSHOT } from './snapshot'

beforeEach(async () => {
  await Promise.all([db.areas, db.plants, db.journalEntries, db.journalPhotos, db.careRules].map((t) => t.clear()))
})

describe('snapshot', () => {
  it('EMPTY_SNAPSHOT은 빈 5배열 + schemaVersion', () => {
    expect(EMPTY_SNAPSHOT.schemaVersion).toBe(1)
    expect(EMPTY_SNAPSHOT.plants).toEqual([])
    expect(EMPTY_SNAPSHOT.photos).toEqual([])
  })

  it('exportSnapshot은 tombstone 포함 전 레코드를, 사진은 blob 제외로 내보낸다', async () => {
    await db.areas.add({ id: 'a1', updatedAt: 1, deleted: false, name: '뒷마당', sortOrder: 0 })
    await db.areas.add({ id: 'a2', updatedAt: 2, deleted: true, name: '삭제됨', sortOrder: 1 })
    await db.journalPhotos.add({ id: 'p1', updatedAt: 3, deleted: false, ownerId: 'o1', blob: new Blob(['x']), driveFileId: 'D1' })
    const snap = await exportSnapshot()
    expect(snap.areas.map((a) => a.id).sort()).toEqual(['a1', 'a2']) // tombstone 포함
    expect(snap.photos[0]).toMatchObject({ id: 'p1', ownerId: 'o1', driveFileId: 'D1' })
    expect('blob' in snap.photos[0]).toBe(false) // blob 제외
  })

  it('importMergedMeta는 bulkPut로 updatedAt을 보존한다(repo 시계 미경유)', async () => {
    await importMergedMeta({
      areas: [{ id: 'a1', updatedAt: 999, deleted: false, name: '원격', sortOrder: 0 }],
      plants: [], journalEntries: [], careRules: [],
    })
    const got = await db.areas.get('a1')
    expect(got!.updatedAt).toBe(999) // 원격 값 보존
    expect(got!.name).toBe('원격')
  })
})
