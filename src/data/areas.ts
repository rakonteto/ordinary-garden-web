import { db } from './db'
import { baseFields } from './record'
import type { Area } from './types'

export async function createArea(name: string, sortOrder: number): Promise<Area> {
  const area: Area = { ...baseFields(Date.now()), name, sortOrder }
  await db.areas.add(area)
  return area
}

export async function listAreas(): Promise<Area[]> {
  // sortOrder 인덱스로 정렬(후속 엔티티가 이 패턴을 따른다). tombstone은 메모리 필터.
  const all = await db.areas.orderBy('sortOrder').toArray()
  return all.filter((a) => !a.deleted)
}

export async function renameArea(id: string, name: string): Promise<Area> {
  const existing = await db.areas.get(id)
  if (!existing) throw new Error(`area not found: ${id}`)
  const updated: Area = { ...existing, name, updatedAt: Date.now() }
  await db.areas.put(updated)
  return updated
}

export async function softDeleteArea(id: string): Promise<void> {
  // 멱등: 없거나 이미 삭제된 레코드면 no-op(renameArea와 달리 throw하지 않음).
  // 동기화에서 원격의 중복 삭제 전파를 안전하게 흡수한다.
  const existing = await db.areas.get(id)
  if (!existing) return
  await db.areas.put({ ...existing, deleted: true, updatedAt: Date.now() })
}
