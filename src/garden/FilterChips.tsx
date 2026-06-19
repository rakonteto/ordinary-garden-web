import type { Area } from '../data/types'
import './FilterChips.css'

interface Props {
  areas: Area[]
  selectedAreaId: string | null
  onSelect: (id: string | null) => void
}

export default function FilterChips({ areas, selectedAreaId, onSelect }: Props) {
  return (
    <div className="filter-chips" role="group" aria-label="영역 필터">
      <Chip label="전체" selected={selectedAreaId === null} onClick={() => onSelect(null)} />
      {areas.map((a) => (
        <Chip key={a.id} label={a.name} selected={selectedAreaId === a.id} onClick={() => onSelect(a.id)} />
      ))}
    </div>
  )
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={selected ? 'filter-chip filter-chip--on' : 'filter-chip'}
      aria-pressed={selected}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
