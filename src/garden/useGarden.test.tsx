import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { db } from '../data/db'
import { useGarden, gardenStore } from './useGarden'

beforeEach(async () => {
  await db.areas.clear()
  await db.plants.clear()
  await db.journalPhotos.clear()
  await gardenStore.load()
})

function Probe() {
  const { areas, addArea } = useGarden()
  return (
    <div>
      <button onClick={() => void addArea('베란다')}>추가</button>
      <ul>{areas.map((a) => <li key={a.id}>{a.name}</li>)}</ul>
    </div>
  )
}

describe('useGarden', () => {
  it('addArea 후 컴포넌트가 자동 재렌더된다', async () => {
    render(<Probe />)
    await userEvent.click(screen.getByText('추가'))
    expect(await screen.findByText('베란다')).toBeInTheDocument()
  })
})
