import { useEffect, useSyncExternalStore } from 'react'
import { createGardenStore, type GardenState, type AddPlantInput } from './store'
import { listAreas, createArea } from '../data/areas'
import { listPlants, createPlant, updatePlant } from '../data/plants'
import { putPhoto } from '../data/photos'
import type { Area, Plant } from '../data/types'

export const gardenStore = createGardenStore({
  listAreas,
  createArea,
  listPlants,
  createPlant,
  updatePlant,
  putPhoto,
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
} {
  const state = useSyncExternalStore(gardenStore.subscribe, gardenStore.getSnapshot)
  useEffect(() => {
    ensureStarted()
  }, [])
  return { ...state, addArea: gardenStore.addArea, addPlant: gardenStore.addPlant }
}
