import PlantCard from './PlantCard'
import type { Plant } from '../data/types'
import './AreaSection.css'

export default function AreaSection({ title, plants }: { title: string; plants: Plant[] }) {
  return (
    <section className="area-section">
      <h2 className="area-section__head">
        {title} <span className="area-section__count">{plants.length}</span>
      </h2>
      {plants.length === 0 ? (
        <p className="area-section__empty">아직 식물이 없어요</p>
      ) : (
        <div className="area-section__grid">
          {plants.map((p) => (
            <PlantCard key={p.id} plant={p} />
          ))}
        </div>
      )}
    </section>
  )
}
