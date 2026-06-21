import { WORK_TYPES } from './workType'
import './WorkTypeChips.css'

interface Props {
  selected: string[]
  onToggle: (value: string) => void
}

export default function WorkTypeChips({ selected, onToggle }: Props) {
  return (
    <div className="worktype-chips" role="group" aria-label="작업 종류">
      {WORK_TYPES.map((w) => {
        const on = selected.includes(w.value)
        return (
          <button
            key={w.value}
            type="button"
            className={on ? 'worktype-chip worktype-chip--on' : 'worktype-chip'}
            aria-pressed={on}
            onClick={() => onToggle(w.value)}
          >
            {w.label}
          </button>
        )
      })}
    </div>
  )
}
