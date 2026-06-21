import { CareTypeIcon, RainIcon } from './icons'
import { careLabel } from './careType'
import { dueDescription } from './scheduler'
import type { CareRule } from '../data/types'
import './care.css'

interface Props {
  rule: CareRule
  onEdit: () => void
}

export default function CareRuleRow({ rule, onEdit }: Props) {
  return (
    <button type="button" className="care-rule" onClick={onEdit}>
      <span className="care-rule__icon">
        <CareTypeIcon type={rule.careType} size={16} />
      </span>
      <span className="care-rule__text">
        <span className="care-rule__label">
          {careLabel(rule.careType)}
          {rule.weatherAware && <RainIcon size={11} className="care-rule__rain" />}
        </span>
        <span className="care-rule__interval">{rule.intervalDays}일마다</span>
      </span>
      <span className="care-rule__due">{dueDescription(rule.nextDueAt)}</span>
    </button>
  )
}
