import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WeatherDetail from './WeatherDetail'

describe('WeatherDetail', () => {
  it('히어로 기온과 각 섹션 제목을 보여준다', async () => {
    render(
      <MemoryRouter>
        <WeatherDetail />
      </MemoryRouter>,
    )
    expect(await screen.findByText('24°')).toBeInTheDocument()
    expect(screen.getByText('시간별 예보')).toBeInTheDocument()
    expect(screen.getByText('주간 예보')).toBeInTheDocument()
    expect(screen.getByText('미세먼지')).toBeInTheDocument()
  })
})
