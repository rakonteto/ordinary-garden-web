// 식물 도감(codex) 스키마
//
// 계층: 속(genus) > 종(species) > 품종(variety).
// - 재배·관리 정보는 종(species) 카드에 담는다(도감의 기본 단위).
// - 품종(variety) 카드는 종 정보를 "상속"하고, 재배가 달라지는 부분과 고유 특성만 덮어쓴다.
// - 같은 종 안에서 꽃색만 다른 정도의 품종은 별도 카드로 만들지 않고 종 카드 안에서 언급한다.
//   재배·관리(전정·월동 등)가 갈리는 품종만 별도 카드로 둔다.
//
// 종을 어디서 가르나 = "재배·관리가 갈리는 단위". 예: 수국은 종마다 전정 시기가
// 묵은 가지 ↔ 새 가지로 정반대라 반드시 종을 구분해야 한다.
//
// 값은 한국어, 키는 영문(camelCase). 정확도가 중요한 항목(내한성·전정시기·지역 월동)은
// 웹 자료로 대조해 작성한다.

export type CodexCategory =
  | '화훼' // 꽃·관상 목적(노지 정원식물)
  | '과수' // 열매를 먹는 나무·관목
  | '채소' // 텃밭 채소
  | '관엽' // 잎 보기 실내식물
  | '허브'
  | '다육'
  | '기타'

/** 품종(variety) 카드 — 종 정보를 상속하고, 종과 달라지는 부분·고유 특성만 채운다. */
export interface CodexVariety {
  id: string
  name: string // 품종명 (예: "엔드리스 서머")
  scientificName?: string // 예: "Hydrangea macrophylla 'Endless Summer'"
  trait: string // 이 품종을 고르는 이유·고유 특성 (한두 줄)
  // 아래는 종과 달라질 때만 채운다(채우지 않으면 종 값을 따른다).
  bloomType?: string
  hardiness?: string
  care?: string
  season?: string
  tip?: string
}

/** 종(species) 카드 — 도감의 기본 단위. 재배·관리 정보를 담는다. */
export interface CodexSpecies {
  id: string
  genus: string // 통칭 (예: "수국")
  name: string // 종명 (예: "큰잎수국")
  scientificName: string // 예: "Hydrangea macrophylla"
  category: CodexCategory
  form: string // 수형·생육형·크기 (예: "낙엽 관목, 높이 0.9~1.8m" / "한해살이 잎채소")
  // 개화 습성 — 화훼는 전정의 근거(예: "묵은 가지에 핀다"). 채소·과수는 해당 시에만
  // (추대·결실 특성 등), 없으면 비운다.
  bloomType?: string
  hardiness: string // 우리 지역(중부) 내한성·노지 월동(채소는 재배 적기·월동 여부)
  soil: string // 토양 (수국은 pH↔꽃색 관계 포함)
  water: string
  light: string
  care: string // 전정·시비 등 관리
  pest: string // 흔한 병해충·대처
  season: string // 개화/수확 시기
  tip: string // 핵심 팁
  varieties?: CodexVariety[]
  // 카드로 따로 두지 않은, 이 종·계통의 그 밖의 한국 유통 품종(망라용 이름 목록).
  // 재배·관리가 종과 같아 카드가 불필요하지만 "빠짐없이" 담기 위한 칸.
  otherCultivars?: string[]
}

/** 속(genus) 묶음 — 통칭으로 종들을 묶는다. */
export interface CodexGenus {
  id: string
  name: string // 통칭 (예: "수국")
  scientificName: string // 속 학명 (예: "Hydrangea")
  category: CodexCategory
  summary: string // 통칭 수준 소개 + 종을 가르는 이유
  species: CodexSpecies[]
}
