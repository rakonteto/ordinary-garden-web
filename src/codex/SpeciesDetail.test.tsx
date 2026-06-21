import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SpeciesDetail from './SpeciesDetail'

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/codex/${id}`]}>
      <Routes>
        <Route path="/codex/:speciesId" element={<SpeciesDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SpeciesDetail', () => {
  it('종 이름과 재배 필드를 보여준다 (율마)', () => {
    renderDetail('yulma-main')
    expect(screen.getByText('율마')).toBeTruthy()
    expect(screen.getByText(/내한성·월동/)).toBeTruthy()
  })

  it('품종(종 정보 상속)을 보여준다 — 페페로미아의 아몬드페페', () => {
    renderDetail('peperomia-main')
    expect(screen.getByText('품종')).toBeTruthy()
    expect(screen.getByText('아몬드페페')).toBeTruthy()
  })

  it('없는 id는 안내 문구를 보여준다', () => {
    renderDetail('존재하지않는id')
    expect(screen.getByText('찾는 식물이 없어요.')).toBeTruthy()
  })
})
