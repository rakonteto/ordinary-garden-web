import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import {
  createPlant,
  listPlants,
  listPlantsByArea,
  updatePlant,
  softDeletePlant,
  archivePlant,
} from './plants'

beforeEach(async () => {
  await db.plants.clear()
})

describe('plants 리포지토리', () => {
  it('식물을 생성하고 목록에 노출한다', async () => {
    const p = await createPlant({ areaId: 'a1', name: '바질', lightRequirement: 'high' })
    const list = await listPlants()
    expect(list.map((x) => x.id)).toContain(p.id)
    expect(p.name).toBe('바질')
    expect(p.isArchived).toBe(false)
    expect(p.deleted).toBe(false)
    expect(typeof p.sortOrder).toBe('number')
  })

  it('생성 순서대로 sortOrder가 증가한다', async () => {
    const a = await createPlant({ areaId: 'a1', name: '바질' })
    const b = await createPlant({ areaId: 'a1', name: '민트' })
    expect(b.sortOrder).toBeGreaterThan(a.sortOrder)
  })

  it('영역별로 sortOrder 순서로 조회한다', async () => {
    await createPlant({ areaId: 'a1', name: '바질' })
    await createPlant({ areaId: 'a2', name: '토마토' })
    await createPlant({ areaId: 'a1', name: '민트' })
    const a1 = await listPlantsByArea('a1')
    expect(a1.map((x) => x.name)).toEqual(['바질', '민트'])
  })

  it('updatePlant로 photoId를 설정하고 updatedAt이 갱신된다', async () => {
    const p = await createPlant({ areaId: 'a1', name: '바질' })
    const updated = await updatePlant(p.id, { photoId: 'photo-1' })
    expect(updated.photoId).toBe('photo-1')
    expect(updated.updatedAt).toBeGreaterThanOrEqual(p.updatedAt)
  })

  it('soft delete하면 목록에서 빠지지만 tombstone으로 남는다', async () => {
    const p = await createPlant({ areaId: 'a1', name: '바질' })
    await softDeletePlant(p.id)
    expect((await listPlants()).find((x) => x.id === p.id)).toBeUndefined()
    expect((await db.plants.get(p.id))?.deleted).toBe(true)
  })

  it('archive하면 목록에서 빠지지만 데이터는 보존된다', async () => {
    const p = await createPlant({ areaId: 'a1', name: '바질' })
    await archivePlant(p.id)
    expect((await listPlants()).find((x) => x.id === p.id)).toBeUndefined()
    const raw = await db.plants.get(p.id)
    expect(raw?.isArchived).toBe(true)
    expect(raw?.deleted).toBe(false)
  })
})
