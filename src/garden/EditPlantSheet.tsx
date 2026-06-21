import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { LIGHT_OPTIONS } from './light'
import type { EditPlantInput } from './store'
import type { Plant, Area, LightRequirement } from '../data/types'
import { dateInputValue, parseDateInput } from '../journal/format'
import './EditPlantSheet.css'

interface Props {
  plant: Plant
  areas: Area[]
  onClose: () => void
  onSubmit: (input: EditPlantInput) => Promise<unknown>
  onArchive: () => Promise<unknown>
  onDelete: () => Promise<unknown>
}

export default function EditPlantSheet({ plant, areas, onClose, onSubmit, onArchive, onDelete }: Props) {
  const [name, setName] = useState(plant.name)
  const [areaId, setAreaId] = useState(plant.areaId)
  const [light, setLight] = useState<LightRequirement | ''>(plant.lightRequirement ?? '')
  const [note, setNote] = useState(plant.note ?? '')
  const [datePlanted, setDatePlanted] = useState(
    plant.datePlanted != null ? dateInputValue(plant.datePlanted) : '',
  )
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  // 2단계 삭제 확인 상태
  const [confirmDelete, setConfirmDelete] = useState(false)

  const trimmed = name.trim()
  const canSave = !!trimmed && !!areaId

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPhoto(file)
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return file ? URL.createObjectURL(file) : null
    })
  }

  async function save() {
    if (!canSave) return
    await onSubmit({
      name: trimmed,
      areaId,
      lightRequirement: light || undefined,
      datePlanted: datePlanted ? parseDateInput(datePlanted) : undefined,
      note: note.trim() || undefined,
      photo: photo ?? undefined,
    })
    onClose()
  }


  return (
    <Sheet title="식물 편집" onClose={onClose} onSave={save} canSave={canSave}>
      <label className="field">
        <span>이름</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 바질"
          autoFocus
        />
      </label>

      <label className="field">
        <span>영역</span>
        <select value={areaId} onChange={(e) => setAreaId(e.target.value)}>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>광 요구도</span>
        <select value={light} onChange={(e) => setLight(e.target.value as LightRequirement | '')}>
          <option value="">선택 안 함</option>
          {LIGHT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>심은 날짜</span>
        <input
          type="date"
          value={datePlanted}
          onChange={(e) => setDatePlanted(e.target.value)}
        />
      </label>

      <label className="field">
        <span>메모</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="간단한 메모를 남겨보세요"
          rows={3}
        />
      </label>

      <label className="field">
        <span>사진</span>
        <input type="file" accept="image/*" onChange={onPick} />
      </label>
      {preview && <img className="editplant__preview" src={preview} alt="사진 미리보기" />}

      {/* 위험구역 */}
      <div className="editplant__danger-zone">
        <button type="button" className="editplant__archive-btn" onClick={onArchive}>
          보관
        </button>

        {confirmDelete ? (
          <div className="editplant__delete-confirm">
            <p className="editplant__delete-warning">
              이 식물을 삭제할까요? 일지·사진까지 사라집니다
            </p>
            <button type="button" className="editplant__delete-final-btn" onClick={() => onDelete()}>
              정말 삭제
            </button>
          </div>
        ) : (
          <button type="button" className="editplant__delete-btn" onClick={() => setConfirmDelete(true)}>
            삭제
          </button>
        )}
      </div>
    </Sheet>
  )
}
