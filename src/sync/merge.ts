import type { BaseRecord } from '../data/types'

/**
 * 레코드별 Last-Write-Wins 머지. id로 매칭해 updatedAt이 큰 쪽을 채택한다.
 * - tombstone(deleted)도 하나의 상태로 취급 — 더 최신 삭제는 더 오래된 수정을 이긴다.
 * - updatedAt 동률이면 로컬 유지(결정적 tiebreak).
 * - 한쪽에만 있는 레코드는 그대로 채택.
 * 부수효과 0(네트워크·DB·시계 의존 없음). 5개 테이블에 동일 적용.
 */
export function mergeRecords<T extends BaseRecord>(local: T[], remote: T[]): T[] {
  const out = new Map<string, T>()
  for (const rec of local) out.set(rec.id, rec)
  for (const rec of remote) {
    const cur = out.get(rec.id)
    if (!cur || rec.updatedAt > cur.updatedAt) out.set(rec.id, rec)
  }
  return [...out.values()]
}
