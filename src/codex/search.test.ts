import { describe, it, expect } from 'vitest'
import {
  allSpecies,
  findSpecies,
  searchSpecies,
  groupByCategory,
  CATEGORY_ORDER,
} from './search'

describe('도감 검색·분류', () => {
  it('codex가 비어 있지 않다', () => {
    expect(allSpecies().length).toBeGreaterThan(100)
  })

  it('모든 종 id가 유일하다(상세 라우트가 id로 종을 찾으므로 충돌 금지)', () => {
    const ids = allSpecies().map((r) => r.species.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('모든 종 category가 정의된 순서에 들어 있다', () => {
    for (const { species } of allSpecies()) {
      expect(CATEGORY_ORDER).toContain(species.category)
    }
  })

  it('빈 검색어는 전체를 반환한다', () => {
    expect(searchSpecies('')).toHaveLength(allSpecies().length)
    expect(searchSpecies('   ')).toHaveLength(allSpecies().length)
  })

  it('통칭으로 검색된다 (수국 속이 결과에 포함)', () => {
    const r = searchSpecies('수국')
    expect(r.length).toBeGreaterThan(0)
    expect(r.some(({ genus }) => genus.name === '수국')).toBe(true)
  })

  it('학명으로 검색된다 (대소문자 무시, Hydrangea)', () => {
    expect(searchSpecies('hydrangea').length).toBeGreaterThan(0)
    expect(searchSpecies('HYDRANGEA').length).toBe(searchSpecies('hydrangea').length)
  })

  it('품종명으로도 검색된다', () => {
    // 품종을 가진 아무 종을 찾아 그 품종명으로 검색되는지 확인.
    const withVariety = allSpecies().find((r) => (r.species.varieties?.length ?? 0) > 0)
    expect(withVariety).toBeDefined()
    const varName = withVariety!.species.varieties![0].name
    const hit = searchSpecies(varName)
    expect(hit.some((r) => r.species.id === withVariety!.species.id)).toBe(true)
  })

  it('없는 검색어는 빈 배열', () => {
    expect(searchSpecies('존재하지않는식물zzz')).toHaveLength(0)
  })

  it('findSpecies는 id로 종과 속을 함께 찾는다', () => {
    const first = allSpecies()[0]
    const found = findSpecies(first.species.id)
    expect(found?.species.id).toBe(first.species.id)
    expect(found?.genus).toBeDefined()
    expect(findSpecies('없는id')).toBeNull()
  })

  it('groupByCategory는 카테고리 순서를 지키고 빈 묶음을 뺀다', () => {
    const groups = groupByCategory(allSpecies())
    expect(groups.length).toBeGreaterThan(0)
    expect(groups.every((g) => g.items.length > 0)).toBe(true)
    const order = groups.map((g) => CATEGORY_ORDER.indexOf(g.category))
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('groupByCategory가 모든 종을 빠짐없이 담는다', () => {
    const total = groupByCategory(allSpecies()).reduce((n, g) => n + g.items.length, 0)
    expect(total).toBe(allSpecies().length)
  })
})
