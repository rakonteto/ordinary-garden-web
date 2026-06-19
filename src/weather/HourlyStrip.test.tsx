import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HourlyStrip from './HourlyStrip'
import type { HourlyPoint } from './types'

const base: HourlyPoint = { time: '2026-06-19T09:00:00+09:00', tempC: 25, pop: 30, precipType: 'none', precipMm: 0, sky: 'cloudy' }

describe('HourlyStrip', () => {
  it('첫 칸의 시각 라벨과 기온을 보여준다', () => {
    render(<HourlyStrip hourly={[base]} />)
    expect(screen.getByText('오전 9시')).toBeInTheDocument()
    expect(screen.getByText('25°')).toBeInTheDocument()
  })
  it('최대 24개로 자른다', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ ...base, time: `2026-06-19T${String(i % 24).padStart(2, '0')}:00:00+09:00` }))
    const { container } = render(<HourlyStrip hourly={many} />)
    expect(container.querySelectorAll('.hourly__col')).toHaveLength(24)
  })
})
