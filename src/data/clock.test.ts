import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { createArea, renameArea, softDeleteArea } from './areas'
import { createPlant, updatePlant, softDeletePlant, archivePlant, softDeletePlantDeep } from './plants'
import { createEntry, updateEntry, softDeleteEntry } from './journal'
import { putPhoto, softDeletePhoto } from './photos'

const T = 1_700_000_000_000 // 고정 시계

beforeEach(async () => {
  await Promise.all([db.areas, db.plants, db.journalEntries, db.journalPhotos, db.careRules].map((t) => t.clear()))
})

describe('clock 주입 통일', () => {
  it('createArea/renameArea/softDeleteArea가 주입된 now를 updatedAt에 쓴다', async () => {
    const a = await createArea('뒷마당', 0, T)
    expect(a.updatedAt).toBe(T)
    const r = await renameArea(a.id, '앞마당', T + 1)
    expect(r.updatedAt).toBe(T + 1)
    await softDeleteArea(a.id, T + 2)
    expect((await db.areas.get(a.id))!.updatedAt).toBe(T + 2)
    expect((await db.areas.get(a.id))!.deleted).toBe(true)
  })

  it('plants 전 경로가 주입된 now를 쓴다', async () => {
    const area = await createArea('A', 0, T)
    const p = await createPlant({ areaId: area.id, name: '바질' }, T)
    expect(p.updatedAt).toBe(T)
    const u = await updatePlant(p.id, { name: '루꼴라' }, T + 1)
    expect(u.updatedAt).toBe(T + 1)
    await archivePlant(p.id, T + 2)
    expect((await db.plants.get(p.id))!.updatedAt).toBe(T + 2)
    await softDeletePlant(p.id, T + 3)
    expect((await db.plants.get(p.id))!.updatedAt).toBe(T + 3)
  })

  it('softDeletePlantDeep이 하위(일지·사진·식물)에 동일 now를 전파한다', async () => {
    const area = await createArea('A', 0, T)
    const p = await createPlant({ areaId: area.id, name: '토마토' }, T)
    const e = await createEntry({ plantId: p.id, date: T, note: '파종', tags: [] }, T)
    const ph = await putPhoto({ ownerId: e.id, blob: new Blob(['x']) }, T)
    await softDeletePlantDeep(p.id, T + 9)
    expect((await db.plants.get(p.id))!.updatedAt).toBe(T + 9)
    expect((await db.journalEntries.get(e.id))!.updatedAt).toBe(T + 9)
    expect((await db.journalPhotos.get(ph.id))!.updatedAt).toBe(T + 9)
  })

  it('journal/photos가 주입된 now를 쓴다', async () => {
    const e = await createEntry({ plantId: 'p1', date: T, note: 'n', tags: [] }, T)
    expect(e.updatedAt).toBe(T)
    const u = await updateEntry(e.id, { note: 'n2' }, T + 1)
    expect(u.updatedAt).toBe(T + 1)
    await softDeleteEntry(e.id, T + 2)
    expect((await db.journalEntries.get(e.id))!.updatedAt).toBe(T + 2)
    const ph = await putPhoto({ ownerId: 'o1', blob: new Blob(['y']) }, T)
    expect(ph.updatedAt).toBe(T)
    await softDeletePhoto(ph.id, T + 5)
    expect((await db.journalPhotos.get(ph.id))!.updatedAt).toBe(T + 5)
  })
})
