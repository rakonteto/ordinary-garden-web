import { useSyncExternalStore } from 'react'
import { createSyncStore, type SyncState } from './store'
import { createGisTokenProvider } from './auth'
import { createDriveClient } from './drive'
import { createSyncEngine } from './orchestrator'
import { gardenStore } from '../garden/useGarden'
import { careStore } from '../care/useCare'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const configured = Boolean(clientId)

// configured일 때만 실제 토큰/드라이브/엔진을 구성. 아니면 no-op 토큰으로 비활성 상태.
const tokens = configured
  ? createGisTokenProvider(clientId!)
  : { getToken: async () => { throw new Error('미설정') }, signIn: async () => {}, signOut: () => {}, isSignedIn: () => false }

const engine = createSyncEngine({
  drive: createDriveClient(tokens),
  onChanged: async () => { await Promise.all([gardenStore.load(), careStore.load()]) },
})

export const syncStore = createSyncStore({ engine, tokens, configured })

export function useSync(): SyncState & {
  syncNow: () => Promise<void>; signIn: () => Promise<void>; signOut: () => void
} {
  const state = useSyncExternalStore(syncStore.subscribe, syncStore.getSnapshot)
  return { ...state, syncNow: syncStore.syncNow, signIn: syncStore.signIn, signOut: syncStore.signOut }
}
