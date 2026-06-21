import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CareRuleRow from './CareRuleRow'
import { startOfDayKST } from './scheduler'
import type { CareRule } from '../data/types'

function rule(over: Partial<CareRule> = {}): CareRule {
  return { id: 'r1', updatedAt: 0, deleted: false, plantId: 'p1', careType: 'water', intervalDays: 3, nextDueAt: startOfDayKST(Date.now()), weatherAware: true, createdAt: 0, ...over }
}

describe('CareRuleRow', () => {
  it('라벨·n일마다·오늘 D-day 표시', () => {
    render(<CareRuleRow rule={rule()} onEdit={() => {}} />)
    expect(screen.getByText('물주기')).toBeInTheDocument()
    expect(screen.getByText('3일마다')).toBeInTheDocument()
    expect(screen.getByText('오늘')).toBeInTheDocument()
  })
  it('탭 → onEdit', () => {
    const onEdit = vi.fn()
    render(<CareRuleRow rule={rule()} onEdit={onEdit} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onEdit).toHaveBeenCalledOnce()
  })
})
