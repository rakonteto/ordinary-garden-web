import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DailyForecast, { computeBounds, barStyle } from './DailyForecast'
import type { DailyPoint } from './types'

const days: DailyPoint[] = [
  { date: '2026-06-19', minC: null, maxC: 30, pop: 60, sky: 'partly' },
  { date: '2026-06-20', minC: 21, maxC: 25, pop: 60, sky: 'cloudy' },
]

describe('DailyForecast', () => {
  it('오늘 라벨과 최고기온을 보여준다', () => {
    render(<DailyForecast daily={days} today="2026-06-19" />)
    expect(screen.getByText('오늘')).toBeInTheDocument()
    expect(screen.getByText('30°')).toBeInTheDocument()
  })

  it('minC가 null이면 — 로 표시', () => {
    render(<DailyForecast daily={days} today="2026-06-19" />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('computeBounds는 전체 min/max를 구한다', () => {
    expect(computeBounds(days)).toEqual({ min: 21, max: 30 })
  })

  it('barStyle: 값 있는 날만 left/width(%) 계산, 없으면 null', () => {
    const b = { min: 20, max: 30 }
    expect(barStyle({ ...days[1] }, b)).toEqual({ left: '10%', width: '40%' })
    expect(barStyle(days[0], b)).toBeNull() // minC null
  })
})
