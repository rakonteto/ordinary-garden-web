import { describe, it, expect } from 'vitest'
import { dueGroups, upcoming } from './selectors'
import { startOfDayKST } from './scheduler'
import type { CareRule, Plant, Area } from '../data/types'

const DAY = 86400000
const asOf = Date.parse('2026-06-21T05:00:00Z')   // KST 6/21
const today = startOfDayKST(asOf)

function plant(id: string, over: Partial<Plant> = {}): Plant {
  return { id, updatedAt: 0, deleted: false, areaId: 'a1', name: `식물 ${id}`, isArchived: false, sortOrder: 0, ...over }
}
function rule(id: string, over: Partial<CareRule> = {}): CareRule {
  return { id, updatedAt: 0, deleted: false, plantId: 'p1', careType: 'water', intervalDays: 3, nextDueAt: today, weatherAware: false, createdAt: 0, ...over }
}
const areas: Area[] = [{ id: 'a1', updatedAt: 0, deleted: false, name: '베란다', sortOrder: 0 }]

describe('dueGroups', () => {
  it('오늘까지 due를 CareType 순으로 그룹화, 빈 그룹 제외', () => {
    const plants = [plant('p1')]
    const rules = [
      rule('r1', { careType: 'fertilize', nextDueAt: today }),
      rule('r2', { careType: 'water', nextDueAt: today }),
    ]
    const groups = dueGroups(rules, plants, areas, asOf)
    expect(groups.map((g) => g.type)).toEqual(['water', 'fertilize'])  // CARE_TYPES 순
    expect(groups[0].items[0].areaName).toBe('베란다')
  })
  it('overdue(과거 due)도 포함, 미래는 제외', () => {
    const plants = [plant('p1')]
    const rules = [
      rule('r1', { nextDueAt: today - 2 * DAY }),    // overdue
      rule('r2', { nextDueAt: today + 1 * DAY }),    // 내일 → 제외
    ]
    const groups = dueGroups(rules, plants, areas, asOf)
    expect(groups).toHaveLength(1)
    expect(groups[0].items).toHaveLength(1)
    expect(groups[0].items[0].rule.id).toBe('r1')
  })
  it('보관 식물·없는 식물 제외', () => {
    const plants = [plant('p1', { isArchived: true })]
    const rules = [rule('r1', { plantId: 'p1' }), rule('r2', { plantId: 'ghost' })]
    expect(dueGroups(rules, plants, areas, asOf)).toHaveLength(0)
  })
  it('그룹 내 nextDueAt 오름차순', () => {
    const plants = [plant('p1'), plant('p2')]
    const rules = [
      rule('r1', { plantId: 'p1', nextDueAt: today }),
      rule('r2', { plantId: 'p2', nextDueAt: today - DAY }),
    ]
    const items = dueGroups(rules, plants, areas, asOf)[0].items
    expect(items.map((i) => i.rule.id)).toEqual(['r2', 'r1'])
  })
})

describe('upcoming', () => {
  it('내일 ~ within일 이내만, nextDueAt 오름차순', () => {
    const plants = [plant('p1')]
    const rules = [
      rule('r_today', { nextDueAt: today }),             // 오늘 → 제외
      rule('r_tom', { nextDueAt: today + DAY }),          // 내일 → 포함
      rule('r_14', { nextDueAt: today + 14 * DAY }),      // 14일째 → 포함
      rule('r_15', { nextDueAt: today + 15 * DAY }),      // 범위 밖
    ]
    const items = upcoming(rules, plants, areas, asOf, 14)
    expect(items.map((i) => i.rule.id)).toEqual(['r_tom', 'r_14'])
  })
})
