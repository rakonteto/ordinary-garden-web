import { describe, it, expect } from 'vitest'
import { WORK_TYPES, workLabel, sortWorkTypes } from './workType'

describe('workType', () => {
  it('8종이 SwiftUI 원본 순서·라벨로 정의된다', () => {
    expect(WORK_TYPES.map((w) => w.value)).toEqual([
      'water', 'fertilize', 'sowTransplant', 'observe', 'harvest', 'prune', 'pest', 'support',
    ])
    expect(WORK_TYPES.map((w) => w.label)).toEqual([
      '물주기', '비료', '파종·모종', '관찰', '수확', '가지치기', '병해충', '지지대',
    ])
  })
  it('workLabel: 알면 라벨, 모르면 undefined', () => {
    expect(workLabel('water')).toBe('물주기')
    expect(workLabel('bogus')).toBeUndefined()
  })
  it('sortWorkTypes: 정의 순서로 정렬하고 미지 값은 버린다', () => {
    expect(sortWorkTypes(['prune', 'water', 'bogus', 'observe'])).toEqual(['water', 'observe', 'prune'])
  })
})
