import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SegmentedToggle from './SegmentedToggle'

describe('SegmentedToggle', () => {
  it('선택된 옵션이 aria-pressed', () => {
    render(<SegmentedToggle options={['오늘', '예정']} value={0} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '오늘' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '예정' })).toHaveAttribute('aria-pressed', 'false')
  })
  it('클릭 시 onChange(index)', () => {
    const onChange = vi.fn()
    render(<SegmentedToggle options={['오늘', '예정']} value={0} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '예정' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })
})
