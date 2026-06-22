import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { db } from '../data/db'
import { gardenStore } from './useGarden'
import { createPlant, archivePlant } from '../data/plants'
import ArchiveView from './ArchiveView'

beforeEach(async () => {
  await db.areas.clear()
  await db.plants.clear()
  await db.journalPhotos.clear()
  await gardenStore.load()
})

describe('ArchiveView', () => {
  it('보관 식물이 없으면 빈 상태 문구를 보여준다', async () => {
    render(<MemoryRouter><ArchiveView /></MemoryRouter>)
    expect(await screen.findByText('보관한 식물이 없어요')).toBeInTheDocument()
  })

  it('보관된 식물을 목록으로 보여주고 되돌리기 버튼을 제공한다', async () => {
    const p = await createPlant({ areaId: 'a1', name: '바질' })
    await archivePlant(p.id)
    await gardenStore.load()
    render(<MemoryRouter><ArchiveView /></MemoryRouter>)
    expect(await screen.findByText('바질')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '되돌리기' })).toBeInTheDocument()
  })

  it('되돌리기를 누르면 보관함에서 빠져 빈 상태가 된다', async () => {
    const p = await createPlant({ areaId: 'a1', name: '바질' })
    await archivePlant(p.id)
    await gardenStore.load()
    render(<MemoryRouter><ArchiveView /></MemoryRouter>)
    await userEvent.click(await screen.findByRole('button', { name: '되돌리기' }))
    expect(await screen.findByText('보관한 식물이 없어요')).toBeInTheDocument()
  })

  it('내 정원으로 돌아가는 링크가 있다', async () => {
    render(<MemoryRouter><ArchiveView /></MemoryRouter>)
    expect(await screen.findByRole('link', { name: /내 정원/ })).toBeInTheDocument()
  })
})
