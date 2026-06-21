import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EditPlantSheet from './EditPlantSheet'
import type { Plant, Area } from '../data/types'

const area: Area = { id: 'a1', updatedAt: 0, deleted: false, name: '베란다', sortOrder: 0 }
const plant: Plant = { id: 'p1', updatedAt: 0, deleted: false, areaId: 'a1', name: '바질', isArchived: false, sortOrder: 0 }

describe('EditPlantSheet', () => {
  it('기존 값으로 초기화하고 수정해 저장', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<EditPlantSheet plant={plant} areas={[area]} onClose={() => {}} onSubmit={onSubmit} onArchive={vi.fn()} onDelete={vi.fn()} />)
    const name = screen.getByLabelText('이름') as HTMLInputElement
    expect(name.value).toBe('바질')
    fireEvent.change(name, { target: { value: '타임' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: '타임', areaId: 'a1' })
  })
  it('삭제는 2단계 확인을 거친다', () => {
    const onDelete = vi.fn()
    render(<EditPlantSheet plant={plant} areas={[area]} onClose={() => {}} onSubmit={vi.fn()} onArchive={vi.fn()} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: '삭제' }))
    expect(onDelete).not.toHaveBeenCalled() // 아직
    fireEvent.click(screen.getByRole('button', { name: '정말 삭제' }))
    expect(onDelete).toHaveBeenCalled()
  })
  it('심은 날짜와 메모로 초기화하고 그대로/수정해 저장', async () => {
    // KST 자정 ms: 2024-05-15 00:00:00 KST
    const plantedMs = Date.UTC(2024, 4, 15) - 9 * 3600 * 1000 // KST 자정 = UTC 2024-05-14 15:00:00
    const plantWithDateAndNote: Plant = {
      ...plant,
      datePlanted: plantedMs,
      note: '봄에 분갈이함',
    }
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <EditPlantSheet
        plant={plantWithDateAndNote}
        areas={[area]}
        onClose={() => {}}
        onSubmit={onSubmit}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    // 심은 날짜 input 초기값 확인
    const dateInput = screen.getByLabelText('심은 날짜') as HTMLInputElement
    expect(dateInput.value).toBe('2024-05-15')
    // 메모 textarea 초기값 확인
    const noteTextarea = screen.getByLabelText('메모') as HTMLTextAreaElement
    expect(noteTextarea.value).toBe('봄에 분갈이함')
    // 메모만 수정 후 저장
    fireEvent.change(noteTextarea, { target: { value: '봄에 분갈이함\n여름 물 많이 필요' } })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const submitted = onSubmit.mock.calls[0][0]
    expect(submitted).toMatchObject({
      name: '바질',
      areaId: 'a1',
      note: '봄에 분갈이함\n여름 물 많이 필요',
    })
    // 심은 날짜는 원래 ms와 동일하게 왕복 (KST 자정이면 동일)
    expect(submitted.datePlanted).toBe(plantedMs)
  })
  it('심은 날짜·메모 모두 그대로 저장', async () => {
    const plantedMs = Date.UTC(2024, 2, 10) - 9 * 3600 * 1000 // 2024-03-10
    const plantWithDateAndNote: Plant = {
      ...plant,
      datePlanted: plantedMs,
      note: '겨울을 잘 이겨냈다',
    }
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(
      <EditPlantSheet
        plant={plantWithDateAndNote}
        areas={[area]}
        onClose={() => {}}
        onSubmit={onSubmit}
        onArchive={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    // 아무것도 수정하지 않고 저장
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const submitted = onSubmit.mock.calls[0][0]
    expect(submitted).toMatchObject({
      name: '바질',
      areaId: 'a1',
      datePlanted: plantedMs,
      note: '겨울을 잘 이겨냈다',
    })
  })
})
