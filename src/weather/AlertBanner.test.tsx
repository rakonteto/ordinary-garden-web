import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AlertBanner from './AlertBanner'
import type { WeatherAlert } from './types'

describe('AlertBanner', () => {
  it('특보가 없으면 아무것도 안 그린다', () => {
    const { container } = render(<AlertBanner alerts={[]} />)
    expect(container.firstChild).toBeNull()
  })
  it('첫 특보의 제목·심각도를 보여준다', () => {
    const alerts: WeatherAlert[] = [{ category: 'rain', severity: 'warning', title: '호우경보' }]
    render(<AlertBanner alerts={alerts} />)
    expect(screen.getByText('호우경보')).toBeInTheDocument()
    expect(screen.getByText('경보')).toBeInTheDocument()
  })
  it('여러 건이면 외 N건', () => {
    const alerts: WeatherAlert[] = [
      { category: 'rain', severity: 'warning', title: '호우경보' },
      { category: 'wind', severity: 'watch', title: '강풍주의보' },
    ]
    render(<AlertBanner alerts={alerts} />)
    expect(screen.getByText(/외 1건/)).toBeInTheDocument()
  })
})
