// relativeTime.test.ts
import { describe, it, expect } from 'vitest'
import { relativeSyncTime } from './relativeTime'
const T = 1_000_000_000_000
describe('relativeSyncTime', () => {
  it('null이면 안내 문구', () => { expect(relativeSyncTime(null, T)).toBe('아직 동기화 안 함') })
  it('1분 미만은 방금', () => { expect(relativeSyncTime(T - 30_000, T)).toBe('방금 전') })
  it('분 단위', () => { expect(relativeSyncTime(T - 5 * 60_000, T)).toBe('5분 전') })
  it('시간 단위', () => { expect(relativeSyncTime(T - 3 * 3600_000, T)).toBe('3시간 전') })
})
