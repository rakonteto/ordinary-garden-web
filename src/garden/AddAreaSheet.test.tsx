import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddAreaSheet from './AddAreaSheet'

describe('AddAreaSheet', () => {
  it('이름이 비면 저장이 비활성화된다', () => {
    render(<AddAreaSheet onClose={() => {}} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('이름을 입력하고 저장하면 onSubmit(trim) 후 onClose된다', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<AddAreaSheet onClose={onClose} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('영역 이름'), '  베란다 ')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(onSubmit).toHaveBeenCalledWith('베란다')
    expect(onClose).toHaveBeenCalled()
  })
})
