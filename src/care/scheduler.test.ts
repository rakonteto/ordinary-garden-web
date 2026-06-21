import { describe, it, expect } from 'vitest'
import { startOfDayKST, nextDue, dueDescription } from './scheduler'

const DAY = 86400000

describe('startOfDayKST', () => {
  it('KST 자정으로 정규화(UTC 전날 15:00)', () => {
    // 2026-06-21T05:00Z = KST 14:00 → 그날 KST 자정 = 2026-06-20T15:00Z
    expect(startOfDayKST(Date.parse('2026-06-21T05:00:00Z'))).toBe(Date.parse('2026-06-20T15:00:00Z'))
  })
  it('이미 KST 자정이면 그대로', () => {
    const midnight = Date.parse('2026-06-20T15:00:00Z')
    expect(startOfDayKST(midnight)).toBe(midnight)
  })
})

describe('nextDue', () => {
  it('완료일 KST 자정 + 간격일', () => {
    const completed = Date.parse('2026-06-21T05:00:00Z')   // KST 6/21
    expect(nextDue(completed, 3)).toBe(startOfDayKST(completed) + 3 * DAY)
  })
})

describe('dueDescription', () => {
  const asOf = Date.parse('2026-06-21T05:00:00Z')   // KST 6/21
  it('undefined → —', () => expect(dueDescription(undefined, asOf)).toBe('—'))
  it('오늘', () => expect(dueDescription(startOfDayKST(asOf), asOf)).toBe('오늘'))
  it('미래 D-3', () => expect(dueDescription(startOfDayKST(asOf) + 3 * DAY, asOf)).toBe('D-3'))
  it('과거 2일 지남', () => expect(dueDescription(startOfDayKST(asOf) - 2 * DAY, asOf)).toBe('2일 지남'))
})
