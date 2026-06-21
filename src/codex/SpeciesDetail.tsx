import { useParams, Link } from 'react-router-dom'
import { findSpecies } from './search'
import { CATEGORY_EMOJI } from './categories'
import './SpeciesDetail.css'

// 표시할 재배 정보 필드(순서대로). bloomType은 화훼 등에만 있어 값이 있을 때만 나온다.
const FIELDS = [
  { key: 'bloomType', label: '개화 습성', icon: '🌷' },
  { key: 'hardiness', label: '내한성·월동', icon: '❄️' },
  { key: 'light', label: '빛', icon: '☀️' },
  { key: 'water', label: '물', icon: '💧' },
  { key: 'soil', label: '흙', icon: '🪴' },
  { key: 'care', label: '관리·번식', icon: '✂️' },
  { key: 'pest', label: '병해충', icon: '🐛' },
  { key: 'season', label: '시기', icon: '📅' },
] as const

/** 종 상세 — 재배 정보 + 팁 + 품종(종 정보를 상속) + 그 밖의 품종. */
export default function SpeciesDetail() {
  const { speciesId } = useParams()
  const ref = speciesId ? findSpecies(speciesId) : null

  if (!ref) {
    return (
      <section className="sdetail">
        <Link to="/codex" className="sdetail__back">
          ← 도감
        </Link>
        <p className="sdetail__notfound">찾는 식물이 없어요.</p>
      </section>
    )
  }

  const { species } = ref
  return (
    <section className="sdetail">
      <Link to="/codex" className="sdetail__back">
        ← 도감
      </Link>

      <header className="sdetail__head glass">
        <span className="sdetail__badge">
          {CATEGORY_EMOJI[species.category]} {species.category}
        </span>
        <h1 className="sdetail__name">{species.name}</h1>
        {species.genus !== species.name && <p className="sdetail__genus">{species.genus}</p>}
        <p className="sdetail__sci">{species.scientificName}</p>
        <p className="sdetail__form">{species.form}</p>
      </header>

      <dl className="sdetail__fields">
        {FIELDS.map((f) => {
          const value = species[f.key]
          if (!value) return null
          return (
            <div key={f.key} className="sdetail__field glass">
              <dt>
                <span aria-hidden>{f.icon}</span> {f.label}
              </dt>
              <dd>{value}</dd>
            </div>
          )
        })}
      </dl>

      <div className="sdetail__tip glass">
        <span className="sdetail__tip-icon" aria-hidden>
          💡
        </span>
        <p>{species.tip}</p>
      </div>

      {species.varieties && species.varieties.length > 0 && (
        <div className="sdetail__group">
          <h2 className="sdetail__subhead">품종</h2>
          {species.varieties.map((v) => (
            <div key={v.id} className="sdetail__variety glass">
              <h3>{v.name}</h3>
              {v.scientificName && <p className="sdetail__sci">{v.scientificName}</p>}
              <p>{v.trait}</p>
              {v.bloomType && (
                <p>
                  <b>개화</b> {v.bloomType}
                </p>
              )}
              {v.hardiness && (
                <p>
                  <b>월동</b> {v.hardiness}
                </p>
              )}
              {v.care && (
                <p>
                  <b>관리</b> {v.care}
                </p>
              )}
              {v.season && (
                <p>
                  <b>시기</b> {v.season}
                </p>
              )}
              {v.tip && (
                <p>
                  <b>팁</b> {v.tip}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {species.otherCultivars && species.otherCultivars.length > 0 && (
        <div className="sdetail__group">
          <h2 className="sdetail__subhead">그 밖의 품종</h2>
          <div className="sdetail__chips">
            {species.otherCultivars.map((c) => (
              <span key={c} className="sdetail__chip">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
