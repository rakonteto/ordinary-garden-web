import { useCallback, useEffect, useState } from 'react'
import type { JournalEntry, WeatherSnapshot } from '../data/types'
import { createEntry, listEntriesByPlant, updateEntry as repoUpdate, softDeleteEntry } from '../data/journal'
import { putPhoto, listPhotosByOwner, softDeletePhoto } from '../data/photos'

export interface EntryInput {
  date: number
  note: string
  tags: string[]
  weatherSnapshot?: WeatherSnapshot
  photos?: File[]
}

async function savePhotos(ownerId: string, files: File[]) {
  for (let i = 0; i < files.length; i++) {
    await putPhoto({ ownerId, blob: files[i], sortOrder: i })
  }
}

export function usePlantJournal(plantId: string) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(async () => {
    setEntries(await listEntriesByPlant(plantId))
    setLoaded(true)
  }, [plantId])

  useEffect(() => { void reload() }, [reload])

  const addEntry = useCallback(async (input: EntryInput) => {
    const entry = await createEntry({
      plantId, date: input.date, note: input.note, tags: input.tags, weatherSnapshot: input.weatherSnapshot,
    })
    if (input.photos?.length) await savePhotos(entry.id, input.photos)
    await reload()
  }, [plantId, reload])

  const updateEntry = useCallback(async (id: string, input: EntryInput, replacePhotos: boolean) => {
    await repoUpdate(id, { date: input.date, note: input.note, tags: input.tags, weatherSnapshot: input.weatherSnapshot })
    if (replacePhotos) {
      const old = await listPhotosByOwner(id)
      for (const p of old) await softDeletePhoto(p.id)
      if (input.photos?.length) await savePhotos(id, input.photos)
    }
    await reload()
  }, [plantId, reload])

  const deleteEntry = useCallback(async (id: string) => {
    const photos = await listPhotosByOwner(id)
    for (const p of photos) await softDeletePhoto(p.id)
    await softDeleteEntry(id)
    await reload()
  }, [reload])

  return { entries, loaded, addEntry, updateEntry, deleteEntry }
}
