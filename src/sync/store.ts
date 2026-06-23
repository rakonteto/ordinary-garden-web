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
      console.error('[sync] 동기화 실패:', e)
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
        await deps.tokens.getToken() // cache-only: 저장된 유효 토큰 있으면 성공, 없으면 throw(팝업 없음)
        set({ signedIn: deps.tokens.isSignedIn(), error: null })
        if (deps.tokens.isSignedIn()) await runSync()
      } catch {
        // 저장 토큰 없음/만료 → 조용히 미로그인 유지(로그인 버튼). 콜드스타트 팝업 금지.
      }
    },
  }
}
