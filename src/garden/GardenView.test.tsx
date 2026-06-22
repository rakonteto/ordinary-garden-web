import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { db } from '../data/db'
import { gardenStore } from './useGarden'
import { createPlant, archivePlant } from '../data/plants'
import GardenView from './GardenView'

beforeEach(async () => {
  await db.areas.clear()
  await db.plants.clear()
  await db.journalPhotos.clear()
  await gardenStore.load()
})

describe('GardenView', () => {
  it('영역이 없으면 빈 상태를 보여준다', async () => {
    render(<MemoryRouter><GardenView /></MemoryRouter>)
    expect(await screen.findByText('정원에 영역을 추가해보세요')).toBeInTheDocument()
  })

  it('빈 상태에서 영역을 추가하면 필터칩과 섹션이 나타난다', async () => {
    render(<MemoryRouter><GardenView /></MemoryRouter>)
    await userEvent.click(await screen.findByRole('button', { name: '영역 추가' }))
    await userEvent.type(screen.getByLabelText('영역 이름'), '베란다')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByRole('button', { name: '베란다' })).toBeInTheDocument()
  })

  it('영역이 있으면 FAB로 식물을 추가해 카드가 나타난다', async () => {
    await gardenStore.addArea('베란다')
    render(<MemoryRouter><GardenView /></MemoryRouter>)
    await userEvent.click(await screen.findByRole('button', { name: '식물 추가' }))
    await userEvent.type(screen.getByLabelText('이름'), '바질')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByText('바질')).toBeInTheDocument()
  })

  it('보관 식물이 있으면 보관함 진입점을 보여준다', async () => {
    await gardenStore.addArea('베란다')
    const area = gardenStore.getSnapshot().areas[0]
    const p = await createPlant({ areaId: area.id, name: '바질' })
    await archivePlant(p.id)
    await gardenStore.load()
    render(<MemoryRouter><GardenView /></MemoryRouter>)
    expect(await screen.findByRole('link', { name: /보관함 1개/ })).toBeInTheDocument()
  })

  it('보관 식물이 없으면 보관함 진입점을 숨긴다', async () => {
    await gardenStore.addArea('베란다')
    render(<MemoryRouter><GardenView /></MemoryRouter>)
    await screen.findByRole('button', { name: '식물 추가' }) // 로드 완료 대기
    expect(screen.queryByText(/보관함/)).not.toBeInTheDocument()
  })
})
