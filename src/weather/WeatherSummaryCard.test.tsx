import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import WeatherSummaryCard from './WeatherSummaryCard'

function renderCard() {
  return render(
    <MemoryRouter initialEntries={['/today']}>
      <Routes>
        <Route path="/today" element={<WeatherSummaryCard />} />
        <Route path="/weather" element={<div>상세화면</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('WeatherSummaryCard', () => {
  it('현재 기온·습도·하늘 라벨·위치를 보여준다', async () => {
    renderCard()
    expect(await screen.findByText('24°')).toBeInTheDocument()
    expect(screen.getByText('흐림')).toBeInTheDocument()
    expect(screen.getByText('77%')).toBeInTheDocument()
    expect(screen.getByText('보통의정원')).toBeInTheDocument()
  })

  it('탭하면 날씨 상세로 이동한다', async () => {
    renderCard()
    await screen.findByText('24°')
    await userEvent.click(screen.getByRole('button', { name: /날씨 상세/ }))
    expect(screen.getByText('상세화면')).toBeInTheDocument()
  })
})
