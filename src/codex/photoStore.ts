import { useEffect, useSyncExternalStore } from 'react'
import { listSpeciesCovers, setSpeciesPhoto, removeSpeciesPhoto } from '../data/codexPhotos'
import type { JournalPhoto } from '../data/types'

export interface CodexPhotoState {
  byId: Map<string, JournalPhoto> // speciesId → 대표사진
  loaded: boolean
}

export interface CodexPhotoRepo {
  listSpeciesCovers(): Promise<Array<{ speciesId: string; photo: JournalPhoto }>>
  setSpeciesPhoto(speciesId: string, blob: Blob): Promise<unknown>
  removeSpeciesPhoto(speciesId: string): Promise<unknown>
}

export interface CodexPhotoStore {
  getSnapshot(): CodexPhotoState
  subscribe(listener: () => void): () => void
  load(): Promise<void>
  setSpeciesPhoto(speciesId: string, blob: Blob): Promise<void>
  removeSpeciesPhoto(speciesId: string): Promise<void>
}

const EMPTY: CodexPhotoState = { byId: new Map(), loaded: false }

export function createCodexPhotoStore(repo: CodexPhotoRepo): CodexPhotoStore {
  let state: CodexPhotoState = EMPTY
  const listeners = new Set<() => void>()

  function set(next: CodexPhotoState) {
    state = next
    listeners.forEach((l) => l())
  }

  async function reload() {
    const covers = await repo.listSpeciesCovers()
    const byId = new Map(covers.map((c) => [c.speciesId, c.photo]))
    set({ byId, loaded: true })
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    load: reload,
    async setSpeciesPhoto(speciesId, blob) {
      await repo.setSpeciesPhoto(speciesId, blob)
      await reload()
    },
    async removeSpeciesPhoto(speciesId) {
      await repo.removeSpeciesPhoto(speciesId)
      await reload()
    },
  }
}

export const codexPhotoStore = createCodexPhotoStore({
  listSpeciesCovers,
  setSpeciesPhoto,
  removeSpeciesPhoto,
})

let started = false
function ensureStarted() {
  if (started) return
  started = true
  void codexPhotoStore.load()
}

export function useCodexPhotos(): CodexPhotoState & {
  setSpeciesPhoto: (speciesId: string, blob: Blob) => Promise<void>
  removeSpeciesPhoto: (speciesId: string) => Promise<void>
} {
  const state = useSyncExternalStore(codexPhotoStore.subscribe, codexPhotoStore.getSnapshot)
  useEffect(() => {
    ensureStarted()
  }, [])
  return {
    ...state,
    setSpeciesPhoto: codexPhotoStore.setSpeciesPhoto,
    removeSpeciesPhoto: codexPhotoStore.removeSpeciesPhoto,
  }
}

/** 종의 내 사진 id(없으면 undefined). SpeciesPhoto·SpeciesDetail에서 사용. */
export function useSpeciesCoverPhotoId(speciesId: string): string | undefined {
  const { byId } = useCodexPhotos()
  return byId.get(speciesId)?.id
}
