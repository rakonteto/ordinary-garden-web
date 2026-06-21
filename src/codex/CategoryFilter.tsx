import type { CodexCategory } from './types'
import { CATEGORY_ORDER } from './search'
import { CATEGORY_EMOJI } from './categories'
import './CategoryFilter.css'

interface Props {
  selected: CodexCategory | null
  onSelect: (c: CodexCategory | null) => void
}

/** 가로 스크롤 카테고리 칩. '전체' + 각 카테고리. (내정원 FilterChips와 같은 결.) */
export default function CategoryFilter({ selected, onSelect }: Props) {
  return (
    <div className="catfilter">
      <button
        type="button"
        className={selected === null ? 'catfilter__chip catfilter__chip--on' : 'catfilter__chip'}
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
      >
        전체
      </button>
      {CATEGORY_ORDER.map((c) => (
        <button
          key={c}
          type="button"
          className={selected === c ? 'catfilter__chip catfilter__chip--on' : 'catfilter__chip'}
          aria-pressed={selected === c}
          onClick={() => onSelect(c)}
        >
          {CATEGORY_EMOJI[c]} {c}
        </button>
      ))}
    </div>
  )
}
