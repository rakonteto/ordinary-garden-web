import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CodexList from './CodexList'

function renderList() {
  return render(
    <MemoryRouter>
      <CodexList />
    </MemoryRouter>,
  )
}

describe('CodexList', () => {
  it('제목과 전체 종 수를 보여준다', () => {
    renderList()
    expect(screen.getByText('도감')).toBeTruthy()
    expect(screen.getByText(/^\d+종$/)).toBeTruthy()
  })

  it('검색하면 결과가 좁혀진다 (율마)', () => {
    renderList()
    fireEvent.change(screen.getByLabelText('식물 검색'), { target: { value: '율마' } })
    expect(screen.getByText('율마')).toBeTruthy()
  })

  it('없는 검색어는 빈 상태를 보여준다', () => {
    renderList()
    fireEvent.change(screen.getByLabelText('식물 검색'), { target: { value: 'zzz없는식물' } })
    expect(screen.getByText('검색 결과가 없어요')).toBeTruthy()
  })

  it('카테고리 칩을 누르면 선택 상태가 된다', () => {
    renderList()
    const chip = screen.getByRole('button', { name: /다육/ })
    fireEvent.click(chip)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
  })
})
