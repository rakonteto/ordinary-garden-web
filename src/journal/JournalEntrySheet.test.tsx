import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import JournalEntrySheet from './JournalEntrySheet'

beforeEach(() => { vi.restoreAllMocks() })

describe('JournalEntrySheet', () => {
  it('빈 입력이면 저장 비활성, 메모를 쓰면 활성', () => {
    render(<JournalEntrySheet defaultDate={0} onClose={() => {}} onSubmit={vi.fn()} />)
    const save = screen.getByRole('button', { name: '저장' })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('메모'), { target: { value: '새 잎이 났다' } })
    expect(save).toBeEnabled()
  })
  it('편집 모드에서 메모를 지우고 태그·사진도 없으면 저장 비활성', () => {
    const existingEntry = {
      id: 'e1',
      updatedAt: 0,
      deleted: false,
      plantId: 'p1',
      date: 0,
      note: '기존 메모',
      tags: [] as string[],
    }
    render(
      <JournalEntrySheet
        entry={existingEntry as import('../data/types').JournalEntry}
        defaultDate={0}
        onClose={() => {}}
        onSubmit={vi.fn()}
      />
    )
    const save = screen.getByRole('button', { name: '저장' })
    // 편집 모드 진입 시 기존 note로 초기화 → 저장 활성
    expect(save).toBeEnabled()
    // 메모를 비우면(태그·사진 없음) 저장 비활성
    fireEvent.change(screen.getByLabelText('메모'), { target: { value: '' } })
    expect(save).toBeDisabled()
  })
  it('태그 선택만으로도 저장 가능, onSubmit에 input 전달', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<JournalEntrySheet defaultDate={123} onClose={() => {}} onSubmit={onSubmit} />)
    // fireEvent.click은 내부적으로 act()로 감싸 상태 업데이트를 flush한다 → 프로덕션 flushSync 불필요
    fireEvent.click(screen.getByRole('button', { name: '물주기' }))
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const [input, replacePhotos] = onSubmit.mock.calls[0]
    expect(input.tags).toEqual(['water'])
    expect(replacePhotos).toBe(false)
  })
})
