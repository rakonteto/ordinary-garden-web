import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PlantCard from './PlantCard'
import type { Plant } from '../data/types'

function plant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: 'p1',
    updatedAt: 0,
    deleted: false,
    areaId: 'a1',
    name: '바질',
    isArchived: false,
    sortOrder: 0,
    ...overrides,
  }
}

describe('PlantCard', () => {
  it('이름과 광 요구도 라벨을 보여준다', () => {
    render(<MemoryRouter><PlantCard plant={plant({ lightRequirement: 'high' })} /></MemoryRouter>)
    expect(screen.getByText('바질')).toBeInTheDocument()
    expect(screen.getByText('양지')).toBeInTheDocument()
  })

  it('광 요구도가 없으면 라벨을 표시하지 않는다', () => {
    render(<MemoryRouter><PlantCard plant={plant()} /></MemoryRouter>)
    expect(screen.queryByText('양지')).not.toBeInTheDocument()
    expect(screen.queryByText('반양지')).not.toBeInTheDocument()
    expect(screen.queryByText('음지')).not.toBeInTheDocument()
  })

  it('사진이 없으면 플레이스홀더를 보여준다', () => {
    render(<MemoryRouter><PlantCard plant={plant()} /></MemoryRouter>)
    expect(screen.getByTestId('plant-photo-placeholder')).toBeInTheDocument()
  })

  it('카드는 상세로 가는 링크다', () => {
    render(<MemoryRouter><PlantCard plant={plant()} /></MemoryRouter>)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/plant/p1')
  })
})
