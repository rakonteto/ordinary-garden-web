import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CareRuleSheet from './CareRuleSheet'
import type { CareRule } from '../data/types'

describe('CareRuleSheet (추가)', () => {
  it('종류를 비료로 바꾸면 주기가 14로 시드', () => {
    render(<CareRuleSheet plantId="p1" onClose={() => {}} onAdd={() => {}} onUpdate={() => {}} onDelete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: '비료' }))
    expect((screen.getByLabelText('주기') as HTMLInputElement).value).toBe('14')
  })
  it('물주기일 때만 날씨 토글 노출', () => {
    render(<CareRuleSheet plantId="p1" onClose={() => {}} onAdd={() => {}} onUpdate={() => {}} onDelete={() => {}} />)
    expect(screen.getByText(/비 오면 물주기 미루기/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '분갈이' }))
    expect(screen.queryByText(/비 오면 물주기 미루기/)).not.toBeInTheDocument()
  })
  it('저장 → onAdd(입력)', () => {
    const onAdd = vi.fn()
    render(<CareRuleSheet plantId="p1" onClose={() => {}} onAdd={onAdd} onUpdate={() => {}} onDelete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(onAdd).toHaveBeenCalledWith({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true })
  })
})

describe('CareRuleSheet (편집)', () => {
  const rule: CareRule = { id: 'r1', updatedAt: 0, deleted: false, plantId: 'p1', careType: 'fertilize', intervalDays: 14, nextDueAt: 0, weatherAware: false, createdAt: 0 }
  it('기존 값 로드, 저장 → onUpdate', () => {
    const onUpdate = vi.fn()
    render(<CareRuleSheet plantId="p1" rule={rule} onClose={() => {}} onAdd={() => {}} onUpdate={onUpdate} onDelete={() => {}} />)
    expect((screen.getByLabelText('주기') as HTMLInputElement).value).toBe('14')
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(onUpdate).toHaveBeenCalledWith('r1', { careType: 'fertilize', intervalDays: 14, weatherAware: false })
  })
  it('편집 모드 종류 변경은 주기를 시드하지 않음', () => {
    render(<CareRuleSheet plantId="p1" rule={rule} onClose={() => {}} onAdd={() => {}} onUpdate={() => {}} onDelete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: '물주기' }))
    expect((screen.getByLabelText('주기') as HTMLInputElement).value).toBe('14')  // 그대로
  })
  it('삭제 → onDelete', () => {
    const onDelete = vi.fn()
    render(<CareRuleSheet plantId="p1" rule={rule} onClose={() => {}} onAdd={() => {}} onUpdate={() => {}} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: /삭제/ }))
    expect(onDelete).toHaveBeenCalledWith('r1')
  })
})
