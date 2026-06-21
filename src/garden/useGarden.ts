import { useEffect, useSyncExternalStore } from 'react'
import { createGardenStore, type GardenState, type AddPlantInput, type EditPlantInput } from './store'
import { listAreas, createArea } from '../data/areas'
import { listPlants, createPlant, updatePlant, archivePlant, softDeletePlantDeep } from '../data/plants'
import { putPhoto } from '../data/photos'
import type { Area, Plant } from '../data/types'

// softDeletePlantDeep: 식물 삭제 시 일지·사진 cascade soft-delete
export const gardenStore = createGardenStore({
  listAreas,
  createArea,
  listPlants,
  createPlant,
  updatePlant,
  putPhoto,
  archivePlant,
  softDeletePlant: softDeletePlantDeep,
})

let started = false
function ensureStarted() {
  if (started) return
  started = true
  void gardenStore.load()
}

export function useGarden(): GardenState & {
  addArea: (name: string) => Promise<Area>
  addPlant: (input: AddPlantInput) => Promise<Plant>
  editPlant: (id: string, input: EditPlantInput) => Promise<void>
  archivePlant: (id: string) => Promise<void>
  deletePlant: (id: string) => Promise<void>
} {
  const state = useSyncExternalStore(gardenStore.subscribe, gardenStore.getSnapshot)
  useEffect(() => {
    ensureStarted()
  }, [])
  return {
    ...state,
    addArea: gardenStore.addArea,
    addPlant: gardenStore.addPlant,
    editPlant: gardenStore.editPlant,
    archivePlant: gardenStore.archivePlant,
    deletePlant: gardenStore.deletePlant,
  }
}
