import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import JournalEntryCard from './JournalEntryCard'
import type { JournalEntry } from '../data/types'

vi.mock('../data/photos', () => ({ listPhotosByOwner: vi.fn().mockResolvedValue([]) }))

const entry: JournalEntry = {
  id: 'e1', updatedAt: 0, deleted: false, plantId: 'p1',
  date: Date.parse('2026-06-20T15:00:00Z'), note: '새 잎', tags: ['water', 'observe'],
  weatherSnapshot: { tempC: 21, feelsLikeC: 20, humidity: 60, sky: 'cloudy', precipType: 'none', airGrade: 2, capturedAt: 0 },
}

describe('JournalEntryCard', () => {
  it('날짜·태그·메모·날씨 요약을 보여준다', () => {
    render(<JournalEntryCard entry={entry} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('6월 21일')).toBeInTheDocument()
    expect(screen.getByText('물주기')).toBeInTheDocument()
    expect(screen.getByText('관찰')).toBeInTheDocument()
    expect(screen.getByText('새 잎')).toBeInTheDocument()
    expect(screen.getByText('21° 흐림 · 미세먼지 보통')).toBeInTheDocument()
  })
  it('편집 버튼이 onEdit를 부른다', () => {
    const onEdit = vi.fn()
    render(<JournalEntryCard entry={entry} onEdit={onEdit} onDelete={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: '일지 편집' }))
    expect(onEdit).toHaveBeenCalled()
  })
  it('삭제 버튼이 onDelete를 부른다', () => {
    const onDelete = vi.fn()
    render(<JournalEntryCard entry={entry} onEdit={() => {}} onDelete={onDelete} />)
    fireEvent.click(screen.getByRole('button', { name: '일지 삭제' }))
    expect(onDelete).toHaveBeenCalled()
  })
})
