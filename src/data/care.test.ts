import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import { createRule, listRulesByPlant, listActiveRules, updateRule, softDeleteRule, softDeleteRulesByPlant } from './care'
import { startOfDayKST } from '../care/scheduler'

beforeEach(async () => {
  await db.careRules.clear()
})

describe('createRule', () => {
  it('오늘 KST 자정 due로 시작, createdAt=now, lastCompletedAt 없음', async () => {
    const now = Date.parse('2026-06-21T05:00:00Z')
    const r = await createRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true }, now)
    expect(r.nextDueAt).toBe(startOfDayKST(now))
    expect(r.createdAt).toBe(now)
    expect(r.lastCompletedAt).toBeUndefined()
    expect(r.deleted).toBe(false)
    expect(r.plantId).toBe('p1')
  })
})

describe('listRulesByPlant', () => {
  it('plantId 필터 + createdAt 오름차순 + deleted 제외', async () => {
    await createRule({ plantId: 'p1', careType: 'fertilize', intervalDays: 14, weatherAware: false }, 200)
    await createRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true }, 100)
    await createRule({ plantId: 'p2', careType: 'water', intervalDays: 3, weatherAware: true }, 150)
    const rules = await listRulesByPlant('p1')
    expect(rules.map((r) => r.careType)).toEqual(['water', 'fertilize'])  // createdAt 100, 200 순
  })
  it('softDeleted 규칙은 제외', async () => {
    const r1 = await createRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true }, 100)
    const r2 = await createRule({ plantId: 'p1', careType: 'fertilize', intervalDays: 14, weatherAware: false }, 200)
    await softDeleteRule(r1.id)
    const rules = await listRulesByPlant('p1')
    expect(rules).toHaveLength(1)
    expect(rules[0].id).toBe(r2.id)
    expect(rules[0].careType).toBe('fertilize')
  })
})

describe('updateRule', () => {
  it('patch 적용 + updatedAt 갱신', async () => {
    const r = await createRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true }, 100)
    const updated = await updateRule(r.id, { intervalDays: 7, nextDueAt: 999 }, 500)
    expect(updated.intervalDays).toBe(7)
    expect(updated.nextDueAt).toBe(999)
    expect(updated.updatedAt).toBe(500)
  })
})

describe('softDeleteRule / softDeleteRulesByPlant', () => {
  it('softDeleteRule → listActiveRules에서 빠짐', async () => {
    const r = await createRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true }, 100)
    await softDeleteRule(r.id)
    expect(await listActiveRules()).toHaveLength(0)
  })
  it('softDeleteRulesByPlant → 해당 식물 규칙 전부 삭제, 타 식물 유지', async () => {
    await createRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true }, 100)
    await createRule({ plantId: 'p1', careType: 'fertilize', intervalDays: 14, weatherAware: false }, 110)
    await createRule({ plantId: 'p2', careType: 'water', intervalDays: 3, weatherAware: true }, 120)
    await softDeleteRulesByPlant('p1')
    const active = await listActiveRules()
    expect(active).toHaveLength(1)
    expect(active[0].plantId).toBe('p2')
  })
  it('softDeleteRule 멱등(없는 id no-op)', async () => {
    await expect(softDeleteRule('nope')).resolves.toBeUndefined()
  })
})
