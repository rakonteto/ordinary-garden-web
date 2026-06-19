import { useEffect, type ReactNode } from 'react'
import './Sheet.css'

interface Props {
  title: string
  onClose: () => void
  onSave: () => void
  canSave: boolean
  children: ReactNode
}

export default function Sheet({ title, onClose, onSave, canSave, children }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet__backdrop" onClick={onClose}>
      <div
        className="glass sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__bar">
          <button type="button" className="sheet__cancel" onClick={onClose}>
            취소
          </button>
          <span className="sheet__title">{title}</span>
          <button type="button" className="sheet__save" onClick={onSave} disabled={!canSave}>
            저장
          </button>
        </div>
        <div className="sheet__body">{children}</div>
      </div>
    </div>
  )
}
