// @vitest-environment node
// jsdom+fake-indexeddb는 IDB 라운드트립에서 Blob을 보존하지 못한다(node 보존). photos.test.ts 선례.
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import {
  codexOwnerId, getSpeciesPhoto, setSpeciesPhoto, removeSpeciesPhoto, listSpeciesCovers,
} from './codexPhotos'
import { putPhoto } from './photos'

beforeEach(async () => {
  await db.journalPhotos.clear()
})

function blob() {
  return new Blob(['x'], { type: 'image/png' })
}

describe('codexPhotos', () => {
  it('ownerId에 species: 접두를 붙인다', () => {
    expect(codexOwnerId('hydrangea-macrophylla')).toBe('species:hydrangea-macrophylla')
  })

  it('setSpeciesPhoto로 저장하고 getSpeciesPhoto로 읽는다', async () => {
    await setSpeciesPhoto('rose-main', blob())
    const got = await getSpeciesPhoto('rose-main')
    expect(got?.ownerId).toBe('species:rose-main')
    expect(got?.blob).toBeInstanceOf(Blob)
  })

  it('교체 시 단일 커버 유지 — 이전은 tombstone, live는 새 1장', async () => {
    const first = await setSpeciesPhoto('rose-main', blob())
    const second = await setSpeciesPhoto('rose-main', blob())
    expect(second.id).not.toBe(first.id)
    expect((await getSpeciesPhoto('rose-main'))?.id).toBe(second.id)
    const firstRaw = await db.journalPhotos.get(first.id)
    expect(firstRaw?.deleted).toBe(true)
    expect(firstRaw?.blob).toBeUndefined()
  })

  it('removeSpeciesPhoto는 tombstone 처리하고 멱등하다', async () => {
    await setSpeciesPhoto('rose-main', blob())
    await removeSpeciesPhoto('rose-main')
    expect(await getSpeciesPhoto('rose-main')).toBeUndefined()
    await removeSpeciesPhoto('rose-main') // 멱등 — 던지지 않음
    expect(await getSpeciesPhoto('rose-main')).toBeUndefined()
  })

  it('listSpeciesCovers는 species: 사진만 speciesId로 돌려준다(식물·일지 사진 제외)', async () => {
    await setSpeciesPhoto('rose-main', blob())
    await putPhoto({ ownerId: crypto.randomUUID(), blob: blob() }) // 식물 사진 — 제외돼야 함
    const covers = await listSpeciesCovers()
    expect(covers).toHaveLength(1)
    expect(covers[0].speciesId).toBe('rose-main')
    expect(covers[0].photo.ownerId).toBe('species:rose-main')
  })
})
