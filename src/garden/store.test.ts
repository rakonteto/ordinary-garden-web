import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../data/db'
import { listAreas, createArea } from '../data/areas'
import { listPlants, createPlant, updatePlant, archivePlant, softDeletePlant } from '../data/plants'
import { putPhoto, getPhoto } from '../data/photos'
import { createGardenStore } from './store'
import type { GardenRepo } from './store'

function makeStore() {
  return createGardenStore({
    listAreas,
    createArea,
    listPlants,
    createPlant,
    updatePlant,
    putPhoto,
    archivePlant,
    softDeletePlant,
  })
}

/** fake repo: 인메모리로 동작하는 테스트용 저장소 */
function makeFakeRepo(): GardenRepo {
  type FakePlant = import('../data/types').Plant & { _softDeleted?: boolean }
  const areas: import('../data/types').Area[] = [
    { id: 'a1', name: '베란다', sortOrder: 0, updatedAt: 0, deleted: false },
  ]
  const plants: FakePlant[] = []
  const photos: { id: string; ownerId: string; blob: Blob }[] = []
  let photoSeq = 0
  let plantSeq = 0

  return {
    listAreas: async () => [...areas],
    createArea: async (name, sortOrder) => {
      const area: import('../data/types').Area = {
        id: `a${areas.length + 2}`,
        name,
        sortOrder,
        updatedAt: 0,
        deleted: false,
      }
      areas.push(area)
      return area
    },
    listPlants: async () =>
      plants.filter((p) => !p._softDeleted && !p.isArchived) as import('../data/types').Plant[],
    createPlant: async (fields) => {
      const p: FakePlant = {
        id: `p${++plantSeq}`,
        updatedAt: 0,
        deleted: false,
        sortOrder: plants.length,
        isArchived: false,
        areaId: fields.areaId,
        name: fields.name,
        lightRequirement: fields.lightRequirement,
        photoId: fields.photoId,
        datePlanted: fields.datePlanted,
        note: fields.note,
      }
      plants.push(p)
      return p as import('../data/types').Plant
    },
    updatePlant: async (id, patch) => {
      const idx = plants.findIndex((p) => p.id === id)
      if (idx < 0) throw new Error(`plant not found: ${id}`)
      Object.assign(plants[idx], patch)
      return plants[idx] as import('../data/types').Plant
    },
    putPhoto: async ({ ownerId, blob }) => {
      const id = `ph${++photoSeq}`
      photos.push({ id, ownerId, blob })
      return { id }
    },
    archivePlant: async (id) => {
      const p = plants.find((x) => x.id === id)
      if (p) p.isArchived = true
    },
    softDeletePlant: async (id) => {
      const p = plants.find((x) => x.id === id)
      if (p) p._softDeleted = true
    },
  }
}

beforeEach(async () => {
  await db.areas.clear()
  await db.plants.clear()
  await db.journalPhotos.clear()
})

describe('gardenStore', () => {
  it('load 전 스냅샷은 loaded=false, 빈 배열', () => {
    const store = makeStore()
    expect(store.getSnapshot()).toEqual({ areas: [], plants: [], loaded: false })
  })

  it('getSnapshot은 변화 없으면 동일 참조, 변경 시 새 참조를 준다', async () => {
    const store = makeStore()
    const initial = store.getSnapshot()
    expect(store.getSnapshot()).toBe(initial) // 호출마다 새로 할당하지 않음(useSyncExternalStore 계약)
    await store.load()
    const afterLoad = store.getSnapshot()
    expect(afterLoad).not.toBe(initial)
    expect(store.getSnapshot()).toBe(afterLoad)
  })

  it('load하면 areas·plants를 채우고 구독자에 통지한다', async () => {
    const store = makeStore()
    let notified = 0
    store.subscribe(() => { notified += 1 })
    await store.load()
    expect(store.getSnapshot().loaded).toBe(true)
    expect(notified).toBeGreaterThan(0)
  })

  it('addArea 후 스냅샷에 영역이 보이고 참조가 바뀐다', async () => {
    const store = makeStore()
    await store.load()
    const before = store.getSnapshot()
    await store.addArea('베란다')
    const after = store.getSnapshot()
    expect(after).not.toBe(before)
    expect(after.areas.map((a) => a.name)).toContain('베란다')
  })

  it('addPlant 후 스냅샷에 식물이 보인다', async () => {
    const store = makeStore()
    await store.load()
    const area = await store.addArea('베란다')
    await store.addPlant({ areaId: area.id, name: '바질', lightRequirement: 'high' })
    expect(store.getSnapshot().plants.map((p) => p.name)).toContain('바질')
  })

  it('photo가 있으면 사진을 저장하고 식물 photoId를 연결한다', async () => {
    const store = makeStore()
    await store.load()
    const area = await store.addArea('베란다')
    await store.addPlant({
      areaId: area.id,
      name: '바질',
      photo: new Blob(['x'], { type: 'image/png' }),
    })
    const plant = store.getSnapshot().plants.find((p) => p.name === '바질')!
    expect(plant.photoId).toBeTruthy()
    const photo = await getPhoto(plant.photoId!)
    expect(photo?.ownerId).toBe(plant.id)
  })

  it('editPlant: 필드 갱신 후 reload로 목록 반영', async () => {
    const repo = makeFakeRepo()
    const store = createGardenStore(repo)
    await store.load()
    const p = await store.addPlant({ areaId: 'a1', name: '바질' })
    await store.editPlant(p.id, { name: '타임', areaId: 'a1' })
    expect(store.getSnapshot().plants.find((x) => x.id === p.id)?.name).toBe('타임')
  })

  it('deletePlant: 목록서 사라진다', async () => {
    const repo = makeFakeRepo()
    const store = createGardenStore(repo)
    await store.load()
    const p = await store.addPlant({ areaId: 'a1', name: '바질' })
    await store.deletePlant(p.id)
    expect(store.getSnapshot().plants.find((x) => x.id === p.id)).toBeUndefined()
  })
})
