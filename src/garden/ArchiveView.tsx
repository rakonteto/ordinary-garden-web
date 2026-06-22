import { Link } from 'react-router-dom'
import { useGarden } from './useGarden'
import PlantPhoto from './PlantPhoto'
import { lightLabel } from './light'
import './ArchiveView.css'

export default function ArchiveView() {
  const { archivedPlants, loaded, unarchivePlant } = useGarden()

  return (
    <section className="archive">
      <Link to="/garden" className="archive__back">← 내 정원</Link>
      <h1 className="archive__title">보관함</h1>

      {!loaded ? (
        <p className="archive__loading">불러오는 중…</p>
      ) : archivedPlants.length === 0 ? (
        <p className="archive__empty">보관한 식물이 없어요</p>
      ) : (
        <ul className="archive__list">
          {archivedPlants.map((plant) => {
            const light = lightLabel(plant.lightRequirement)
            return (
              <li key={plant.id} className="glass archive-card">
                <PlantPhoto photoId={plant.photoId} alt={plant.name} className="archive-card__photo" />
                <div className="archive-card__body">
                  <span className="archive-card__name">{plant.name}</span>
                  {light && <span className="archive-card__light">{light}</span>}
                </div>
                <button
                  type="button"
                  className="archive-card__restore"
                  onClick={() => void unarchivePlant(plant.id)}
                >
                  되돌리기
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
