// store.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createSyncStore } from './store'
import type { SyncEngine } from './orchestrator'
import type { TokenProvider } from './auth'

const engine = (sync = vi.fn(async () => {})): SyncEngine => ({ sync, isSyncing: () => false })
const tokens = (over: Partial<TokenProvider> = {}): TokenProvider => ({
  getToken: async () => 't', signIn: vi.fn(async () => {}), signOut: vi.fn(() => {}), isSignedIn: () => false, ...over,
})

describe('SyncStore', () => {
  it('syncNow 성공 시 status idle + lastSyncedAt 갱신', async () => {
    const store = createSyncStore({ engine: engine(), tokens: tokens(), configured: true, clock: () => 42 })
    await store.syncNow()
    const s = store.getSnapshot()
    expect(s.status).toBe('idle')
    expect(s.lastSyncedAt).toBe(42)
    expect(s.error).toBeNull()
  })

  it('syncNow 실패 시 status error + 메시지', async () => {
    const failing = engine(vi.fn(async () => { throw new Error('네트워크') }))
    const store = createSyncStore({ engine: failing, tokens: tokens(), configured: true })
    await store.syncNow()
    expect(store.getSnapshot().status).toBe('error')
    expect(store.getSnapshot().error).toContain('네트워크')
  })

  it('signIn 성공 후 signedIn=true 되고 즉시 동기화', async () => {
    const sync = vi.fn(async () => {})
    let signed = false
    const store = createSyncStore({
      engine: engine(sync),
      tokens: tokens({ signIn: vi.fn(async () => { signed = true }), isSignedIn: () => signed }),
      configured: true,
    })
    await store.signIn()
    expect(store.getSnapshot().signedIn).toBe(true)
    expect(sync).toHaveBeenCalled()
  })

  it('configured=false면 signedIn 무관하게 동기화 비활성', async () => {
    const sync = vi.fn(async () => {})
    const store = createSyncStore({ engine: engine(sync), tokens: tokens(), configured: false })
    await store.syncNow()
    expect(store.getSnapshot().configured).toBe(false)
    expect(sync).not.toHaveBeenCalled()
    expect(store.getSnapshot().status).toBe('idle')
  })
})
