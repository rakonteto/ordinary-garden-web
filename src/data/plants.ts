import { db } from './db'
import { baseFields } from './record'
import type { LightRequirement, Plant } from './types'

export interface NewPlantFields {
  areaId: string
  name: string
  lightRequirement?: LightRequirement
  photoId?: string
  datePlanted?: number
  note?: string
}

export type PlantPatch = Partial<
  Pick<Plant, 'areaId' | 'name' | 'lightRequirement' | 'photoId' | 'datePlanted' | 'note' | 'isArchived'>
>

export async function createPlant(fields: NewPlantFields): Promise<Plant> {
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
