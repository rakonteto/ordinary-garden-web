import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGarden } from './useGarden'
import { usePlantJournal } from '../journal/usePlantJournal'
import PlantPhoto from './PlantPhoto'
import { lightLabel } from './light'
import JournalEntryCard from '../journal/JournalEntryCard'
import JournalEntrySheet from '../journal/JournalEntrySheet'
import EditPlantSheet from './EditPlantSheet'
import { journalDateLabel } from '../journal/format'
import type { JournalEntry } from '../data/types'
import type { EditPlantInput } from './store'
import type { EntryInput } from '../journal/usePlantJournal'
import CareSection from '../care/CareSection'
import './PlantDetail.css'

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { areas, plants, loaded, editPlant, archivePlant, deletePlant } = useGarden()
  const { entries, loaded: journalLoaded, addEntry, updateEntry, deleteEntry } = usePlantJournal(id ?? '')

  // 모달 상태: 'edit' | null | JournalEntry(편집 대상) | 'add'(일지 추가)
  const [editOpen, setEditOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState<false | null | JournalEntry>(false)
  // false = 닫힘, null = 새 일지 추가, JournalEntry = 편집 대상

  const plant = plants.find((p) => p.id === id)
  const areaName = plant ? areas.find((a) => a.id === plant.areaId)?.name : undefined
  const light = plant?.lightRequirement ? lightLabel(plant.lightRequirement) : null

  // 미로드 상태
  if (!loaded) {
    return (
      <section className="pdetail">
        <Link to="/garden" className="pdetail__back">← 내 정원</Link>
        <p className="pdetail__loading">불러오는 중…</p>
      </section>
    )
  }

  // 식물 없음(보관/삭제 포함)
  if (!plant) {
    return (
      <section className="pdetail">
        <Link to="/garden" className="pdetail__back">← 내 정원</Link>
        <p className="pdetail__notfound">식물을 찾을 수 없어요</p>
      </section>
    )
  }

  async function handleEditSubmit(input: EditPlantInput) {
    if (!id) return
    await editPlant(id, input)
    setEditOpen(false)
  }

  async function handleArchive() {
    if (!id) return
    await archivePlant(id)
    navigate('/garden')
  }

  async function handleDelete() {
    if (!id) return
    await deletePlant(id)
    navigate('/garden')
  }

  async function handleJournalSubmit(input: EntryInput, replacePhotos: boolean) {
    if (journalOpen === null) {
      // 새 일지 추가
      await addEntry(input)
    } else if (journalOpen) {
      // 기존 일지 편집
      await updateEntry(journalOpen.id, input, replacePhotos)
    }
  }

  return (
    <section className="pdetail">
      {/* 상단 네비: 뒤로가기 + 편집 */}
      <div className="pdetail__nav">
        <Link to="/garden" className="pdetail__back">← 내 정원</Link>
        <button
          type="button"
          className="pdetail__edit-btn"
          aria-label="식물 편집"
          onClick={() => setEditOpen(true)}
        >
          ✏️
        </button>
      </div>

      {/* 히어로: 식물 사진 */}
      <div className="pdetail__hero">
        <PlantPhoto photoId={plant.photoId} alt={plant.name} className="pdetail__photo" />
      </div>

      {/* 제목 + 정보칩 */}
      <header className="pdetail__head glass">
        <h1 className="pdetail__name">{plant.name}</h1>
        <div className="pdetail__chips">
          {light && (
            <span className="pdetail__chip">{light}</span>
          )}
          {plant.datePlanted != null && (
            <span className="pdetail__chip">{journalDateLabel(plant.datePlanted)}</span>
          )}
          {areaName && (
            <span className="pdetail__chip pdetail__chip--area">{areaName}</span>
          )}
        </div>
      </header>

      {/* 케어 섹션 */}
      <CareSection plantId={plant.id} />

      {/* 재배일지 섹션 */}
      <div className="pdetail__journal">
        <div className="pdetail__journal-header">
          <h2 className="pdetail__journal-title">재배일지</h2>
          <button
            type="button"
            className="pdetail__add-btn"
            aria-label="일지 추가"
            onClick={() => setJournalOpen(null)}
          >
            +
          </button>
        </div>

        {/* 일지 로딩 완료 후에만 빈상태 안내 표시(로딩 중 깜빡임 방지) */}
        {journalLoaded && entries.length === 0 ? (
          <p className="pdetail__empty">첫 일지를 남겨보세요</p>
        ) : (
          <div className="pdetail__entries">
            {entries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => setJournalOpen(entry)}
                onDelete={() => deleteEntry(entry.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 식물 편집 시트 */}
      {editOpen && (
        <EditPlantSheet
          plant={plant}
          areas={areas}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEditSubmit}
          onArchive={handleArchive}
          onDelete={handleDelete}
        />
      )}

      {/* 일지 작성/편집 시트 — journalOpen === null: 추가, JournalEntry: 편집 */}
      {journalOpen !== false && (
        <JournalEntrySheet
          entry={journalOpen ?? undefined}
          defaultDate={Date.now()}
          onClose={() => setJournalOpen(false)}
          onSubmit={handleJournalSubmit}
        />
      )}
    </section>
  )
}
