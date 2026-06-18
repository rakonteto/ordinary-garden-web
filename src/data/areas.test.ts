import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { createArea, listAreas, renameArea, softDeleteArea } from './areas'

beforeEach(async () => {
  await db.areas.clear()
})

describe('areas 리포지토리', () => {
  it('영역을 생성하고 목록에 노출한다', async () => {
    const a = await createArea('베란다', 0)
    const list = await listAreas()
    expect(list.map((x) => x.id)).toContain(a.id)
    expect(a.name).toBe('베란다')
    expect(a.deleted).toBe(false)
  })

  it('이름을 바꾸면 updatedAt이 갱신된다', async () => {
    const a = await createArea('배란다', 0)
    const updated = await renameArea(a.id, '베란다')
    expect(updated.name).toBe('베란다')
    expect(updated.updatedAt).toBeGreaterThanOrEqual(a.updatedAt)
  })

  it('soft delete하면 목록에서 빠지지만 tombstone으로 남는다', async () => {
    const a = await createArea('텃밭', 1)
    await softDeleteArea(a.id)
    const list = await listAreas()
    expect(list.find((x) => x.id === a.id)).toBeUndefined()
    const raw = await db.areas.get(a.id)
    expect(raw?.deleted).toBe(true)
  })
})
