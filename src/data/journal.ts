import { db } from './db'
import { baseFields } from './record'
import type { JournalEntry, WeatherSnapshot } from './types'

export interface NewEntryFields {
  plantId: string
  date: number
  note: string
  tags: string[]
  weatherSnapshot?: WeatherSnapshot
}

export type EntryPatch = Partial<Pick<JournalEntry, 'date' | 'note' | 'tags' | 'weatherSnapshot'>>

export async function createEntry(fields: NewEntryFields, now = Date.now()): Promise<JournalEntry> {
  const entry: JournalEntry = {
    ...baseFields(now),
    plantId: fields.plantId,
    date: fields.date,
    note: fields.note,
    tags: fields.tags,
    weatherSnapshot: fields.weatherSnapshot,
  }
  await db.journalEntries.add(entry)
  return entry
}

export async function listEntriesByPlant(plantId: string): Promise<JournalEntry[]> {
  const all = await db.journalEntries.where('plantId').equals(plantId).toArray()
  return all
    .filter((e) => !e.deleted)
    .sort((a, b) => b.date - a.date || b.updatedAt - a.updatedAt) // 최신이 위
}

export async function updateEntry(id: string, patch: EntryPatch, now = Date.now()): Promise<JournalEntry> {
  const existing = await db.journalEntries.get(id)
  if (!existing) throw new Error(`journal entry not found: ${id}`)
  const updated: JournalEntry = { ...existing, ...patch, updatedAt: now }
  await db.journalEntries.put(updated)
  return updated
}

export async function softDeleteEntry(id: string, now = Date.now()): Promise<void> {
  const existing = await db.journalEntries.get(id)
  if (!existing) return
  await db.journalEntries.put({ ...existing, deleted: true, updatedAt: now })
}
