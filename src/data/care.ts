import { db } from './db'
import { baseFields } from './record'
import { startOfDayKST } from '../care/scheduler'
import type { CareRule, CareType } from './types'

export interface NewCareRuleFields {
  plantId: string
  careType: CareType
  intervalDays: number
  weatherAware: boolean
}

export type CareRulePatch = Partial<
  Pick<CareRule, 'careType' | 'intervalDays' | 'weatherAware' | 'lastCompletedAt' | 'nextDueAt'>
>

/** 새 규칙. 오늘 KST 자정 due로 시작, lastCompletedAt 없음. */
export async function createRule(fields: NewCareRuleFields, now = Date.now()): Promise<CareRule> {
  const rule: CareRule = {
    ...baseFields(now),
    plantId: fields.plantId,
    careType: fields.careType,
    intervalDays: fields.intervalDays,
    weatherAware: fields.weatherAware,
    lastCompletedAt: undefined,
    nextDueAt: startOfDayKST(now),
    createdAt: now,
  }
  await db.careRules.add(rule)
  return rule
}

/** 한 식물의 규칙을 createdAt 오름차순으로(deleted 제외). */
export async function listRulesByPlant(plantId: string): Promise<CareRule[]> {
  const all = await db.careRules.where('plantId').equals(plantId).sortBy('createdAt')
  return all.filter((r) => !r.deleted)
}

/** 전체 미삭제 규칙(store가 메모리 보유). */
export async function listActiveRules(): Promise<CareRule[]> {
  const all = await db.careRules.toArray()
  return all.filter((r) => !r.deleted)
}

export async function updateRule(id: string, patch: CareRulePatch, now = Date.now()): Promise<CareRule> {
  const existing = await db.careRules.get(id)
  if (!existing) throw new Error(`care rule not found: ${id}`)
  const updated: CareRule = { ...existing, ...patch, updatedAt: now }
  await db.careRules.put(updated)
  return updated
}

/** 멱등: 없으면 no-op(동기화의 중복 삭제 흡수). */
export async function softDeleteRule(id: string, now = Date.now()): Promise<void> {
  const existing = await db.careRules.get(id)
  if (!existing) return
  await db.careRules.put({ ...existing, deleted: true, updatedAt: now })
}

/** 식물 삭제 cascade용 — 그 식물의 모든 규칙 soft-delete. */
export async function softDeleteRulesByPlant(plantId: string, now = Date.now()): Promise<void> {
  const rules = await listRulesByPlant(plantId)
  for (const r of rules) await softDeleteRule(r.id, now)
}
