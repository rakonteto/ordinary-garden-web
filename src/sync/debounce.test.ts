import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce } from './debounce'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('debounce', () => {
  it('연속 호출을 마지막 1회로 합친다', () => {
    const fn = vi.fn()
    const d = debounce(fn, 3000)
    d.call(); d.call(); d.call()
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3000)
    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('cancel하면 호출 안 됨', () => {
    const fn = vi.fn()
    const d = debounce(fn, 1000)
    d.call(); d.cancel()
    vi.advanceTimersByTime(2000)
    expect(fn).not.toHaveBeenCalled()
  })
})
