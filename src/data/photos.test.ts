// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { putPhoto, getPhoto, softDeletePhoto } from './photos'

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
