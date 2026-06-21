import { useState, useMemo } from 'react'
import type { CodexCategory } from './types'
import { searchSpecies, groupByCategory } from './search'
import { CATEGORY_EMOJI } from './categories'
import CategoryFilter from './CategoryFilter'
import SpeciesCard from './SpeciesCard'
import './CodexList.css'

/** 도감 목록 — 검색 + 카테고리 필터 + 분류별 묶음. */
export default function CodexList() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CodexCategory | null>(null)

  const groups = useMemo(() => {
    let results = searchSpecies(query)
    if (category) results = results.filter((r) => r.species.category === category)
    return groupByCategory(results)
  }, [query, category])

  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups])

  return (
    <section className="codex">
      <h1 className="codex__title">도감</h1>
      <input
        className="codex__search"
        type="search"
        placeholder="식물 이름·학명으로 검색"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="식물 검색"
      />
      <CategoryFilter selected={category} onSelect={setCategory} />
      <p className="codex__count">{total}종</p>

      {total === 0 ? (
        <p className="codex__empty">검색 결과가 없어요</p>
      ) : (
        groups.map((g) => (
          <div key={g.category} className="codex__section">
            <h2 className="codex__section-head">
              <span aria-hidden>{CATEGORY_EMOJI[g.category]}</span> {g.category}
              <span className="codex__section-count">{g.items.length}</span>
            </h2>
            <div className="codex__grid">
              {g.items.map((r) => (
                <SpeciesCard key={r.species.id} species={r.species} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  )
}
