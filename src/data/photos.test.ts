// @vitest-environment node
// jsdom+fake-indexeddb는 IDB 라운드트립에서 Blob 인스턴스를 보존하지 못한다(node 환경은 보존).
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { putPhoto, getPhoto, softDeletePhoto, listPhotosByOwner } from './photos'

beforeEach(async () => {
  await db.journalPhotos.clear()
})

function blob() {
  return new Blob(['x'], { type: 'image/png' })
}

describe('photos 리포지토리', () => {
  it('사진을 저장하고 id로 다시 읽는다', async () => {
    const saved = await putPhoto({ ownerId: 'plant-1', blob: blob() })
    const got = await getPhoto(saved.id)
    expect(got?.id).toBe(saved.id)
    expect(got?.ownerId).toBe('plant-1')
    expect(got?.blob).toBeInstanceOf(Blob)
    expect(got?.deleted).toBe(false)
  })

  it('soft delete하면 blob을 비우고 getPhoto가 undefined를 준다', async () => {
    const saved = await putPhoto({ ownerId: 'plant-1', blob: blob() })
    await softDeletePhoto(saved.id)
    expect(await getPhoto(saved.id)).toBeUndefined()
    const raw = await db.journalPhotos.get(saved.id)
    expect(raw?.deleted).toBe(true)
    expect(raw?.blob).toBeUndefined()
  })
})

describe('listPhotosByOwner', () => {
  it('ownerId로 모아 sortOrder 순으로, deleted 제외', async () => {
    // 각 putPhoto 호출마다 새로운 Blob 인스턴스를 인라인으로 전달
    // (IndexedDB structured clone에 의존하지 않고 사진마다 독립 blob임을 명확히)
    await putPhoto({ ownerId: 'e1', blob: blob(), sortOrder: 1 })
    await putPhoto({ ownerId: 'e1', blob: blob(), sortOrder: 0 })
    const other = await putPhoto({ ownerId: 'e2', blob: blob(), sortOrder: 0 })
    const list = await listPhotosByOwner('e1')
    expect(list.map((p) => p.sortOrder)).toEqual([0, 1])
    await softDeletePhoto(other.id)
    expect(await listPhotosByOwner('e2')).toEqual([])
  })

  it('blob 없는 레코드(deleted=false, blob=undefined)를 제외', async () => {
    // deleted=false이면서 blob=undefined인 레코드를 직접 넣음
    const recordWithoutBlob: any = {
      id: 'photo-no-blob',
      ownerId: 'e3',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deleted: false,
      blob: undefined,
      sortOrder: 0,
      driveFileId: undefined,
    }
    await db.journalPhotos.put(recordWithoutBlob)

    // 같은 ownerId에 blob이 있는 사진 추가
    const withBlob = await putPhoto({ ownerId: 'e3', blob: blob(), sortOrder: 1 })

    // listPhotosByOwner는 blob 없는 레코드를 제외해야 함
    const list = await listPhotosByOwner('e3')
    expect(list.length).toBe(1)
    expect(list[0].id).toBe(withBlob.id)
  })
})
