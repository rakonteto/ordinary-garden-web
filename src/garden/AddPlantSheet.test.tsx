import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddPlantSheet from './AddPlantSheet'
import type { Area } from '../data/types'

const areas: Area[] = [
  { id: 'a1', updatedAt: 0, deleted: false, name: '베란다', sortOrder: 0 },
  { id: 'a2', updatedAt: 0, deleted: false, name: '앞마당', sortOrder: 1 },
]

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
})

describe('AddPlantSheet', () => {
  it('이름이 비면 저장이 비활성화된다', () => {
    render(<AddPlantSheet areas={areas} onClose={() => {}} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled()
  })

  it('이름·영역·광 요구도를 담아 onSubmit한다(첫 영역이 기본 선택)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<AddPlantSheet areas={areas} onClose={onClose} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('이름'), '바질')
    await userEvent.selectOptions(screen.getByLabelText('광 요구도'), 'high')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: '바질', areaId: 'a1', lightRequirement: 'high' }),
    )
    expect(onClose).toHaveBeenCalled()
  })

  it('사진을 고르면 onSubmit에 Blob(File)이 포함된다', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<AddPlantSheet areas={areas} onClose={() => {}} onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('이름'), '바질')
    const file = new File(['x'], 'p.png', { type: 'image/png' })
    await userEvent.upload(screen.getByLabelText('사진'), file)
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.photo).toBeInstanceOf(Blob)
  })
})
