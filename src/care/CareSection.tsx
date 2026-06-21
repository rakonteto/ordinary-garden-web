import { useState } from 'react'
import { useCare } from './useCare'
import CareRuleRow from './CareRuleRow'
import CareRuleSheet from './CareRuleSheet'
import type { CareRule } from '../data/types'
import './care.css'

interface Props {
  plantId: string
}

export default function CareSection({ plantId }: Props) {
  const { rules, addRule, updateRule, deleteRule } = useCare()
  // false=닫힘, null=추가, CareRule=편집
  const [open, setOpen] = useState<false | null | CareRule>(false)

  const plantRules = rules
    .filter((r) => r.plantId === plantId)
    .sort((a, b) => a.createdAt - b.createdAt)

  return (
    <div className="care-section">
      <div className="care-section__head">
        <h2 className="care-section__title">케어</h2>
        <button type="button" className="care-section__add" aria-label="케어 추가" onClick={() => setOpen(null)}>
          +
        </button>
      </div>

      {plantRules.length === 0 ? (
        <p className="care-section__empty">케어 일정을 추가해보세요</p>
      ) : (
        <div className="care-section__rules">
          {plantRules.map((rule) => (
            <CareRuleRow key={rule.id} rule={rule} onEdit={() => setOpen(rule)} />
          ))}
        </div>
      )}

      {open !== false && (
        <CareRuleSheet
          plantId={plantId}
          rule={open ?? undefined}
          onClose={() => setOpen(false)}
          onAdd={(input) => void addRule(input)}
          onUpdate={(id, input) => void updateRule(id, input)}
          onDelete={(id) => void deleteRule(id)}
        />
      )}
    </div>
  )
}
