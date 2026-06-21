// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from './db'
import { createEntry, listEntriesByPlant, updateEntry, softDeleteEntry } from './journal'

beforeEach(async () => {
  await db.journalEntries.clear()
})

describe('journal repository', () => {
  it('createEntry: 저장하고 BaseRecord 필드를 채운다', async () => {
    const e = await createEntry({ plantId: 'p1', date: 100, note: '메모', tags: ['water'] })
    expect(e.id).toBeTruthy()
    expect(e.deleted).toBe(false)
    expect(await db.journalEntries.get(e.id)).toMatchObject({ plantId: 'p1', note: '메모', tags: ['water'] })
  })
  it('listEntriesByPlant: 해당 식물만, 최신(date 내림차순)이 위', async () => {
    await createEntry({ plantId: 'p1', date: 100, note: 'a', tags: [] })
    await createEntry({ plantId: 'p1', date: 300, note: 'b', tags: [] })
    await createEntry({ plantId: 'p2', date: 200, note: 'c', tags: [] })
    const list = await listEntriesByPlant('p1')
    expect(list.map((e) => e.note)).toEqual(['b', 'a'])
  })
  it('updateEntry: 패치 적용 + updatedAt 갱신', async () => {
    const e = await createEntry({ plantId: 'p1', date: 100, note: 'old', tags: [] })
    const up = await updateEntry(e.id, { note: 'new', tags: ['prune'] })
    expect(up.note).toBe('new')
    expect(up.tags).toEqual(['prune'])
  })
  it('softDeleteEntry: tombstone, 목록서 제외, 멱등', async () => {
    const e = await createEntry({ plantId: 'p1', date: 100, note: 'x', tags: [] })
    await softDeleteEntry(e.id)
    await softDeleteEntry(e.id) // 멱등
    expect(await listEntriesByPlant('p1')).toEqual([])
    expect((await db.journalEntries.get(e.id))?.deleted).toBe(true)
  })
})
