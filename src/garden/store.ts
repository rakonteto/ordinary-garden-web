import type { Area, Plant } from '../data/types'
import type { NewPlantFields, PlantPatch } from '../data/plants'
import type { NewPhoto } from '../data/photos'

export interface GardenState {
  areas: Area[]
  plants: Plant[]
  loaded: boolean
}

export interface AddPlantInput {
  areaId: string
  name: string
  lightRequirement?: Plant['lightRequirement']
  photo?: Blob
  datePlanted?: number
  note?: string
}

export interface GardenRepo {
  listAreas(): Promise<Area[]>
  createArea(name: string, sortOrder: number): Promise<Area>
  listPlants(): Promise<Plant[]>
  createPlant(fields: NewPlantFields): Promise<Plant>
  updatePlant(id: string, patch: PlantPatch): Promise<Plant>
  putPhoto(input: NewPhoto): Promise<{ id: string }>
}

export interface GardenStore {
  getSnapshot(): GardenState
  subscribe(listener: () => void): () => void
  load(): Promise<void>
  addArea(name: string): Promise<Area>
  addPlant(input: AddPlantInput): Promise<Plant>
}

const EMPTY: GardenState = { areas: [], plants: [], loaded: false }

export function createGardenStore(repo: GardenRepo): GardenStore {
  let state: GardenState = EMPTY
  const listeners = new Set<() => void>()

  function set(next: GardenState) {
    state = next
    listeners.forEach((l) => l())
  }

  async function reload() {
    const [areas, plants] = await Promise.all([repo.listAreas(), repo.listPlants()])
    set({ areas, plants, loaded: true })
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    load: reload,
    async addArea(name) {
      // sortOrder = 현재 보이는 영역 수. ③엔 영역 삭제 UI가 없어 단조 증가가 보장된다.
      // (영역 soft-delete 도입 시 tombstone과 sortOrder가 충돌 가능 → ④⑥에서 reorder로 해결.)
      const area = await repo.createArea(name, state.areas.length)
      await reload()
      return area
    },
    /** 반환 Plant는 reload 전 객체라 photoId가 비어 있을 수 있다.
     *  최신 상태(photoId 포함)는 getSnapshot().plants에서 읽을 것. */
    async addPlant(input) {
      const plant = await repo.createPlant({
        areaId: input.areaId,
        name: input.name,
        lightRequirement: input.lightRequirement,
        datePlanted: input.datePlanted,
        note: input.note,
      })
      if (input.photo) {
        const photo = await repo.putPhoto({ ownerId: plant.id, blob: input.photo })
        await repo.updatePlant(plant.id, { photoId: photo.id })
      }
      await reload()
      return plant
    },
  }
}
