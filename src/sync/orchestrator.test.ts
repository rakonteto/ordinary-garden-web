import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../data/db'
import { createSyncEngine, GARDEN_FILE } from './orchestrator'
import { EMPTY_SNAPSHOT, type GardenSnapshot } from './snapshot'
import type { DriveClient } from './drive'

beforeEach(async () => {
  await Promise.all([db.areas, db.plants, db.journalEntries, db.journalPhotos, db.careRules].map((t) => t.clear()))
})

/** 메모리 드라이브 목: garden.json 1개만 다룬다(사진은 Task 8). */
function fakeDrive(initial: GardenSnapshot | null) {
  let stored: GardenSnapshot | null = initial
  const drive: DriveClient = {
    async findFileId(name) { return name === GARDEN_FILE && stored ? 'GID' : null },
    async downloadJson() { return stored as unknown as never },
    async downloadBlob() { return new Blob() },
    async uploadJson(_n, data) { stored = data as GardenSnapshot; return 'GID' },
    async uploadBlob() { return 'PID' },
    async deleteFile() {},
  }
  return { drive, get: () => stored }
}

describe('sync() 메타 양방향', () => {
  it('원격 garden.json이 없으면 로컬을 그대로 업로드', async () => {
    await db.areas.add({ id: 'a1', updatedAt: 5, deleted: false, name: '뒷마당', sortOrder: 0 })
    const f = fakeDrive(null)
    const engine = createSyncEngine({ drive: f.drive, onChanged: () => {} })
    await engine.sync()
    expect(f.get()!.areas.find((a) => a.id === 'a1')!.name).toBe('뒷마당')
  })

  it('원격이 더 최신인 레코드를 로컬에 반영(updatedAt 보존)', async () => {
    await db.areas.add({ id: 'a1', updatedAt: 5, deleted: false, name: '로컬', sortOrder: 0 })
    const remote: GardenSnapshot = { ...EMPTY_SNAPSHOT, areas: [{ id: 'a1', updatedAt: 50, deleted: false, name: '원격', sortOrder: 0 }] }
    const f = fakeDrive(remote)
    const onChanged = vi.fn()
    const engine = createSyncEngine({ drive: f.drive, onChanged })
    await engine.sync()
    const got = await db.areas.get('a1')
    expect(got!.name).toBe('원격')
    expect(got!.updatedAt).toBe(50)
    expect(onChanged).toHaveBeenCalled()
  })

  it('원격 tombstone이 더 최신이면 로컬도 삭제 상태로', async () => {
    await db.plants.add({ id: 'p1', updatedAt: 5, deleted: false, areaId: 'a', name: '바질', isArchived: false, sortOrder: 0 })
    const remote: GardenSnapshot = { ...EMPTY_SNAPSHOT, plants: [{ id: 'p1', updatedAt: 9, deleted: true, areaId: 'a', name: '바질', isArchived: false, sortOrder: 0 }] }
    const f = fakeDrive(remote)
    const engine = createSyncEngine({ drive: f.drive, onChanged: () => {} })
    await engine.sync()
    expect((await db.plants.get('p1'))!.deleted).toBe(true)
  })

  it('동시 호출은 뮤텍스로 1회만(두 번째는 진행 중이면 스킵)', async () => {
    const f = fakeDrive({ ...EMPTY_SNAPSHOT })
    const upload = vi.spyOn(f.drive, 'uploadJson')
    const engine = createSyncEngine({ drive: f.drive, onChanged: () => {} })
    await Promise.all([engine.sync(), engine.sync()])
    expect(upload).toHaveBeenCalledTimes(1)
  })
})
