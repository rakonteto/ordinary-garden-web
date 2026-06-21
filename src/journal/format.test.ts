import { describe, it, expect } from 'vitest'
import { journalDateLabel, dateInputValue, parseDateInput } from './format'

// 2026-06-21 00:00 KST = 2026-06-20T15:00:00Z
const KST_2026_06_21 = Date.parse('2026-06-20T15:00:00Z')

describe('journal/format', () => {
  it('journalDateLabel: KST 월·일 한국어', () => {
    expect(journalDateLabel(KST_2026_06_21)).toBe('6월 21일')
  })
  it('dateInputValue: KST YYYY-MM-DD', () => {
    expect(dateInputValue(KST_2026_06_21)).toBe('2026-06-21')
  })
  it('parseDateInput ↔ dateInputValue round-trip', () => {
    expect(dateInputValue(parseDateInput('2026-06-21'))).toBe('2026-06-21')
  })
  it('parseDateInput: KST 자정 epoch', () => {
    expect(parseDateInput('2026-06-21')).toBe(KST_2026_06_21)
  })
})
