import { db } from './db'
import { baseFields } from './record'
import type { Area } from './types'

export async function createArea(name: string, sortOrder: number): Promise<Area> {
  const area: Area = { ...baseFields(Date.now()), name, sortOrder }
  await db.areas.add(area)
  return area
}

export async function listAreas(): Promise<Area[]> {
  const all = await db.areas.toArray()
  return all.filter((a) => !a.deleted).sort((x, y) => x.sortOrder - y.sortOrder)
}

export async function renameArea(id: string, name: string): Promise<Area> {
  const existing = await db.areas.get(id)
  if (!existing) throw new Error(`area not found: ${id}`)
  const updated: Area = { ...existing, name, updatedAt: Date.now() }
  await db.areas.put(updated)
  return updated
}

export async function softDeleteArea(id: string): Promise<void> {
  const existing = await db.areas.get(id)
  if (!existing) return
  await db.areas.put({ ...existing, deleted: true, updatedAt: Date.now() })
}
