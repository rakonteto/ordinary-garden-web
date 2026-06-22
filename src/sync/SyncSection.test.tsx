import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockState = { status: 'idle', lastSyncedAt: null, signedIn: false, configured: true, error: null,
  syncNow: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }
vi.mock('./useSync', () => ({ useSync: () => mockState }))

import SyncSection from './SyncSection'

describe('SyncSection', () => {
  it('미로그인이면 로그인 버튼 노출', () => {
    Object.assign(mockState, { signedIn: false, configured: true })
    render(<SyncSection />)
    expect(screen.getByRole('button', { name: /로그인/ })).toBeInTheDocument()
  })
  it('로그인이면 지금 동기화·로그아웃 노출', () => {
    Object.assign(mockState, { signedIn: true, configured: true })
    render(<SyncSection />)
    expect(screen.getByRole('button', { name: /지금 동기화/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /로그아웃/ })).toBeInTheDocument()
  })
  it('미설정이면 안내 문구', () => {
    Object.assign(mockState, { configured: false, signedIn: false })
    render(<SyncSection />)
    expect(screen.getByText(/동기화 미설정/)).toBeInTheDocument()
  })
})
