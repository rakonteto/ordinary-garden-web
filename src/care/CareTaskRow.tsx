import PlantPhoto from '../garden/PlantPhoto'
import type { CareTaskItem } from './selectors'
import './care.css'

interface Props {
  item: CareTaskItem
  onComplete: () => void
  onSnooze: () => void
}

export default function CareTaskRow({ item, onComplete, onSnooze }: Props) {
  const { plant, areaName } = item
  return (
    <div className="care-row">
      <PlantPhoto photoId={plant.photoId} alt={plant.name} className="care-row__thumb" />
      <div className="care-row__text">
        <span className="care-row__name">{plant.name}</span>
        {areaName && <span className="care-row__area">{areaName}</span>}
      </div>
      <button
        type="button"
        className="care-row__snooze"
        aria-label={`${plant.name} 내일로 미루기`}
        onClick={onSnooze}
      >
        ⏰
      </button>
      <button
        type="button"
        className="care-row__check"
        aria-label={`${plant.name} 완료`}
        onClick={onComplete}
      />
    </div>
  )
}
