import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AreaSection from './AreaSection'
import type { Plant } from '../data/types'

function plant(name: string): Plant {
  return { id: name, updatedAt: 0, deleted: false, areaId: 'a1', name, isArchived: false, sortOrder: 0 }
}

describe('AreaSection', () => {
  it('제목과 식물 개수를 보여준다', () => {
    render(<AreaSection title="베란다" plants={[plant('바질'), plant('민트')]} />)
    expect(screen.getByText('베란다')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('바질')).toBeInTheDocument()
    expect(screen.getByText('민트')).toBeInTheDocument()
  })

  it('식물이 없으면 빈 안내를 보여준다', () => {
    render(<AreaSection title="앞마당" plants={[]} />)
    expect(screen.getByText('아직 식물이 없어요')).toBeInTheDocument()
  })
})
