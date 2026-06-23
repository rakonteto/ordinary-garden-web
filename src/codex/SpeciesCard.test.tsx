import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { db } from '../data/db'
import SpeciesCard from './SpeciesCard'
import type { CodexSpecies } from './types'

const species: CodexSpecies = {
  id: 'rose-main', genus: '장미', name: '장미', scientificName: 'Rosa',
  category: '화훼', form: '관목', hardiness: 'x', soil: 'x', water: 'x',
  light: 'x', care: 'x', pest: 'x', season: 'x', tip: 'x',
}

beforeEach(async () => {
  await db.journalPhotos.clear()
})

describe('SpeciesCard', () => {
  it('사진이 없으면 SpeciesPhoto가 카테고리 이모지로 폴백하고 상세로 링크한다', () => {
    const { container } = render(
      <MemoryRouter>
        <SpeciesCard species={species} />
      </MemoryRouter>,
    )
    expect(screen.getByText('🌸')).toBeInTheDocument()
    // SpeciesPhoto 적용 후에만 존재(기존 .scard__emoji가 아님) → 통합 전엔 실패(red).
    expect(container.querySelector('.sphoto--emoji')).toBeTruthy()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/codex/rose-main')
  })
})
