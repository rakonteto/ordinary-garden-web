import { db } from '../data/db'
import { mergeRecords } from './merge'
import { downscaleImage } from './image'
import type { PhotoMeta } from './snapshot'
import type { DriveClient } from './drive'
import type { JournalPhoto } from '../data/types'

/**
 * 사진 동기화. 메타는 LWW로 머지하되 로컬 blob은 보존하고,
 * blob은 개별 드라이브 파일로 업/다운, tombstone은 드라이브에서도 삭제한다.
 */
export async function syncPhotos(
  drive: DriveClient,
  remotePhotos: PhotoMeta[],
  downscale: (b: Blob) => Promise<Blob> = downscaleImage,
): Promise<void> {
  const localRows = await db.journalPhotos.toArray()
  const localBlobById = new Map(localRows.map((p) => [p.id, p.blob]))
  const localMeta: PhotoMeta[] = localRows.map(({ blob: _b, ...m }) => m)

  // 메타 LWW 머지(blob 무관)
  const mergedMeta = mergeRecords(localMeta, remotePhotos)

  for (const meta of mergedMeta) {
    const localBlob = localBlobById.get(meta.id)
    let driveFileId = meta.driveFileId
    let blob = localBlob

    if (meta.deleted) {
      // 삭제: 드라이브 파일 정리 + driveFileId 제거 + blob 비움
      if (driveFileId) {
        try { await drive.deleteFile(driveFileId) } catch { /* 이미 없을 수 있음 */ }
        driveFileId = undefined
      }
      blob = undefined
    } else if (localBlob && !driveFileId) {
      // 로컬 신규: 다운스케일 후 업로드 → driveFileId 저장
      const scaled = await downscale(localBlob)
      driveFileId = await drive.uploadBlob(`photo-${meta.id}.jpg`, scaled)
      blob = localBlob
    } else if (!localBlob && driveFileId) {
      // 원격 신규: 다운로드해 로컬 blob 채움
      blob = await drive.downloadBlob(driveFileId)
    }

    const row: JournalPhoto = { ...meta, driveFileId, blob }
    await db.journalPhotos.put(row)
  }
}
