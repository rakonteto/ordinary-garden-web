import { describe, it, expect } from 'vitest'
import { CARE_TYPES, careLabel, defaultIntervalDays } from './careType'

describe('careType', () => {
  it('정의 순서가 물주기·비료·분갈이', () => {
    expect(CARE_TYPES.map((c) => c.value)).toEqual(['water', 'fertilize', 'repot'])
  })
  it('라벨', () => {
    expect(careLabel('water')).toBe('물주기')
    expect(careLabel('fertilize')).toBe('비료')
    expect(careLabel('repot')).toBe('분갈이')
  })
  it('기본 주기 3·14·365', () => {
    expect(defaultIntervalDays('water')).toBe(3)
    expect(defaultIntervalDays('fertilize')).toBe(14)
    expect(defaultIntervalDays('repot')).toBe(365)
  })
})
