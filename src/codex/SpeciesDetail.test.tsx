import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SpeciesDetail from './SpeciesDetail'
import { useCodexPhotos, useSpeciesCoverPhotoId } from './photoStore'
import type { JournalPhoto } from '../data/types'

vi.mock('./photoStore', () => ({
  useCodexPhotos: vi.fn(),
  useSpeciesCoverPhotoId: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(useCodexPhotos).mockReturnValue({
    byId: new Map(), loaded: true, setSpeciesPhoto: vi.fn(), removeSpeciesPhoto: vi.fn(),
  })
  vi.mocked(useSpeciesCoverPhotoId).mockReturnValue(undefined)
})

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

  it('내 사진이 없으면 "내 사진 추가" 버튼만 보여준다', () => {
    renderDetail('yulma-main')
    expect(screen.getByText('내 사진 추가')).toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })

  it('파일을 고르면 setSpeciesPhoto(speciesId, file)를 호출한다', () => {
    const setSpy = vi.fn()
    vi.mocked(useCodexPhotos).mockReturnValue({
      byId: new Map(), loaded: true, setSpeciesPhoto: setSpy, removeSpeciesPhoto: vi.fn(),
    })
    const { container } = renderDetail('yulma-main')
    const input = container.querySelector('input[type=file]') as HTMLInputElement
    const file = new File(['x'], 'rose.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(setSpy).toHaveBeenCalledWith('yulma-main', file)
  })

  it('내 사진이 있으면 "삭제"가 removeSpeciesPhoto(speciesId)를 호출한다', () => {
    const removeSpy = vi.fn()
    const photo = { id: 'ph1' } as unknown as JournalPhoto
    vi.mocked(useCodexPhotos).mockReturnValue({
      byId: new Map([['yulma-main', photo]]),
      loaded: true, setSpeciesPhoto: vi.fn(), removeSpeciesPhoto: removeSpy,
    })
    renderDetail('yulma-main')
    fireEvent.click(screen.getByText('삭제'))
    expect(removeSpy).toHaveBeenCalledWith('yulma-main')
  })
})
