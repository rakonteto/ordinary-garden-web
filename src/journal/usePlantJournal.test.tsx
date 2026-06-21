import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { renderHook, act, waitFor } from '@testing-library/react'
import { db } from '../data/db'
import { usePlantJournal } from './usePlantJournal'

beforeEach(async () => {
  await db.journalEntries.clear()
  await db.journalPhotos.clear()
})

describe('usePlantJournal', () => {
  it('addEntry 후 목록에 최신순으로 반영된다', async () => {
    const { result } = renderHook(() => usePlantJournal('p1'))
    await waitFor(() => expect(result.current.loaded).toBe(true))
    await act(async () => {
      await result.current.addEntry({ date: 100, note: '첫 기록', tags: ['water'] })
      await result.current.addEntry({ date: 200, note: '둘째', tags: [] })
    })
    expect(result.current.entries.map((e) => e.note)).toEqual(['둘째', '첫 기록'])
  })
  it('deleteEntry 후 목록서 빠진다', async () => {
    const { result } = renderHook(() => usePlantJournal('p1'))
    await waitFor(() => expect(result.current.loaded).toBe(true))
    await act(async () => { await result.current.addEntry({ date: 100, note: 'x', tags: [] }) })
    const id = result.current.entries[0].id
    await act(async () => { await result.current.deleteEntry(id) })
    expect(result.current.entries).toEqual([])
  })
  it('updateEntry 후 엔트리 필드가 수정된다 (사진 미교체)', async () => {
    const { result } = renderHook(() => usePlantJournal('p1'))
    await waitFor(() => expect(result.current.loaded).toBe(true))
    // 엔트리 생성
    await act(async () => {
      await result.current.addEntry({ date: 100, note: '첫 메모', tags: ['water'] })
    })
    const id = result.current.entries[0].id
    // 엔트리 수정 (사진 미교체, 메모만 변경)
    await act(async () => {
      await result.current.updateEntry(id, { date: 150, note: '수정된 메모', tags: ['prune'] }, false)
    })
    expect(result.current.entries[0].date).toBe(150)
    expect(result.current.entries[0].note).toBe('수정된 메모')
    expect(result.current.entries[0].tags).toEqual(['prune'])
  })
})
