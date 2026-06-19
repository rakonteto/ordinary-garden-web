import { useState } from 'react'
import Sheet from './Sheet'

interface Props {
  onClose: () => void
  onSubmit: (name: string) => Promise<unknown>
}

export default function AddAreaSheet({ onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const trimmed = name.trim()

  async function save() {
    if (!trimmed) return
    await onSubmit(trimmed)
    onClose()
  }

  return (
    <Sheet title="영역 추가" onClose={onClose} onSave={save} canSave={!!trimmed}>
      <label className="field">
        <span>영역 이름</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 베란다 텃밭"
          autoFocus
        />
      </label>
    </Sheet>
  )
}
