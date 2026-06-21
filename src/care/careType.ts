import type { CareType } from '../data/types'
export type { CareType }

// 정의 순서 = "오늘 할 일" 그룹 정렬 순서(원본 CareType.allCases).
export const CARE_TYPES: readonly { value: CareType; label: string; defaultIntervalDays: number }[] = [
  { value: 'water', label: '물주기', defaultIntervalDays: 3 },
  { value: 'fertilize', label: '비료', defaultIntervalDays: 14 },
  { value: 'repot', label: '분갈이', defaultIntervalDays: 365 },
]

const BY_VALUE = new Map(CARE_TYPES.map((c) => [c.value, c]))
export function careLabel(value: CareType): string {
  return BY_VALUE.get(value)?.label ?? '케어'
}
export function defaultIntervalDays(value: CareType): number {
  return BY_VALUE.get(value)?.defaultIntervalDays ?? 1
}
