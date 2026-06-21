/**
 * 일지 로딩 중 빈상태 플래시 방지 테스트.
 * usePlantJournal을 파일 레벨 vi.mock으로 제어해 loaded=false 상태를 시뮬레이션한다.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { db } from '../data/db'
import { createPlant } from '../data/plants'
import { createArea } from '../data/areas'
import { gardenStore } from '../garden/useGarden'
import PlantDetail from './PlantDetail'

// usePlantJournal mock: 기본값은 loaded=false(일지 로딩 중 상태)
const mockUsePlantJournal = vi.fn()
vi.mock('../journal/usePlantJournal', () => ({
  usePlantJournal: (plantId: string) => mockUsePlantJournal(plantId),
}))
vi.mock('./PlantPhoto', () => ({ default: () => <div data-testid="photo" /> }))
vi.mock('../data/photos', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/photos')>()
  return { ...actual, listPhotosByOwner: vi.fn().mockResolvedValue([]) }
})

beforeEach(async () => {
  await db.plants.clear(); await db.areas.clear(); await db.journalEntries.clear()
  await gardenStore.load()
})

function renderAt(plantId: string) {
  return render(
    <MemoryRouter initialEntries={[`/plant/${plantId}`]}>
      <Routes>
        <Route path="/plant/:id" element={<PlantDetail />} />
        <Route path="/garden" element={<div>정원</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PlantDetail — 일지 로딩 플래시 방지', () => {
  it('journalLoaded=false 동안 빈 일지 안내를 숨긴다', async () => {
    // 일지 로딩 중: entries=[], loaded=false
    mockUsePlantJournal.mockReturnValue({
      entries: [],
      loaded: false,
      addEntry: vi.fn(),
      updateEntry: vi.fn(),
      deleteEntry: vi.fn(),
    })
    const area = await createArea('베란다', 0)
    const plant = await createPlant({ areaId: area.id, name: '바질' })
    await gardenStore.load()
    renderAt(plant.id)

    // 식물 이름이 보인 뒤에도 journalLoaded=false이면 빈상태 안내가 없어야 한다
    await waitFor(() => expect(screen.getByRole('heading', { name: '바질' })).toBeInTheDocument())
    expect(screen.queryByText('첫 일지를 남겨보세요')).not.toBeInTheDocument()
  })

  it('journalLoaded=true이고 일지가 없으면 빈 일지 안내를 보여준다', async () => {
    // 일지 로딩 완료: entries=[], loaded=true
    mockUsePlantJournal.mockReturnValue({
      entries: [],
      loaded: true,
      addEntry: vi.fn(),
      updateEntry: vi.fn(),
      deleteEntry: vi.fn(),
    })
    const area = await createArea('베란다', 0)
    const plant = await createPlant({ areaId: area.id, name: '민트' })
    await gardenStore.load()
    renderAt(plant.id)

    await waitFor(() => expect(screen.getByRole('heading', { name: '민트' })).toBeInTheDocument())
    expect(screen.getByText('첫 일지를 남겨보세요')).toBeInTheDocument()
  })
})
