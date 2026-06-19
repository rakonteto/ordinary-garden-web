import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '../data/db'
import { gardenStore } from './useGarden'
import GardenView from './GardenView'

beforeEach(async () => {
  await db.areas.clear()
  await db.plants.clear()
  await db.journalPhotos.clear()
  await gardenStore.load()
})

describe('GardenView', () => {
  it('영역이 없으면 빈 상태를 보여준다', async () => {
    render(<GardenView />)
    expect(await screen.findByText('정원에 영역을 추가해보세요')).toBeInTheDocument()
  })

  it('빈 상태에서 영역을 추가하면 필터칩과 섹션이 나타난다', async () => {
    render(<GardenView />)
    await userEvent.click(await screen.findByRole('button', { name: '영역 추가' }))
    await userEvent.type(screen.getByLabelText('영역 이름'), '베란다')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByRole('button', { name: '베란다' })).toBeInTheDocument()
  })

  it('영역이 있으면 FAB로 식물을 추가해 카드가 나타난다', async () => {
    await gardenStore.addArea('베란다')
    render(<GardenView />)
    await userEvent.click(await screen.findByRole('button', { name: '식물 추가' }))
    await userEvent.type(screen.getByLabelText('이름'), '바질')
    await userEvent.click(screen.getByRole('button', { name: '저장' }))
    expect(await screen.findByText('바질')).toBeInTheDocument()
  })
})
