import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { db } from '../data/db'
import { putPhoto } from '../data/photos'
import PlantPhoto from './PlantPhoto'

beforeEach(async () => {
  await db.journalPhotos.clear()
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
})

describe('PlantPhoto', () => {
  it('photoId가 없으면 플레이스홀더(leaf)를 보여주고 이미지를 안 만든다', () => {
    render(<PlantPhoto alt="바질" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('plant-photo-placeholder')).toBeInTheDocument()
  })

  it('photoId가 있으면 blob을 읽어 이미지를 보여준다', async () => {
    const photo = await putPhoto({ ownerId: 'p1', blob: new Blob(['x'], { type: 'image/png' }) })
    render(<PlantPhoto photoId={photo.id} alt="바질" />)
    const img = (await screen.findByRole('img')) as HTMLImageElement
    expect(img.getAttribute('src')).toBe('blob:mock-url')
    expect(img).toHaveAttribute('alt', '바질')
  })

  it('언마운트 시 생성한 object URL을 revoke한다(누수 방지)', async () => {
    const photo = await putPhoto({ ownerId: 'p1', blob: new Blob(['x'], { type: 'image/png' }) })
    const { unmount } = render(<PlantPhoto photoId={photo.id} alt="바질" />)
    await screen.findByRole('img')
    unmount()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })
})
