import { Link } from 'react-router-dom'
import type { CodexSpecies } from './types'
import { CATEGORY_EMOJI } from './categories'
import './SpeciesCard.css'

/** 목록의 종 카드. 누르면 상세(/codex/:id)로 이동한다. */
export default function SpeciesCard({ species }: { species: CodexSpecies }) {
  return (
    <Link to={`/codex/${species.id}`} className="scard glass">
      <span className="scard__emoji" aria-hidden>
        {CATEGORY_EMOJI[species.category]}
      </span>
      <span className="scard__body">
        <span className="scard__name">{species.name}</span>
        {species.genus !== species.name && <span className="scard__genus">{species.genus}</span>}
        <span className="scard__sci">{species.scientificName}</span>
      </span>
    </Link>
  )
}
