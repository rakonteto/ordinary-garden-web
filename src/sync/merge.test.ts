import { describe, it, expect } from 'vitest'
import { mergeRecords } from './merge'

type Rec = { id: string; updatedAt: number; deleted: boolean; v: string }
const r = (id: string, updatedAt: number, v: string, deleted = false): Rec => ({ id, updatedAt, v, deleted })
const byId = (xs: Rec[]) => Object.fromEntries(xs.map((x) => [x.id, x]))

describe('mergeRecords (LWW)', () => {
  it('updatedAt 큰 쪽이 이긴다', () => {
    const merged = byId(mergeRecords([r('a', 10, 'L')], [r('a', 20, 'R')]))
    expect(merged.a.v).toBe('R')
  })
  it('로컬이 더 최신이면 로컬 유지', () => {
    const merged = byId(mergeRecords([r('a', 30, 'L')], [r('a', 20, 'R')]))
    expect(merged.a.v).toBe('L')
  })
  it('updatedAt 동률이면 로컬 유지(결정적)', () => {
    const merged = byId(mergeRecords([r('a', 10, 'L')], [r('a', 10, 'R')]))
    expect(merged.a.v).toBe('L')
  })
  it('tombstone도 동일 규칙 — 더 최신 삭제가 이긴다', () => {
    const merged = byId(mergeRecords([r('a', 10, 'L')], [r('a', 20, 'R', true)]))
    expect(merged.a.deleted).toBe(true)
    expect(merged.a.updatedAt).toBe(20)
  })
  it('오래된 삭제는 더 최신 수정에 진다', () => {
    const merged = byId(mergeRecords([r('a', 30, 'L')], [r('a', 20, 'R', true)]))
    expect(merged.a.deleted).toBe(false)
    expect(merged.a.v).toBe('L')
  })
  it('한쪽에만 있으면 그대로 채택', () => {
    const merged = byId(mergeRecords([r('a', 10, 'L')], [r('b', 10, 'R')]))
    expect(merged.a.v).toBe('L')
    expect(merged.b.v).toBe('R')
  })
  it('빈 배열 안전', () => {
    expect(mergeRecords<Rec>([], [])).toEqual([])
  })
})
