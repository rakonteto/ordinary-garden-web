import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import fireEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { db } from '../data/db'
import { createPlant } from '../data/plants'
import { createArea } from '../data/areas'
import { gardenStore } from '../garden/useGarden'
import PlantDetail from './PlantDetail'

vi.mock('./PlantPhoto', () => ({ default: () => <div data-testid="photo" /> }))
vi.mock('../data/photos', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/photos')>()
  return { ...actual, listPhotosByOwner: vi.fn().mockResolvedValue([]) }
})

beforeEach(async () => {
  await db.plants.clear(); await db.areas.clear(); await db.journalEntries.clear()
  await gardenStore.load()
})

async function renderAt(plantId: string) {
  return render(
    <MemoryRouter initialEntries={[`/plant/${plantId}`]}>
      <Routes>
        <Route path="/plant/:id" element={<PlantDetail />} />
        <Route path="/garden" element={<div>정원</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PlantDetail', () => {
  it('식물 이름·영역과 빈 일지 안내를 보여준다', async () => {
    const area = await createArea('베란다', 0)
    const plant = await createPlant({ areaId: area.id, name: '바질' })
    await gardenStore.load()
    await renderAt(plant.id)
    await waitFor(() => expect(screen.getByRole('heading', { name: '바질' })).toBeInTheDocument())
    expect(screen.getByText('베란다')).toBeInTheDocument()
    expect(screen.getByText('첫 일지를 남겨보세요')).toBeInTheDocument()
  })

  it('존재하지 않는 식물 id로 접근하면 "식물을 찾을 수 없어요"를 표시한다', async () => {
    // db에 해당 id 식물 없음 — gardenStore.load()는 beforeEach에서 이미 호출
    await renderAt('nonexistent-plant-id')
    await waitFor(() =>
      expect(screen.getByText('식물을 찾을 수 없어요')).toBeInTheDocument(),
    )
  })

  it('보관 버튼 클릭 후 /garden으로 이동한다', async () => {
    const area = await createArea('텃밭', 0)
    const plant = await createPlant({ areaId: area.id, name: '상추' })
    await gardenStore.load()
    await renderAt(plant.id)

    // 식물 이름이 렌더된 뒤 편집 버튼 클릭
    await waitFor(() => expect(screen.getByRole('heading', { name: '상추' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '식물 편집' }))

    // EditPlantSheet 열림 확인 후 보관 클릭
    await waitFor(() => expect(screen.getByText('보관')).toBeInTheDocument())
    fireEvent.click(screen.getByText('보관'))

    // /garden route로 이동했는지 확인
    await waitFor(() => expect(screen.getByText('정원')).toBeInTheDocument())
  })

  it('일지 추가 버튼 클릭 시 JournalEntrySheet(일지 작성)가 표시된다', async () => {
    const area = await createArea('베란다', 0)
    const plant = await createPlant({ areaId: area.id, name: '토마토' })
    await gardenStore.load()
    await renderAt(plant.id)

    // 식물 이름이 렌더된 뒤 일지 추가 버튼(+) 클릭
    await waitFor(() => expect(screen.getByRole('heading', { name: '토마토' })).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: '일지 추가' }))

    // JournalEntrySheet 타이틀 "일지 작성" 확인
    await waitFor(() =>
      expect(screen.getByText('일지 작성')).toBeInTheDocument(),
    )
  })
})
