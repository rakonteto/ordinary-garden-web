import { describe, it, expect } from 'vitest'
import { createCareStore, type CareRepo } from './store'
import { nextDue, startOfDayKST } from './scheduler'
import type { CareRule } from '../data/types'

const DAY = 86400000

function fakeRepo(): CareRepo & { rules: CareRule[] } {
  const rules: CareRule[] = []
  let seq = 0
  return {
    rules,
    async listActiveRules() { return rules.filter((r) => !r.deleted) },
    async createRule(fields, now = 0) {
      const r: CareRule = { id: `r${seq++}`, updatedAt: now, deleted: false, lastCompletedAt: undefined,
        nextDueAt: startOfDayKST(now), createdAt: now, ...fields }
      rules.push(r)
      return r
    },
    async updateRule(id, patch, now = 0) {
      const r = rules.find((x) => x.id === id)!
      Object.assign(r, patch, { updatedAt: now })
      return r
    },
    async softDeleteRule(id) {
      const r = rules.find((x) => x.id === id)
      if (r) r.deleted = true
    },
  }
}

describe('careStore', () => {
  it('addRule 후 load된 rules에 반영 + 구독 통지', async () => {
    const store = createCareStore(fakeRepo())
    let notified = 0
    store.subscribe(() => { notified++ })
    await store.addRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true })
    expect(store.getSnapshot().rules).toHaveLength(1)
    expect(notified).toBeGreaterThan(0)
  })

  it('complete: lastCompletedAt 기록 + nextDueAt 재계산', async () => {
    const store = createCareStore(fakeRepo())
    const r = await store.addRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: false })
    const asOf = Date.parse('2026-06-21T05:00:00Z')
    await store.complete(r.id, asOf)
    const updated = store.getSnapshot().rules.find((x) => x.id === r.id)!
    expect(updated.lastCompletedAt).toBe(asOf)
    expect(updated.nextDueAt).toBe(nextDue(asOf, 3))
  })

  it('snooze: 이미 지난/오늘 due는 내일 이후로(오늘 자정 기준 +1일)', async () => {
    const repo = fakeRepo()
    const store = createCareStore(repo)
    const asOf = Date.parse('2026-06-21T05:00:00Z')
    const today = startOfDayKST(asOf)
    const r = await store.addRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: false })
    // 새 규칙 nextDueAt = 오늘(과거 아님). snooze → 오늘 + 1일
    await store.snooze(r.id, 1, asOf)
    expect(store.getSnapshot().rules.find((x) => x.id === r.id)!.nextDueAt).toBe(today + DAY)
  })

  it('snooze: 미래 due는 그 due 기준 +days', async () => {
    const repo = fakeRepo()
    const store = createCareStore(repo)
    const asOf = Date.parse('2026-06-21T05:00:00Z')
    const today = startOfDayKST(asOf)
    const r = await store.addRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: false })
    await store.complete(r.id, asOf)   // nextDueAt = today + 3d (미래)
    await store.snooze(r.id, 1, asOf)
    expect(store.getSnapshot().rules.find((x) => x.id === r.id)!.nextDueAt).toBe(today + 4 * DAY)
  })

  it('deleteRule: rules에서 빠짐', async () => {
    const store = createCareStore(fakeRepo())
    const r = await store.addRule({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: false })
    await store.deleteRule(r.id)
    expect(store.getSnapshot().rules).toHaveLength(0)
  })
})
