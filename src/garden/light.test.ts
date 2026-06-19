import { describe, it, expect } from 'vitest'
import { LIGHT_OPTIONS, lightLabel } from './light'

describe('light', () => {
  it('high/medium/low를 한글 라벨로 매핑한다', () => {
    expect(lightLabel('high')).toBe('양지')
    expect(lightLabel('medium')).toBe('반양지')
    expect(lightLabel('low')).toBe('음지')
  })

  it('미지정이면 null을 준다', () => {
    expect(lightLabel(undefined)).toBeNull()
  })

  it('옵션은 양지·반양지·음지 3개다', () => {
    expect(LIGHT_OPTIONS.map((o) => o.label)).toEqual(['양지', '반양지', '음지'])
  })
})
