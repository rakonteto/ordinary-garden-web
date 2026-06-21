import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import WorkTypeChips from './WorkTypeChips'

describe('WorkTypeChips', () => {
  it('8개 칩, 선택된 것만 aria-pressed', () => {
    render(<WorkTypeChips selected={['water']} onToggle={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(8)
    expect(screen.getByRole('button', { name: '물주기' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '비료' })).toHaveAttribute('aria-pressed', 'false')
  })
  it('클릭 시 onToggle(value)', () => {
    const onToggle = vi.fn()
    render(<WorkTypeChips selected={[]} onToggle={onToggle} />)
    screen.getByRole('button', { name: '가지치기' }).click()
    expect(onToggle).toHaveBeenCalledWith('prune')
  })
})
