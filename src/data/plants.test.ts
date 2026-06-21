import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import {
  createPlant,
  listPlants,
  listPlantsByArea,
  updatePlant,
  softDeletePlant,
  archivePlant,
  softDeletePlantDeep,
} from './plants'
import { createEntry, listEntriesByPlant } from './journal'
import { putPhoto, listPhotosByOwner } from './photos'
import { createRule, listActiveRules } from './care'

beforeEach(async () => {
  await db.plants.clear()
  await db.journalEntries.clear()
  await db.journalPhotos.clear()
  await db.careRules.clear()
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

describe('softDeletePlantDeep — cascade 삭제', () => {
  it('식물·일지 2개·일지 사진·대표사진을 모두 soft-delete한다', async () => {
    // 준비: 식물 + 대표사진
    const plant = await createPlant({ areaId: 'a1', name: '바질' })
    const coverPhoto = await putPhoto({ ownerId: plant.id, blob: new Blob(['cover']) })
    // 식물에 대표사진 연결(updatePlant 직접 호출 - 순환 의존 없이)
    await db.plants.put({ ...plant, photoId: coverPhoto.id, updatedAt: Date.now() })

    // 일지 1: 사진 2장
    const e1 = await createEntry({ plantId: plant.id, date: 100, note: '첫째날', tags: [] })
    const ph1a = await putPhoto({ ownerId: e1.id, blob: new Blob(['p1a']) })
    const ph1b = await putPhoto({ ownerId: e1.id, blob: new Blob(['p1b']) })

    // 일지 2: 사진 없음
    const e2 = await createEntry({ plantId: plant.id, date: 200, note: '둘째날', tags: [] })

    // Act
    await softDeletePlantDeep(plant.id)

    // 식물 tombstone 확인
    expect((await db.plants.get(plant.id))?.deleted).toBe(true)

    // 일지 전부 tombstone
    expect(await listEntriesByPlant(plant.id)).toEqual([])
    expect((await db.journalEntries.get(e1.id))?.deleted).toBe(true)
    expect((await db.journalEntries.get(e2.id))?.deleted).toBe(true)

    // 일지 사진 전부 tombstone(listPhotosByOwner는 삭제된 것 제외)
    expect(await listPhotosByOwner(e1.id)).toEqual([])
    expect((await db.journalPhotos.get(ph1a.id))?.deleted).toBe(true)
    expect((await db.journalPhotos.get(ph1b.id))?.deleted).toBe(true)

    // 대표사진 tombstone
    expect((await db.journalPhotos.get(coverPhoto.id))?.deleted).toBe(true)
  })

  it('일지·사진이 없는 식물도 오류 없이 삭제된다', async () => {
    const plant = await createPlant({ areaId: 'a1', name: '빈화분' })
    await softDeletePlantDeep(plant.id)
    expect((await db.plants.get(plant.id))?.deleted).toBe(true)
  })

  it('멱등: 이미 삭제된 식물 재호출도 오류 없다', async () => {
    const plant = await createPlant({ areaId: 'a1', name: '민트' })
    await softDeletePlantDeep(plant.id)
    await expect(softDeletePlantDeep(plant.id)).resolves.not.toThrow()
  })

  it('softDeletePlantDeep는 식물의 케어 규칙도 cascade soft-delete', async () => {
    const plant = await createPlant({ areaId: 'a1', name: '바질이' })
    await createRule({ plantId: plant.id, careType: 'water', intervalDays: 3, weatherAware: true })
    await createRule({ plantId: plant.id, careType: 'fertilize', intervalDays: 14, weatherAware: false })
    await softDeletePlantDeep(plant.id)
    const rules = await listActiveRules()
    expect(rules.filter((r) => r.plantId === plant.id)).toHaveLength(0)
  })
})
