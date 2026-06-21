import { db } from './db'
import { baseFields } from './record'
import type { LightRequirement, Plant } from './types'
import { listEntriesByPlant, softDeleteEntry } from './journal'
import { listPhotosByOwner, softDeletePhoto } from './photos'

export interface NewPlantFields {
  areaId: string
  name: string
  lightRequirement?: LightRequirement
  photoId?: string
  datePlanted?: number
  note?: string
}

// isArchived는 제외: 보관은 archivePlant가 단일 경로(updatePlant로 우회하지 않는다).
export type PlantPatch = Partial<
  Pick<Plant, 'areaId' | 'name' | 'lightRequirement' | 'photoId' | 'datePlanted' | 'note'>
>

export async function createPlant(fields: NewPlantFields): Promise<Plant> {
  // sortOrder = 현재 행 수(tombstone 포함)로 단조 증가. 단일 사용자 순차 조작이라
  // 동시 생성으로 인한 중복 순서는 사실상 없다(명시적 reorder는 ④⑥에서 도입).
  const sortOrder = await db.plants.count()
  const plant: Plant = {
    ...baseFields(Date.now()),
    areaId: fields.areaId,
    name: fields.name,
    lightRequirement: fields.lightRequirement,
    photoId: fields.photoId,
    datePlanted: fields.datePlanted,
    note: fields.note,
    isArchived: false,
    sortOrder,
  }
  await db.plants.add(plant)
  return plant
}

/** 아카이브·삭제되지 않은 식물을 sortOrder 순으로. tombstone·archive는 메모리 필터. */
export async function listPlants(): Promise<Plant[]> {
  const all = await db.plants.orderBy('sortOrder').toArray()
  return all.filter((p) => !p.deleted && !p.isArchived)
}

export async function listPlantsByArea(areaId: string): Promise<Plant[]> {
  // areaId는 인덱스라 where로 좁히고 sortOrder는 메모리 정렬(sortBy) — listPlants의 orderBy와 동일 결과.
  const all = await db.plants.where('areaId').equals(areaId).sortBy('sortOrder')
  return all.filter((p) => !p.deleted && !p.isArchived)
}

export async function updatePlant(id: string, patch: PlantPatch): Promise<Plant> {
  const existing = await db.plants.get(id)
  if (!existing) throw new Error(`plant not found: ${id}`)
  const updated: Plant = { ...existing, ...patch, updatedAt: Date.now() }
  await db.plants.put(updated)
  return updated
}

export async function softDeletePlant(id: string): Promise<void> {
  // 멱등: 없으면 no-op(동기화의 중복 삭제 전파 흡수).
  const existing = await db.plants.get(id)
  if (!existing) return
  await db.plants.put({ ...existing, deleted: true, updatedAt: Date.now() })
}

export async function archivePlant(id: string): Promise<void> {
  const existing = await db.plants.get(id)
  if (!existing) return
  await db.plants.put({ ...existing, isArchived: true, updatedAt: Date.now() })
}

/**
 * 식물과 그 식물에 속한 모든 일지·사진을 cascade soft-delete한다.
 * - 일지 각각의 사진(listPhotosByOwner(entry.id)) → softDeletePhoto
 * - 일지 → softDeleteEntry
 * - 식물 대표사진(plant.photoId) → softDeletePhoto
 * - 식물 → softDeletePlant
 * 멱등: 이미 삭제된 식물이라도 오류 없이 동작한다.
 */
export async function softDeletePlantDeep(id: string): Promise<void> {
  // 일지 전체 조회 후 각 일지의 사진 → 일지 순으로 cascade
  const entries = await listEntriesByPlant(id)
  for (const entry of entries) {
    const photos = await listPhotosByOwner(entry.id)
    for (const photo of photos) {
      await softDeletePhoto(photo.id)
    }
    await softDeleteEntry(entry.id)
  }

  // 식물 대표사진
  const plant = await db.plants.get(id)
  if (plant?.photoId) {
    await softDeletePhoto(plant.photoId)
  }

  // 마지막으로 식물 자체 tombstone
  await softDeletePlant(id)
}
