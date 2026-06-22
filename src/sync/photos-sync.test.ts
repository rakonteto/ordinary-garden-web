// @vitest-environment node
// jsdom+fake-indexeddb는 IDB 라운드트립에서 Blob 인스턴스를 보존하지 못한다(node 환경은 보존).
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '../data/db'
import { syncPhotos } from './photos-sync'
import type { DriveClient } from './drive'
import type { PhotoMeta } from './snapshot'

beforeEach(async () => { await db.journalPhotos.clear() })

function drive(overrides: Partial<DriveClient> = {}): DriveClient {
  return {
    findFileId: async () => null,
    downloadJson: async () => ({} as never),
    downloadBlob: async () => new Blob(['remote-bytes'], { type: 'image/jpeg' }),
    uploadJson: async () => 'X',
    uploadBlob: async () => 'NEWDRIVEID',
    deleteFile: async () => {},
    ...overrides,
  }
}
const noScale = async (b: Blob) => b

describe('syncPhotos', () => {
  it('로컬 신규 사진(blob 있고 driveFileId 없음)은 다운스케일·업로드 후 driveFileId 저장', async () => {
    await db.journalPhotos.add({ id: 'p1', updatedAt: 5, deleted: false, ownerId: 'o1', blob: new Blob(['big'], { type: 'image/jpeg' }) })
    const uploadBlob = vi.fn(async () => 'D1')
    const scale = vi.fn(noScale)
    await syncPhotos(drive({ uploadBlob }), [], scale)
    expect(scale).toHaveBeenCalled()
    expect(uploadBlob).toHaveBeenCalled()
    expect((await db.journalPhotos.get('p1'))!.driveFileId).toBe('D1')
  })

  it('원격 사진(driveFileId 있고 로컬 blob 없음)은 다운로드해 blob을 채운다', async () => {
    const remote: PhotoMeta[] = [{ id: 'p2', updatedAt: 10, deleted: false, ownerId: 'o1', driveFileId: 'RD2' }]
    const downloadBlob = vi.fn(async () => new Blob(['bytes'], { type: 'image/jpeg' }))
    await syncPhotos(drive({ downloadBlob }), remote, noScale)
    const got = await db.journalPhotos.get('p2')
    expect(downloadBlob).toHaveBeenCalledWith('RD2')
    expect(got!.blob).toBeInstanceOf(Blob)
    expect(got!.driveFileId).toBe('RD2')
  })

  it('tombstone 사진(driveFileId 보유)은 드라이브에서 삭제', async () => {
    await db.journalPhotos.add({ id: 'p3', updatedAt: 9, deleted: true, ownerId: 'o1', driveFileId: 'RD3' })
    const deleteFile = vi.fn(async () => {})
    await syncPhotos(drive({ deleteFile }), [{ id: 'p3', updatedAt: 9, deleted: true, ownerId: 'o1', driveFileId: 'RD3' }], noScale)
    expect(deleteFile).toHaveBeenCalledWith('RD3')
    expect((await db.journalPhotos.get('p3'))!.driveFileId).toBeUndefined()
  })

  it('메타 머지: 로컬 blob을 보존하면서 원격 메타를 반영', async () => {
    await db.journalPhotos.add({ id: 'p4', updatedAt: 5, deleted: false, ownerId: 'o1', blob: new Blob(['keep']), driveFileId: 'D4' })
    const remote: PhotoMeta[] = [{ id: 'p4', updatedAt: 50, deleted: false, ownerId: 'o9', driveFileId: 'D4' }]
    await syncPhotos(drive(), remote, noScale)
    const got = await db.journalPhotos.get('p4')
    expect(got!.ownerId).toBe('o9')        // 원격 메타 반영
    expect(got!.updatedAt).toBe(50)
    expect(got!.blob).toBeInstanceOf(Blob)  // 로컬 blob 보존
  })
})
