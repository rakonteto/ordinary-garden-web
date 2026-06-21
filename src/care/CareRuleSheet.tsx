import { useState } from 'react'
import Sheet from '../garden/Sheet'
import { CARE_TYPES, defaultIntervalDays } from './careType'
import type { CareRule, CareType } from '../data/types'
import type { AddRuleInput, UpdateRuleInput } from './store'
import './care.css'

interface Props {
  plantId: string
  rule?: CareRule
  onClose: () => void
  onAdd: (input: AddRuleInput) => void
  onUpdate: (id: string, input: UpdateRuleInput) => void
  onDelete: (id: string) => void
}

export default function CareRuleSheet({ plantId, rule, onClose, onAdd, onUpdate, onDelete }: Props) {
  const editing = rule != null
  const [careType, setCareType] = useState<CareType>(rule?.careType ?? 'water')
  const [intervalDays, setIntervalDays] = useState(rule?.intervalDays ?? defaultIntervalDays('water'))
  const [weatherAware, setWeatherAware] = useState(rule?.weatherAware ?? true)

  function changeType(t: CareType) {
    setCareType(t)
    if (!editing) setIntervalDays(defaultIntervalDays(t))   // 추가 모드만 기본 주기 시드
  }

  function handleSave() {
    const aware = careType === 'water' && weatherAware   // 물주기 아니면 무의미 → false
    if (editing && rule) onUpdate(rule.id, { careType, intervalDays, weatherAware: aware })
    else onAdd({ plantId, careType, intervalDays, weatherAware: aware })
    onClose()
  }

  const canSave = intervalDays >= 1 && intervalDays <= 365

  return (
    <Sheet title={editing ? '케어 편집' : '케어 추가'} onClose={onClose} onSave={handleSave} canSave={canSave}>
      <div className="care-form">
        <span className="care-form__label">종류</span>
        <div className="care-form__types">
          {CARE_TYPES.map((ct) => (
            <button
              key={ct.value}
              type="button"
              className="care-form__type"
              aria-pressed={ct.value === careType}
              onClick={() => changeType(ct.value)}
            >
              {ct.label}
            </button>
          ))}
        </div>

        <label className="care-form__label" htmlFor="care-interval">주기</label>
        <div className="care-form__interval">
          <input
            id="care-interval"
            type="number"
            min={1}
            max={365}
            value={intervalDays}
            onChange={(e) => setIntervalDays(Number(e.target.value))}
          />
          <span>일마다</span>
        </div>

        {careType === 'water' && (
          <>
            <label className="care-form__toggle">
              <input type="checkbox" checked={weatherAware} onChange={(e) => setWeatherAware(e.target.checked)} />
              <span>비 오면 물주기 미루기 제안</span>
            </label>
            <p className="care-form__hint">비 예보·폭염일 때 '오늘 할 일'에 안내를 보여줍니다.</p>
          </>
        )}

        {editing && rule && (
          <button type="button" className="care-form__delete" onClick={() => { onDelete(rule.id); onClose() }}>
            이 케어 삭제
          </button>
        )}
      </div>
    </Sheet>
  )
}
