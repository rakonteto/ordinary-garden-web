import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sheet from './Sheet'

function setup(canSave = true) {
  const onClose = vi.fn()
  const onSave = vi.fn()
  render(
    <Sheet title="영역 추가" onClose={onClose} onSave={onSave} canSave={canSave}>
      <p>본문</p>
    </Sheet>,
  )
  return { onClose, onSave }
}

describe('Sheet', () => {
  it('제목과 본문을 보여준다', () => {
    setup()
    expect(screen.getByRole('dialog', { name: '영역 추가' })).toBeInTheDocument()
    expect(screen.getByText('본문')).toBeInTheDocument()
  })

  it('취소를 누르면 onClose', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByRole('button', { name: '취소' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('저장을 누르면 onSave', async () => {
    const { onSave } = setup()
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(onSave).toHaveBeenCalled()
  })

  it('canSave=false면 저장이 비활성화된다', () => {
    setup(false)
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('Escape를 누르면 onClose', async () => {
    const { onClose } = setup()
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('내부 클릭은 닫지 않고, 백드롭 클릭은 닫는다', async () => {
    const { onClose } = setup()
    await userEvent.click(screen.getByText('본문'))
    expect(onClose).not.toHaveBeenCalled()
    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalled()
  })
})
