import { describe, it, expect } from 'vitest'
import { createCodexPhotoStore, type CodexPhotoRepo } from './photoStore'
import type { JournalPhoto } from '../data/types'

/** 인메모리 fake repo(speciesId → photo). IDB·blob 라운드트립 회피(gardenStore 테스트 패턴). */
function fakeRepo(): CodexPhotoRepo {
  const rows = new Map<string, JournalPhoto>()
  let seq = 0
  return {
    listSpeciesCovers: async () =>
      [...rows.entries()].map(([speciesId, photo]) => ({ speciesId, photo })),
    setSpeciesPhoto: async (speciesId, blob) => {
      rows.set(speciesId, {
        id: `ph${++seq}`, ownerId: `species:${speciesId}`, blob, updatedAt: 0, deleted: false,
      })
    },
    removeSpeciesPhoto: async (speciesId) => {
      rows.delete(speciesId)
    },
  }
}

describe('codexPhotoStore', () => {
  it('load 전엔 loaded=false, 빈 맵', () => {
    const store = createCodexPhotoStore(fakeRepo())
    expect(store.getSnapshot().loaded).toBe(false)
    expect(store.getSnapshot().byId.size).toBe(0)
  })

  it('getSnapshot은 변화 없으면 동일 참조, load 후 새 참조', async () => {
    const store = createCodexPhotoStore(fakeRepo())
    const initial = store.getSnapshot()
    expect(store.getSnapshot()).toBe(initial)
    await store.load()
    expect(store.getSnapshot()).not.toBe(initial)
  })

  it('setSpeciesPhoto 후 byId에 종이 보이고 구독자에 통지', async () => {
    const store = createCodexPhotoStore(fakeRepo())
    let notified = 0
    store.subscribe(() => { notified += 1 })
    await store.setSpeciesPhoto('rose-main', new Blob(['x']))
    expect(store.getSnapshot().byId.has('rose-main')).toBe(true)
    expect(notified).toBeGreaterThan(0)
  })

  it('removeSpeciesPhoto 후 byId에서 사라진다', async () => {
    const store = createCodexPhotoStore(fakeRepo())
    await store.setSpeciesPhoto('rose-main', new Blob(['x']))
    await store.removeSpeciesPhoto('rose-main')
    expect(store.getSnapshot().byId.has('rose-main')).toBe(false)
  })
})
