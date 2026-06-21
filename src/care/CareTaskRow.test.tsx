import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CareTaskRow from './CareTaskRow'
import type { CareTaskItem } from './selectors'
import type { CareRule, Plant } from '../data/types'

const plant: Plant = { id: 'p1', updatedAt: 0, deleted: false, areaId: 'a1', name: '바질이', isArchived: false, sortOrder: 0 }
const rule: CareRule = { id: 'r1', updatedAt: 0, deleted: false, plantId: 'p1', careType: 'water', intervalDays: 3, nextDueAt: 0, weatherAware: true, createdAt: 0 }
const item: CareTaskItem = { rule, plant, areaName: '베란다' }

describe('CareTaskRow', () => {
  it('식물명·영역 표시', () => {
    render(<CareTaskRow item={item} onComplete={() => {}} onSnooze={() => {}} />)
    expect(screen.getByText('바질이')).toBeInTheDocument()
    expect(screen.getByText('베란다')).toBeInTheDocument()
  })
  it('체크 클릭 → onComplete', () => {
    const onComplete = vi.fn()
    render(<CareTaskRow item={item} onComplete={onComplete} onSnooze={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /완료/ }))
    expect(onComplete).toHaveBeenCalledOnce()
  })
  it('스누즈 클릭 → onSnooze', () => {
    const onSnooze = vi.fn()
    render(<CareTaskRow item={item} onComplete={() => {}} onSnooze={onSnooze} />)
    fireEvent.click(screen.getByRole('button', { name: /미루기/ }))
    expect(onSnooze).toHaveBeenCalledOnce()
  })
})
