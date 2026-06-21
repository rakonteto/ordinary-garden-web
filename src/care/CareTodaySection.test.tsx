import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { CareRule, Plant, Area } from '../data/types'

const complete = vi.fn()
const snooze = vi.fn()
let rules: CareRule[] = []
const plants: Plant[] = [{ id: 'p1', updatedAt: 0, deleted: false, areaId: 'a1', name: '바질이', isArchived: false, sortOrder: 0 }]
const areas: Area[] = [{ id: 'a1', updatedAt: 0, deleted: false, name: '베란다', sortOrder: 0 }]

vi.mock('./useCare', () => ({ useCare: () => ({ rules, loaded: true, complete, snooze, addRule: vi.fn(), updateRule: vi.fn(), deleteRule: vi.fn() }) }))
vi.mock('../garden/useGarden', () => ({ useGarden: () => ({ plants, areas, loaded: true }) }))
vi.mock('../weather/useWeather', () => ({ useWeather: () => ({ bundle: null, isRefreshing: false, error: null }) }))

import CareTodaySection from './CareTodaySection'

beforeEach(() => { rules = []; complete.mockClear(); snooze.mockClear() })

function waterRule(): CareRule {
  return { id: 'r1', updatedAt: 0, deleted: false, plantId: 'p1', careType: 'water', intervalDays: 3, nextDueAt: 0, weatherAware: false, createdAt: 0 }
}

describe('CareTodaySection', () => {
  it('due 없으면 빈 문구', () => {
    render(<CareTodaySection />)
    expect(screen.getByText('오늘 할 일이 없어요')).toBeInTheDocument()
  })
  it('due 있으면 카드 렌더 + 완료 콜백', () => {
    rules = [waterRule()]   // nextDueAt 0 = 과거 → 오늘까지 due
    render(<CareTodaySection />)
    expect(screen.getByText('물주기')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /완료/ }))
    expect(complete).toHaveBeenCalledWith('r1')
  })
  it('예정 토글 시 예정 문구', () => {
    render(<CareTodaySection />)
    fireEvent.click(screen.getByRole('button', { name: '예정' }))
    expect(screen.getByText('예정된 케어가 없어요')).toBeInTheDocument()
  })
})
