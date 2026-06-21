import { CareTypeIcon, RainIcon } from './icons'
import { careLabel } from './careType'
import { adviceMessage, type CareAdvice } from './weatherAdvisor'
import CareTaskRow from './CareTaskRow'
import type { CareType } from '../data/types'
import type { CareTaskItem } from './selectors'
import './care.css'

interface Props {
  type: CareType
  items: CareTaskItem[]
  advice: CareAdvice
  onComplete: (id: string) => void
  onSnooze: (id: string) => void
}

export default function CareTaskCard({ type, items, advice, onComplete, onSnooze }: Props) {
  const msg = adviceMessage(advice)
  return (
    <div className="care-card glass">
      <div className="care-card__head">
        <CareTypeIcon type={type} size={16} className="care-card__icon" />
        <span className="care-card__label">{careLabel(type)}</span>
        <span className="care-card__count">{items.length}</span>
      </div>
      {msg && (
        <div className="care-card__advice">
          <RainIcon size={13} />
          <span>{msg}</span>
        </div>
      )}
      <div className="care-card__rows">
        {items.map((it) => (
          <CareTaskRow
            key={it.rule.id}
            item={it}
            onComplete={() => onComplete(it.rule.id)}
            onSnooze={() => onSnooze(it.rule.id)}
          />
        ))}
      </div>
    </div>
  )
}
