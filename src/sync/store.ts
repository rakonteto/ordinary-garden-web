import type { SyncEngine } from './orchestrator'
import type { TokenProvider } from './auth'

export type SyncStatus = 'idle' | 'syncing' | 'error'
export interface SyncState {
  status: SyncStatus
  lastSyncedAt: number | null
  signedIn: boolean
  configured: boolean
  error: string | null
}
export interface SyncStore {
  getSnapshot(): SyncState
  subscribe(listener: () => void): () => void
  syncNow(): Promise<void>
  signIn(): Promise<void>
  signOut(): void
  trySilentSignIn(): Promise<void>
}

export interface SyncStoreDeps {
  engine: SyncEngine
  tokens: TokenProvider
  configured: boolean
  clock?: () => number
}

export function createSyncStore(deps: SyncStoreDeps): SyncStore {
  const clock = deps.clock ?? Date.now
  let state: SyncState = {
    status: 'idle', lastSyncedAt: null, signedIn: deps.tokens.isSignedIn(),
    configured: deps.configured, error: null,
  }
  const listeners = new Set<() => void>()
  function set(patch: Partial<SyncState>) {
    state = { ...state, ...patch }
    listeners.forEach((l) => l())
  }

  async function runSync() {
    if (!deps.configured) return
    set({ status: 'syncing', error: null })
    try {
      await deps.engine.sync()
      set({ status: 'idle', lastSyncedAt: clock() })
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) { listeners.add(listener); return () => void listeners.delete(listener) },
    syncNow: runSync,
    async signIn() {
      try {
        await deps.tokens.signIn()
        set({ signedIn: deps.tokens.isSignedIn(), error: null })
        await runSync()
      } catch (e) {
        set({ status: 'error', error: e instanceof Error ? e.message : String(e) })
      }
    },
    signOut() {
      deps.tokens.signOut()
      set({ signedIn: false, lastSyncedAt: null })
    },
    async trySilentSignIn() {
      if (!deps.configured) return
      try {
        await deps.tokens.getToken() // 무프롬프트(prompt:'') — 세션 있으면 팝업 없이 성공
        set({ signedIn: deps.tokens.isSignedIn(), error: null })
        if (deps.tokens.isSignedIn()) await runSync()
      } catch {
        // 세션 없음/차단 → 조용히 미로그인 유지(로그인 버튼). un-gestured consent 금지.
      }
    },
  }
}
