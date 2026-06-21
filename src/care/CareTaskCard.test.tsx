import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CareTaskCard from './CareTaskCard'
import type { CareTaskItem } from './selectors'
import type { CareRule, Plant } from '../data/types'

function item(id: string): CareTaskItem {
  const plant: Plant = { id: `p${id}`, updatedAt: 0, deleted: false, areaId: 'a1', name: `식물${id}`, isArchived: false, sortOrder: 0 }
  const rule: CareRule = { id, updatedAt: 0, deleted: false, plantId: `p${id}`, careType: 'water', intervalDays: 3, nextDueAt: 0, weatherAware: true, createdAt: 0 }
  return { rule, plant, areaName: '베란다' }
}

describe('CareTaskCard', () => {
  it('라벨·개수 표시', () => {
    render(<CareTaskCard type="water" items={[item('1'), item('2')]} advice="none" onComplete={() => {}} onSnooze={() => {}} />)
    expect(screen.getByText('물주기')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
  it('holdForRain 조언 메시지 표시', () => {
    render(<CareTaskCard type="water" items={[item('1')]} advice="holdForRain" onComplete={() => {}} onSnooze={() => {}} />)
    expect(screen.getByText(/비 예보/)).toBeInTheDocument()
  })
  it('none이면 조언 없음', () => {
    render(<CareTaskCard type="water" items={[item('1')]} advice="none" onComplete={() => {}} onSnooze={() => {}} />)
    expect(screen.queryByText(/비 예보/)).not.toBeInTheDocument()
  })
  it('행의 완료가 rule.id로 콜백', () => {
    const onComplete = vi.fn()
    render(<CareTaskCard type="water" items={[item('1')]} advice="none" onComplete={onComplete} onSnooze={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /완료/ }))
    expect(onComplete).toHaveBeenCalledWith('1')
  })
})
