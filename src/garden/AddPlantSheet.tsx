import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { LIGHT_OPTIONS } from './light'
import type { AddPlantInput } from './store'
import type { Area, LightRequirement } from '../data/types'
import './AddPlantSheet.css'

interface Props {
  areas: Area[]
  onClose: () => void
  onSubmit: (input: AddPlantInput) => Promise<unknown>
}

export default function AddPlantSheet({ areas, onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [areaId, setAreaId] = useState(areas[0]?.id ?? '')
  const [light, setLight] = useState<LightRequirement | ''>('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

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
      photo: photo ?? undefined,
    })
    onClose()
  }

  return (
    <Sheet title="식물 추가" onClose={onClose} onSave={save} canSave={canSave}>
      <label className="field">
        <span>이름</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 바질" autoFocus />
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
        <span>사진</span>
        <input type="file" accept="image/*" onChange={onPick} />
      </label>
      {preview && <img className="addplant__preview" src={preview} alt="사진 미리보기" />}
    </Sheet>
  )
}
