import { mergeRecords } from './merge'
import { exportSnapshot, importMergedMeta, EMPTY_SNAPSHOT, type GardenSnapshot } from './snapshot'
import type { DriveClient } from './drive'

export const GARDEN_FILE = 'garden.json'

export interface SyncDeps {
  drive: DriveClient
  onChanged: () => void | Promise<void>
}

export interface SyncEngine {
  sync(): Promise<void>
  isSyncing(): boolean
}

export function createSyncEngine(deps: SyncDeps): SyncEngine {
  let syncing = false

  async function runSync() {
    // 1) 원격 스냅샷 가져오기(없으면 빈 스냅샷)
    const fileId = await deps.drive.findFileId(GARDEN_FILE)
    const remote: GardenSnapshot = fileId ? await deps.drive.downloadJson<GardenSnapshot>(fileId) : EMPTY_SNAPSHOT

    // 2) 로컬 스냅샷
    const local = await exportSnapshot()

    // 3) 메타 4테이블 레코드별 LWW 머지
    const merged = {
      areas: mergeRecords(local.areas, remote.areas ?? []),
      plants: mergeRecords(local.plants, remote.plants ?? []),
      journalEntries: mergeRecords(local.journalEntries, remote.journalEntries ?? []),
      careRules: mergeRecords(local.careRules, remote.careRules ?? []),
    }

    // 4) 로컬 반영(updatedAt 보존)
    await importMergedMeta(merged)

    // 5) 사진 동기화 자리(Task 8에서 syncPhotos(deps.drive, remote.photos) 삽입)

    // 6) 머지 후 최신 스냅샷 재업로드
    const next = await exportSnapshot()
    await deps.drive.uploadJson(GARDEN_FILE, next, fileId ?? undefined)

    // 7) 화면 갱신
    await deps.onChanged()
  }

  return {
    isSyncing: () => syncing,
    async sync() {
      if (syncing) return // 뮤텍스: 진행 중이면 스킵
      syncing = true
      try {
        await runSync()
      } finally {
        syncing = false
      }
    },
  }
}
