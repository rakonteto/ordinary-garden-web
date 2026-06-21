export type WorkType =
  | 'water' | 'fertilize' | 'sowTransplant' | 'observe'
  | 'harvest' | 'prune' | 'pest' | 'support'

// 정의 순서 = 칩 표시·태그 정렬 순서. SwiftUI JournalEntry.swift WorkType과 1:1.
export const WORK_TYPES: readonly { value: WorkType; label: string }[] = [
  { value: 'water', label: '물주기' },
  { value: 'fertilize', label: '비료' },
  { value: 'sowTransplant', label: '파종·모종' },
  { value: 'observe', label: '관찰' },
  { value: 'harvest', label: '수확' },
  { value: 'prune', label: '가지치기' },
  { value: 'pest', label: '병해충' },
  { value: 'support', label: '지지대' },
]

const LABEL = new Map(WORK_TYPES.map((w) => [w.value, w.label]))
export function workLabel(value: string): string | undefined {
  return LABEL.get(value as WorkType)
}

const ORDER = new Map(WORK_TYPES.map((w, i) => [w.value, i]))
export function sortWorkTypes(tags: string[]): WorkType[] {
  return tags.filter((t): t is WorkType => ORDER.has(t as WorkType)).sort((a, b) => ORDER.get(a)! - ORDER.get(b)!)
}
