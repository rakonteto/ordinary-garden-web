import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterChips from './FilterChips'
import type { Area } from '../data/types'

const areas: Area[] = [
  { id: 'a1', updatedAt: 0, deleted: false, name: '베란다', sortOrder: 0 },
  { id: 'a2', updatedAt: 0, deleted: false, name: '앞마당', sortOrder: 1 },
]

describe('FilterChips', () => {
  it('전체 + 영역 칩을 보여준다', () => {
    render(<FilterChips areas={areas} selectedAreaId={null} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '베란다' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '앞마당' })).toBeInTheDocument()
  })

  it('선택된 칩은 aria-pressed=true다', () => {
    render(<FilterChips areas={areas} selectedAreaId="a1" onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: '베란다' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '전체' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('영역 칩을 누르면 그 id로, 전체를 누르면 null로 onSelect한다', async () => {
    const onSelect = vi.fn()
    render(<FilterChips areas={areas} selectedAreaId={null} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: '앞마당' }))
    expect(onSelect).toHaveBeenCalledWith('a2')
    await userEvent.click(screen.getByRole('button', { name: '전체' }))
    expect(onSelect).toHaveBeenCalledWith(null)
  })
})
