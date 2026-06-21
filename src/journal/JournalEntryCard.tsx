import { useEffect, useState } from 'react'
import type { JournalEntry, JournalPhoto } from '../data/types'
import { journalDateLabel } from './format'
import { sortWorkTypes, workLabel } from './workType'
import { snapshotSummary } from './weatherSnapshot'
import { listPhotosByOwner } from '../data/photos'
import './JournalEntryCard.css'

interface Props {
  entry: JournalEntry
  onEdit: () => void
  onDelete: () => void
}

export default function JournalEntryCard({ entry, onEdit, onDelete }: Props) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    const createdUrls: string[] = []

    void listPhotosByOwner(entry.id).then((photos: JournalPhoto[]) => {
      if (cancelled) return
      const urls = photos
        .filter((p): p is JournalPhoto & { blob: Blob } => p.blob != null)
        .map((p) => {
          const url = URL.createObjectURL(p.blob)
          createdUrls.push(url)
          return url
        })
      if (!cancelled) setPhotoUrls(urls)
    })

    return () => {
      cancelled = true
      createdUrls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [entry.id])

  const sortedTags = sortWorkTypes(entry.tags)
  const weatherText = entry.weatherSnapshot ? snapshotSummary(entry.weatherSnapshot) : null

  // 비인터랙티브 컨테이너 — role="button" 제거로 중첩 인터랙티브 ARIA 안티패턴 해소
  return (
    <article className="journal-entry-card">
      {/* 헤더: 날짜 + 날씨 배지 */}
      <header className="journal-entry-card__header">
        <time className="journal-entry-card__date">{journalDateLabel(entry.date)}</time>
        {weatherText && (
          <span className="journal-entry-card__weather-badge">{weatherText}</span>
        )}
      </header>

      {/* 태그 칩 */}
      {sortedTags.length > 0 && (
        <div className="journal-entry-card__tags" aria-label="작업 종류">
          {sortedTags.map((tag) => (
            <span key={tag} className="journal-entry-card__tag-chip">
              {workLabel(tag)}
            </span>
          ))}
        </div>
      )}

      {/* 메모 */}
      {entry.note && (
        <p className="journal-entry-card__note">{entry.note}</p>
      )}

      {/* 사진 썸네일 가로 스크롤 — 클릭 핸들러 없으므로 스크롤과 충돌 없음 */}
      {photoUrls.length > 0 && (
        <div className="journal-entry-card__photos" aria-label="사진">
          {photoUrls.map((url, i) => (
            <img
              key={url}
              src={url}
              alt={`일지 사진 ${i + 1}`}
              className="journal-entry-card__thumb"
            />
          ))}
        </div>
      )}

      {/* 푸터 액션 영역 — 편집·삭제 버튼이 형제 관계로 나란히 위치 (중첩 아님) */}
      <footer className="journal-entry-card__footer">
        <button
          type="button"
          className="journal-entry-card__edit-btn"
          aria-label="일지 편집"
          onClick={onEdit}
        >
          편집
        </button>
        <button
          type="button"
          className="journal-entry-card__delete-btn"
          aria-label="일지 삭제"
          onClick={onDelete}
        >
          삭제
        </button>
      </footer>
    </article>
  )
}
