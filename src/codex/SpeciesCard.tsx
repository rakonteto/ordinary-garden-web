import { Link } from 'react-router-dom'
import type { CodexSpecies } from './types'
import SpeciesPhoto from './SpeciesPhoto'
import './SpeciesCard.css'

/** 목록의 종 카드. 누르면 상세(/codex/:id)로 이동한다. */
export default function SpeciesCard({ species }: { species: CodexSpecies }) {
  return (
    <Link to={`/codex/${species.id}`} className="scard glass">
      <SpeciesPhoto speciesId={species.id} category={species.category} variant="card" alt={species.name} />
      <span className="scard__body">
        <span className="scard__name">{species.name}</span>
        {species.genus !== species.name && <span className="scard__genus">{species.genus}</span>}
        <span className="scard__sci">{species.scientificName}</span>
      </span>
    </Link>
  )
}
