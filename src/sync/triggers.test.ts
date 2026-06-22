import { describe, it, expect } from 'vitest'
import { isUserWrite } from './triggers'

describe('isUserWrite (루프 방지 가드)', () => {
  it('syncing 중 쓰기는 동기화 자신의 반영이라 제외', () => {
    expect(isUserWrite('syncing')).toBe(false)
  })
  it('idle/error 중 쓰기는 사용자 변경 → 트리거', () => {
    expect(isUserWrite('idle')).toBe(true)
    expect(isUserWrite('error')).toBe(true)
  })
})
