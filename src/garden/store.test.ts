import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '../data/db'
import { listAreas, createArea } from '../data/areas'
import { listPlants, createPlant, updatePlant } from '../data/plants'
import { putPhoto, getPhoto } from '../data/photos'
import { createGardenStore } from './store'

function makeStore() {
  return createGardenStore({ listAreas, createArea, listPlants, createPlant, updatePlant, putPhoto })
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
})
