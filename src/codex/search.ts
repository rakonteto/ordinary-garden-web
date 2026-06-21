// 도감 데이터 쿼리 — 검색·분류·상세 조회 (순수 함수).
//
// 도감 데이터(codex)는 정적이라 Dexie·동기화가 없다. 화면은 이 함수들로
// codex 배열을 읽기만 한다(내정원의 store 패턴이 불필요).

import type { CodexGenus, CodexSpecies, CodexCategory } from './types'
import { codex } from './index'

/** 종 하나를 속과 함께 가리킨다(목록·상세에서 통칭·학명을 같이 보여주려고). */
export interface SpeciesRef {
  species: CodexSpecies
  genus: CodexGenus
}

/** 목록에서 묶음을 보여줄 카테고리 순서(노지 정원식물 → 실내 → 그 밖). */
export const CATEGORY_ORDER: CodexCategory[] = [
  '화훼',
  '관상수',
  '과수',
  '채소',
  '허브',
  '관엽',
  '다육',
  '기타',
]

/** 모든 종을 속과 함께 평탄화한다. */
export function allSpecies(list: CodexGenus[] = codex): SpeciesRef[] {
  return list.flatMap((genus) => genus.species.map((species) => ({ species, genus })))
}

/** id로 종 하나를 찾는다(상세 화면용). 없으면 null. */
export function findSpecies(id: string, list: CodexGenus[] = codex): SpeciesRef | null {
  for (const genus of list) {
    const species = genus.species.find((s) => s.id === id)
    if (species) return { species, genus }
  }
  return null
}

function matches(ref: SpeciesRef, q: string): boolean {
  const { species, genus } = ref
  // 이름·통칭·학명·품종명만 검색한다. 긴 설명문(summary)은 다른 식물을
  // 언급하는 일이 많아(예: "○○는 수국과 달리…") 검색 노이즈가 되므로 뺀다.
  const haystacks: string[] = [
    species.name,
    species.genus,
    species.scientificName,
    genus.name,
    ...(species.varieties?.flatMap((v) => [v.name, v.scientificName ?? '']) ?? []),
    ...(species.otherCultivars ?? []),
  ]
  return haystacks.some((h) => h.toLowerCase().includes(q))
}

/** 검색어로 종을 거른다. 빈 검색어면 전체를 그대로 반환한다. */
export function searchSpecies(query: string, list: CodexGenus[] = codex): SpeciesRef[] {
  const q = query.trim().toLowerCase()
  const all = allSpecies(list)
  if (!q) return all
  return all.filter((ref) => matches(ref, q))
}

export interface CategoryGroup {
  category: CodexCategory
  items: SpeciesRef[]
}

/** 카테고리 순서대로 묶는다. 비어 있는 카테고리는 뺀다. */
export function groupByCategory(refs: SpeciesRef[]): CategoryGroup[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: refs.filter((r) => r.species.category === category),
  })).filter((g) => g.items.length > 0)
}
