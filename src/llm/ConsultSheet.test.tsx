import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConsultSheet from './ConsultSheet'
import { saveProvider, saveBridgeToken } from './settings'
import type { Plant } from '../data/types'
import type { EntryInput } from '../journal/usePlantJournal'

vi.mock('./consult', async () => {
  const actual = await vi.importActual<typeof import('./consult')>('./consult')
  return { ...actual, runConsult: vi.fn(async () => '물을 조금 줄여 보세요.') }
})
import { runConsult } from './consult'

const NOW = Date.UTC(2026, 7, 31, 3, 0, 0)
const plant: Plant = {
  id: 'p1', updatedAt: NOW, deleted: false,
  areaId: 'a1', name: '방울토마토', isArchived: false, sortOrder: 0,
}

function renderSheet(onSaveEntry = vi.fn(async (_input: EntryInput) => {})) {
  const onClose = vi.fn()
  render(
    <ConsultSheet
      plant={plant} areaName="앞마당" entries={[]} rules={[]}
      onClose={onClose} onSaveEntry={onSaveEntry} asOfMs={NOW}
    />,
  )
  return { onClose, onSaveEntry }
}

function ask(text: string) {
  fireEvent.change(screen.getByLabelText('묻고 싶은 것'), { target: { value: text } })
}

describe('ConsultSheet — 앱이 직접 묻는 경로', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    saveProvider('bridge')
    saveBridgeToken('tok')
  })

  it('질문을 적기 전에는 물어볼 수 없다', () => {
    renderSheet()
    expect(screen.getByRole('button', { name: '물어보기' })).toBeDisabled()
  })

  it('물어보면 답을 보여 준다', async () => {
    renderSheet()
    ask('잎이 처져요')
    fireEvent.click(screen.getByRole('button', { name: '물어보기' }))

    await waitFor(() => expect(screen.getByText('물을 조금 줄여 보세요.')).toBeInTheDocument())
    expect(runConsult).toHaveBeenCalledWith(
      expect.objectContaining({ plant, question: '잎이 처져요' }),
      expect.objectContaining({ provider: 'bridge' }),
    )
  })

  it('답을 받기 전에는 일지로 저장할 수 없다', () => {
    renderSheet()
    ask('잎이 처져요')
    expect(screen.getByRole('button', { name: '일지로 저장' })).toBeDisabled()
  })

  it('답을 일지로 저장하면 질문과 답이 함께 남는다', async () => {
    const { onSaveEntry } = renderSheet()
    ask('잎이 처져요')
    fireEvent.click(screen.getByRole('button', { name: '물어보기' }))
    await waitFor(() => screen.getByText('물을 조금 줄여 보세요.'))

    fireEvent.click(screen.getByRole('button', { name: '일지로 저장' }))

    await waitFor(() => expect(onSaveEntry).toHaveBeenCalled())
    const input = onSaveEntry.mock.calls[0][0]
    expect(input.note).toMatch(/잎이 처져요/)
    expect(input.note).toMatch(/물을 조금 줄여 보세요/)
    expect(input.tags).toContain('observe')
  })

  it('실패하면 사람이 읽을 수 있는 안내를 보여 준다', async () => {
    vi.mocked(runConsult).mockRejectedValueOnce(
      Object.assign(new Error('로컬 브리지에 닿지 못했습니다.'), { hint: '브리지를 띄워 주세요.' }),
    )
    renderSheet()
    ask('잎이 처져요')
    fireEvent.click(screen.getByRole('button', { name: '물어보기' }))

    await waitFor(() => expect(screen.getByText(/닿지 못했습니다/)).toBeInTheDocument())
    expect(screen.getByText(/브리지를 띄워 주세요/)).toBeInTheDocument()
  })
})

describe('ConsultSheet — 넘기기 경로', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    saveProvider('handoff')
  })

  it('앱이 대신 묻지 않고 질문을 복사하게 한다', () => {
    renderSheet()
    expect(screen.queryByRole('button', { name: '물어보기' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '질문 복사' })).toBeInTheDocument()
  })

  it('복사하면 시스템 지시와 질문이 함께 클립보드로 간다', async () => {
    const writeText = vi.fn(async (_text: string) => {})
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    renderSheet()
    ask('잎이 처져요')
    fireEvent.click(screen.getByRole('button', { name: '질문 복사' }))

    await waitFor(() => expect(writeText).toHaveBeenCalled())
    const copied = writeText.mock.calls[0][0]
    expect(copied).toMatch(/방울토마토/)
    expect(copied).toMatch(/잎이 처져요/)
    vi.unstubAllGlobals()
  })

  it('받아 온 답을 손으로 붙여넣어 일지로 저장한다', async () => {
    const { onSaveEntry } = renderSheet()
    ask('잎이 처져요')
    fireEvent.change(screen.getByLabelText('받은 답 붙여넣기'), {
      target: { value: '흙을 만져 보고 마른 뒤에 주세요.' },
    })
    fireEvent.click(screen.getByRole('button', { name: '일지로 저장' }))

    await waitFor(() => expect(onSaveEntry).toHaveBeenCalled())
    expect(onSaveEntry.mock.calls[0][0].note).toMatch(/흙을 만져 보고/)
  })
})
