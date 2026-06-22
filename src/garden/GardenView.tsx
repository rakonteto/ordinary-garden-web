import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGarden } from './useGarden'
import FilterChips from './FilterChips'
import AreaSection from './AreaSection'
import AddAreaSheet from './AddAreaSheet'
import AddPlantSheet from './AddPlantSheet'
import './GardenView.css'

type SheetKind = 'area' | 'plant' | null

export default function GardenView() {
  const { areas, plants, archivedPlants, loaded, addArea, addPlant } = useGarden()
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [sheet, setSheet] = useState<SheetKind>(null)

  // 선택한 영역이 사라졌으면(향후 삭제 UI 대비) 전체로 폴백.
  const activeAreaId = selectedAreaId && areas.some((a) => a.id === selectedAreaId) ? selectedAreaId : null
  const visibleAreas = activeAreaId ? areas.filter((a) => a.id === activeAreaId) : areas

  return (
    <section className="garden">
      <h1 className="garden__title">내 정원</h1>

      {!loaded ? (
        <p className="garden__loading">불러오는 중…</p>
      ) : areas.length === 0 ? (
        <div className="garden__empty">
          <p>정원에 영역을 추가해보세요</p>
          <button type="button" className="garden__empty-add" onClick={() => setSheet('area')}>
            영역 추가
          </button>
        </div>
      ) : (
        <>
          <div className="garden__filters">
            <FilterChips areas={areas} selectedAreaId={activeAreaId} onSelect={setSelectedAreaId} />
            <button type="button" className="garden__add-area" aria-label="영역 추가" onClick={() => setSheet('area')}>
              + 영역
            </button>
          </div>
          {visibleAreas.map((area) => (
            <AreaSection key={area.id} title={area.name} plants={plants.filter((p) => p.areaId === area.id)} />
          ))}
          {archivedPlants.length > 0 && (
            <Link to="/archive" className="garden__archive-link">
              보관함 {archivedPlants.length}개 보기
            </Link>
          )}
          <button
            type="button"
            className="garden__fab"
            onClick={() => setSheet('plant')}
            aria-label="식물 추가"
          >
            +
          </button>
        </>
      )}

      {sheet === 'area' && <AddAreaSheet onClose={() => setSheet(null)} onSubmit={addArea} />}
      {sheet === 'plant' && <AddPlantSheet areas={areas} onClose={() => setSheet(null)} onSubmit={addPlant} />}
    </section>
  )
}
