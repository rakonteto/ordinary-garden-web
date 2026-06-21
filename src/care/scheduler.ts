// 케어 due 날짜 계산(순수). KST 기준 — journal/format.ts 규약과 동일.
const DAY = 86400000
const KST_OFFSET = 9 * 3600 * 1000

/** 그 시각이 속한 KST 날짜의 자정 epoch(ms). */
export function startOfDayKST(ms: number): number {
  const k = new Date(ms + KST_OFFSET)
  return Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate()) - KST_OFFSET
}

/** 완료 시점의 KST 자정 + intervalDays일. */
export function nextDue(completedMs: number, intervalDays: number): number {
  return startOfDayKST(completedMs) + intervalDays * DAY
}

/** D-day 라벨: 오늘="오늘", 미래="D-n", 과거="n일 지남", nil="—". */
export function dueDescription(nextDueAt: number | undefined, asOfMs: number = Date.now()): string {
  if (nextDueAt == null) return '—'
  const days = Math.round((startOfDayKST(nextDueAt) - startOfDayKST(asOfMs)) / DAY)
  if (days === 0) return '오늘'
  if (days < 0) return `${-days}일 지남`
  return `D-${days}`
}
