import type { CareRule, Plant, Area, CareType } from '../data/types'
import { CARE_TYPES } from './careType'
import { startOfDayKST } from './scheduler'

const DAY = 86400000

export interface CareTaskItem {
  rule: CareRule
  plant: Plant
  areaName?: string
}

// 규칙을 식물·영역과 조인. 식물이 없거나 보관 중이면 null(제외).
function join(rule: CareRule, plants: Plant[], areas: Area[]): CareTaskItem | null {
  const plant = plants.find((p) => p.id === rule.plantId)
  if (!plant || plant.isArchived) return null
  const areaName = areas.find((a) => a.id === plant.areaId)?.name
  return { rule, plant, areaName }
}

const byDue = (a: CareTaskItem, b: CareTaskItem) => a.rule.nextDueAt - b.rule.nextDueAt

/** 오늘까지 due(nextDueAt < 내일 KST 자정)인 미보관 식물 규칙을 CareType 순으로 그룹화(빈 그룹 제외). */
export function dueGroups(
  rules: CareRule[], plants: Plant[], areas: Area[], asOfMs: number = Date.now()
): { type: CareType; items: CareTaskItem[] }[] {
  const cutoff = startOfDayKST(asOfMs) + DAY
  const due = rules.filter((r) => !r.deleted && r.nextDueAt < cutoff)
  return CARE_TYPES.map((ct) => {
    const items = due
      .filter((r) => r.careType === ct.value)
      .map((r) => join(r, plants, areas))
      .filter((x): x is CareTaskItem => x !== null)
      .sort(byDue)
    return { type: ct.value, items }
  }).filter((g) => g.items.length > 0)
}

/** 내일 ~ within일 이내 due인 미보관 식물 규칙, nextDueAt 오름차순. */
export function upcoming(
  rules: CareRule[], plants: Plant[], areas: Area[], asOfMs: number = Date.now(), within = 14
): CareTaskItem[] {
  const start = startOfDayKST(asOfMs) + DAY
  const end = startOfDayKST(asOfMs) + (within + 1) * DAY
  return rules
    .filter((r) => !r.deleted && r.nextDueAt >= start && r.nextDueAt < end)
    .map((r) => join(r, plants, areas))
    .filter((x): x is CareTaskItem => x !== null)
    .sort(byDue)
}
