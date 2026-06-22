import { db } from '../data/db'
import { syncStore } from './useSync'
import { debounce } from './debounce'

const PUSH_DEBOUNCE_MS = 3000
let initialized = false

/** 동기화 중(syncing)의 DB 쓰기는 동기화 자신의 반영이므로 자동 트리거에서 제외(쓰기 시점 가드 → 루프 방지). */
export function isUserWrite(status: string): boolean {
  return status !== 'syncing'
}

/** 자동 동기화는 로그인 상태일 때만(미로그인 자동 sync→getToken 실패→error 방지). */
function autoSync(): void {
  if (syncStore.getSnapshot().signedIn) void syncStore.syncNow()
}

/**
 * 동기화 트리거를 1회 등록한다(idempotent).
 * - 앱 시작 + 탭 포커스 복귀(visibilitychange visible) → autoSync(로그인 시 즉시 동기화)
 * - 로컬 쓰기(Dexie creating/updating hook) → isUserWrite면 디바운스 후 autoSync
 */
export function initSyncTriggers(): void {
  if (initialized) return
  initialized = true

  const debounced = debounce(autoSync, PUSH_DEBOUNCE_MS)

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') autoSync()
    })
  }
  autoSync() // 콜드스타트 1회

  // 로컬 쓰기 감지(일지·사진까지). sync 자신의 쓰기는 쓰기 시점 status==='syncing'이라 isUserWrite가 제외.
  const onWrite = () => { if (isUserWrite(syncStore.getSnapshot().status)) debounced.call() }
  for (const table of [db.areas, db.plants, db.journalEntries, db.journalPhotos, db.careRules]) {
    table.hook('creating', onWrite)
    table.hook('updating', onWrite)
  }
}
