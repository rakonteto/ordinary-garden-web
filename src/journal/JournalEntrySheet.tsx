import { useEffect, useState } from 'react'
import Sheet from '../garden/Sheet'
import WorkTypeChips from './WorkTypeChips'
import { weatherStore } from '../weather/useWeather'
import { captureSnapshot } from './weatherSnapshot'
import { dateInputValue, parseDateInput } from './format'
import type { EntryInput } from './usePlantJournal'
import type { JournalEntry } from '../data/types'
import './JournalEntrySheet.css'

interface Props {
  entry?: JournalEntry
  defaultDate: number
  onClose: () => void
  onSubmit: (input: EntryInput, replacePhotos: boolean) => Promise<unknown>
}

export default function JournalEntrySheet({ entry, defaultDate, onClose, onSubmit }: Props) {
  const [dateStr, setDateStr] = useState(dateInputValue(entry?.date ?? defaultDate))
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [note, setNote] = useState(entry?.note ?? '')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [recordWeather, setRecordWeather] = useState<boolean>(!!entry?.weatherSnapshot)

  const bundle = weatherStore.getSnapshot().bundle
  const photosTouched = photos.length > 0
  const canSave = tags.length > 0 || note.trim().length > 0 || photosTouched

  // 미리보기 objectURL 정리
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    setPhotos(files)
    setPreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u))
      return files.map((f) => URL.createObjectURL(f))
    })
  }

  // 태그 토글: React 기본 배치 처리에 맡김(flushSync 불필요)
  function toggleTag(v: string) {
    setTags((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]))
  }

  async function save() {
    const weatherSnapshot = recordWeather
      ? (bundle ? captureSnapshot(bundle, Date.now()) : entry?.weatherSnapshot)
      : undefined
    const input: EntryInput = {
      date: parseDateInput(dateStr),
      note: note.trim(),
      tags,
      weatherSnapshot,
      photos: photosTouched ? photos : undefined,
    }
    await onSubmit(input, photosTouched)
    onClose()
  }

  return (
    <Sheet title={entry ? '일지 편집' : '일지 작성'} onClose={onClose} onSave={save} canSave={canSave}>
      {/* 날짜 */}
      <label className="field">
        <span>날짜</span>
        <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
      </label>

      {/* 작업 태그 */}
      <div className="field">
        <span>작업</span>
        <WorkTypeChips selected={tags} onToggle={toggleTag} />
      </div>

      {/* 메모 */}
      <label className="field">
        <span>메모</span>
        <textarea
          aria-label="메모"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="오늘의 기록"
        />
      </label>

      {/* 사진 */}
      <label className="field">
        <span>사진</span>
        <input type="file" accept="image/*" multiple onChange={onPick} />
      </label>

      {/* 사진 교체 안내 (편집 모드, 새 사진 선택 시) */}
      {entry && photosTouched && (
        <p className="journal-sheet__hint">사진을 다시 고르면 기존 사진이 교체됩니다.</p>
      )}

      {/* 사진 미리보기 (가로 스크롤) */}
      {previews.length > 0 && (
        <div className="journal-sheet__previews">
          {previews.map((u, i) => (
            <img key={i} src={u} alt={`사진 ${i + 1}`} />
          ))}
        </div>
      )}

      {/* 날씨 토글 */}
      <label className="field field--row">
        <span>오늘 날씨 함께 기록</span>
        <input
          type="checkbox"
          checked={recordWeather}
          // 라이브 날씨(bundle)가 있거나, 편집 중 기존 박제 스냅샷이 있으면 토글 가능(기존 날씨 해제 허용)
          disabled={!bundle && !entry?.weatherSnapshot}
          onChange={(e) => setRecordWeather(e.target.checked)}
        />
      </label>
    </Sheet>
  )
}
