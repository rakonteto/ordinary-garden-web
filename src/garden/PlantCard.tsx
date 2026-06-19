import PlantPhoto from './PlantPhoto'
import { lightLabel } from './light'
import type { Plant } from '../data/types'
import './PlantCard.css'

export default function PlantCard({ plant }: { plant: Plant }) {
  const light = lightLabel(plant.lightRequirement)
  return (
    <div className="glass plant-card">
      <PlantPhoto photoId={plant.photoId} alt={plant.name} className="plant-card__photo" />
      <div className="plant-card__body">
        <span className="plant-card__name">{plant.name}</span>
        {light && <span className="plant-card__light">{light}</span>}
      </div>
    </div>
  )
}
