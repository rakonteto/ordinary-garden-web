import './SegmentedToggle.css'

interface Props {
  options: readonly string[]
  value: number
  onChange: (index: number) => void
}

export default function SegmentedToggle({ options, value, onChange }: Props) {
  return (
    <div className="seg" role="group">
      {options.map((opt, i) => (
        <button
          key={opt}
          type="button"
          className="seg__btn"
          aria-pressed={i === value}
          onClick={() => onChange(i)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
