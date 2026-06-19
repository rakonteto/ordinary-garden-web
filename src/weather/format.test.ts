import { describe, it, expect } from 'vitest'
import {
  tempString,
  percentString,
  mmString,
  windString,
  relativeFreshness,
  hourLabel,
  weekdayLabel,
  todayKSTDate,
} from './format'

describe('format', () => {
  it('tempString: 반올림 정수, 미상은 —', () => {
    expect(tempString(24.4)).toBe('24')
    expect(tempString(24.6)).toBe('25')
    expect(tempString(null)).toBe('—')
  })
  it('percentString', () => {
    expect(percentString(30)).toBe('30%')
    expect(percentString(null)).toBe('—')
  })
  it('mmString: 0은 0mm, 소수 1자리', () => {
    expect(mmString(0)).toBe('0mm')
    expect(mmString(1.2)).toBe('1.2mm')
    expect(mmString(null)).toBe('—')
  })
  it('windString: 소수1 + ㎧', () => {
    expect(windString(0.6)).toBe('0.6㎧')
    expect(windString(null)).toBe('—')
  })

  it('relativeFreshness: 분/시간/일 경계', () => {
    const now = Date.parse('2026-06-19T00:00:00.000Z')
    expect(relativeFreshness('2026-06-19T00:00:30.000Z', now)).toBe('방금 전') // 30초
    expect(relativeFreshness('2026-06-18T23:59:00.000Z', now)).toBe('1분 전')
    expect(relativeFreshness('2026-06-18T23:00:00.000Z', now)).toBe('1시간 전')
    expect(relativeFreshness('2026-06-17T00:00:00.000Z', now)).toBe('2일 전')
    expect(relativeFreshness('2026-06-19T00:05:00.000Z', now)).toBe('방금 전') // 미래
    expect(relativeFreshness('garbage', now)).toBe('—')
  })

  it('hourLabel: 오전/오후 12시간(+09:00 로컬 시각 사용)', () => {
    expect(hourLabel('2026-06-19T09:00:00+09:00')).toBe('오전 9시')
    expect(hourLabel('2026-06-19T15:00:00+09:00')).toBe('오후 3시')
    expect(hourLabel('2026-06-19T00:00:00+09:00')).toBe('오전 12시')
    expect(hourLabel('2026-06-19T12:00:00+09:00')).toBe('오후 12시')
  })

  it('weekdayLabel: 오늘 또는 한글 요일', () => {
    expect(weekdayLabel('2026-06-19', '2026-06-19')).toBe('오늘')
    expect(weekdayLabel('2026-06-19', '2026-06-18')).toBe('금') // 2026-06-19 = 금요일
    expect(weekdayLabel('2026-06-20', '2026-06-19')).toBe('토')
  })

  it('todayKSTDate: epoch ms → KST 날짜', () => {
    // 2026-06-18T23:27:59Z = KST 2026-06-19 08:27
    expect(todayKSTDate(Date.parse('2026-06-18T23:27:59.000Z'))).toBe('2026-06-19')
  })
})
