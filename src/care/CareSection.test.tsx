import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { CareRule } from '../data/types'

const addRule = vi.fn()
let rules: CareRule[] = []
let careLoaded = true
vi.mock('./useCare', () => ({ useCare: () => ({ rules, loaded: careLoaded, addRule, updateRule: vi.fn(), deleteRule: vi.fn() }) }))

import CareSection from './CareSection'

beforeEach(() => { rules = []; careLoaded = true; addRule.mockClear() })

function rule(id: string, plantId = 'p1'): CareRule {
  return { id, updatedAt: 0, deleted: false, plantId, careType: 'water', intervalDays: 3, nextDueAt: 0, weatherAware: true, createdAt: 0 }
}

describe('CareSection', () => {
  it('규칙 없으면 빈 문구', () => {
    render(<CareSection plantId="p1" />)
    expect(screen.getByText('케어 일정을 추가해보세요')).toBeInTheDocument()
  })
  it('loaded=false이면 빈 문구 안 보임(플래시 방지)', () => {
    careLoaded = false
    render(<CareSection plantId="p1" />)
    expect(screen.queryByText('케어 일정을 추가해보세요')).not.toBeInTheDocument()
  })
  it('해당 식물 규칙만 표시', () => {
    rules = [rule('r1', 'p1'), rule('r2', 'p2')]
    render(<CareSection plantId="p1" />)
    expect(screen.getAllByText('물주기')).toHaveLength(1)
  })
  it('추가 버튼 → 시트 열림(저장 시 addRule)', () => {
    render(<CareSection plantId="p1" />)
    fireEvent.click(screen.getByRole('button', { name: '케어 추가' }))
    fireEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(addRule).toHaveBeenCalledWith({ plantId: 'p1', careType: 'water', intervalDays: 3, weatherAware: true })
  })
})
