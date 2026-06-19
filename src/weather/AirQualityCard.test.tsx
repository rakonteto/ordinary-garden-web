import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AirQualityCard from './AirQualityCard'
import type { AirQuality } from './types'

const aq: AirQuality = { pm10: 23, pm10Grade: 1, pm25: 18, pm25Grade: 1, khai: 50, khaiGrade: 1 }

describe('AirQualityCard', () => {
  it('PM10/PM2.5/통합지수 값과 등급을 보여준다', () => {
    render(<AirQualityCard airQuality={aq} />)
    expect(screen.getByText('23')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getAllByText('좋음').length).toBe(3)
  })
  it('값이 없으면 —', () => {
    render(<AirQualityCard airQuality={{ pm10: null, pm10Grade: null, pm25: null, pm25Grade: null, khai: null, khaiGrade: null }} />)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3)
  })
})
