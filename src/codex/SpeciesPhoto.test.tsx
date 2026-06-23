import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SpeciesPhoto from './SpeciesPhoto'
import { useSpeciesCoverPhotoId } from './photoStore'
import { getCcPhoto } from './ccPhotos'
import { getPhoto } from '../data/photos'
import type { JournalPhoto } from '../data/types'

vi.mock('./photoStore', () => ({ useSpeciesCoverPhotoId: vi.fn() }))
vi.mock('../data/photos', () => ({ getPhoto: vi.fn() }))
vi.mock('./ccPhotos', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./ccPhotos')>()
  return { ...actual, getCcPhoto: vi.fn() } // CC_BASE는 실제 값 유지
})

beforeEach(() => {
  vi.mocked(useSpeciesCoverPhotoId).mockReturnValue(undefined)
  vi.mocked(getCcPhoto).mockReturnValue(undefined)
  vi.mocked(getPhoto).mockResolvedValue(undefined)
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
})

describe('SpeciesPhoto', () => {
  it('내 사진·CC 모두 없으면 카테고리 이모지로 폴백', () => {
    render(<SpeciesPhoto speciesId="x" category="화훼" variant="card" alt="장미" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('🌸')).toBeInTheDocument()
  })

  it('CC만 있으면 CC 이미지를 보여주고 상세에선 출처 캡션을 단다', () => {
    vi.mocked(getCcPhoto).mockReturnValue({
      file: 'rose.jpg', author: '홍길동', license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/x',
    })
    render(<SpeciesPhoto speciesId="rose-main" category="화훼" variant="detail" alt="장미" />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('rose.jpg')
    expect(screen.getByText(/홍길동/)).toBeInTheDocument()
    expect(screen.getByText('CC BY 4.0')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/')
    expect(screen.getByRole('link', { name: '출처' })).toHaveAttribute('href', 'https://commons.wikimedia.org/x')
  })

  it('내 사진이 있으면 CC보다 우선해 blob 이미지를 보여준다', async () => {
    vi.mocked(useSpeciesCoverPhotoId).mockReturnValue('ph1')
    vi.mocked(getCcPhoto).mockReturnValue({
      file: 'rose.jpg', author: 'x', license: 'CC BY 4.0', licenseUrl: 'u', sourceUrl: 'u',
    })
    vi.mocked(getPhoto).mockResolvedValue({
      id: 'ph1', ownerId: 'species:rose-main', blob: new Blob(['x'], { type: 'image/png' }),
      updatedAt: 0, deleted: false,
    } as JournalPhoto)
    render(<SpeciesPhoto speciesId="rose-main" category="화훼" variant="card" alt="장미" />)
    const img = (await screen.findByRole('img')) as HTMLImageElement
    expect(img.src).toBe('blob:mock-url') // CC의 rose.jpg가 아님
  })

  it('내 사진 로딩 중에는 CC·이모지로 새지 않고 빈 자리를 보여준다', () => {
    vi.mocked(useSpeciesCoverPhotoId).mockReturnValue('ph1')
    vi.mocked(getCcPhoto).mockReturnValue({
      file: 'rose.jpg', author: 'x', license: 'CC BY 4.0', licenseUrl: 'u', sourceUrl: 'u',
    })
    vi.mocked(getPhoto).mockReturnValue(new Promise<undefined>(() => {})) // 영원히 pending
    const { container } = render(<SpeciesPhoto speciesId="rose-main" category="화훼" variant="card" alt="장미" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument() // CC img로 새지 않음
    expect(screen.queryByText('🌸')).not.toBeInTheDocument()  // 이모지로 새지 않음
    expect(container.querySelector('.sphoto--loading')).toBeTruthy()
  })
})
