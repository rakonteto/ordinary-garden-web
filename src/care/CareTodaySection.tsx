import { useState } from 'react'
import { useCare } from './useCare'
import { useGarden } from '../garden/useGarden'
import { useWeather } from '../weather/useWeather'
import { dueGroups, upcoming } from './selectors'
import { advice } from './weatherAdvisor'
import { careLabel } from './careType'
import { dueDescription } from './scheduler'
import { CareTypeIcon } from './icons'
import SegmentedToggle from '../ui/SegmentedToggle'
import CareTaskCard from './CareTaskCard'
import './care.css'

export default function CareTodaySection() {
  const [seg, setSeg] = useState(0)
  const { rules, loaded: careLoaded, complete, snooze } = useCare()
  const { plants, areas, loaded: gardenLoaded } = useGarden()
  const ready = careLoaded && gardenLoaded
  const { bundle } = useWeather()

  const groups = dueGroups(rules, plants, areas)
  const upcomingItems = upcoming(rules, plants, areas)

  return (
    <section className="care-today">
      <div className="care-today__head">
        <h2 className="care-today__title">오늘 할 일</h2>
        <SegmentedToggle options={['오늘', '예정']} value={seg} onChange={setSeg} />
      </div>

      {seg === 0 ? (
        ready && groups.length === 0 ? (
          <p className="care-today__empty">오늘 할 일이 없어요</p>
        ) : (
          <div className="care-today__cards">
            {groups.map((g) => (
              <CareTaskCard
                key={g.type}
                type={g.type}
                items={g.items}
                advice={g.type === 'water' ? advice('water', g.items.some((it) => it.rule.weatherAware), bundle) : 'none'}
                onComplete={(id) => void complete(id)}
                onSnooze={(id) => void snooze(id)}
              />
            ))}
          </div>
        )
      ) : ready && upcomingItems.length === 0 ? (
        <p className="care-today__empty">예정된 케어가 없어요</p>
      ) : (
        <div className="care-card glass care-upcoming">
          {upcomingItems.map((it) => (
            <div key={it.rule.id} className="care-upcoming__row">
              <CareTypeIcon type={it.rule.careType} size={14} className="care-upcoming__icon" />
              <div className="care-row__text">
                <span className="care-row__name">{it.plant.name}</span>
                <span className="care-row__area">{careLabel(it.rule.careType)}</span>
              </div>
              <span className="care-upcoming__due">{dueDescription(it.rule.nextDueAt)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
