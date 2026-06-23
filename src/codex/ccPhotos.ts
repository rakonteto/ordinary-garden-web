// CC(크리에이티브 커먼즈) 사진 매핑의 단일 출처. ②에서 점진적으로 채운다.
// 이미지 바이너리는 공개 데이터 repo(ordinary-garden-data/codex/)에 두고 CC_BASE로 참조한다.

export interface CcPhoto {
  file: string // 데이터 repo 내 파일명 (예: "hydrangea-macrophylla.jpg")
  author: string // 저작자 표시
  license: string // 예: "CC BY 4.0" | "CC BY-SA 4.0" | "CC0" | "Public Domain"
  licenseUrl: string // 라이선스 전문 링크
  sourceUrl: string // 원본 출처(예: 위키미디어 파일 페이지)
  title?: string
}

export const CC_BASE = 'https://rakonteto.github.io/ordinary-garden-data/codex/'

/** 종 id → CC 사진. ②에서 점진 누적(현재: 수국 5종). 출처=위키미디어 공용, 자유 라이선스만(CC0·PD·BY·BY-SA). */
export const ccPhotos: Record<string, CcPhoto> = {
  'hydrangea-macrophylla': {
    file: 'hydrangea-macrophylla.jpg',
    author: 'Michele Dorsey Walfred',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Blue_Hydrangea_Mathilda_Gutges_-blueflower.jpg',
    title: 'Blue Hydrangea (Mathilda Gutges)',
  },
  'hydrangea-serrata': {
    file: 'hydrangea-serrata.jpg',
    author: 'Motohiro Sunouchi',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Hydrangea_serrata_var._serrata_%27%E4%BB%81%E6%B7%80%E5%85%AB%E9%87%8D_-_Niyodo_Yae%27_20260606_193423.jpg',
    title: 'Hydrangea serrata (Niyodo Yae)',
  },
  'hydrangea-paniculata': {
    file: 'hydrangea-paniculata.jpg',
    author: 'Strubbl',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Bl%C3%BCte_der_Rispen-Hortensie_2024-08-22.jpg',
    title: 'Blüte der Rispen-Hortensie',
  },
  'hydrangea-arborescens': {
    file: 'hydrangea-arborescens.jpg',
    author: 'Mike Peel (www.mikepeel.net)',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:At_Dunham_Massey_2023_61.jpg',
    title: 'At Dunham Massey (Annabelle-type)',
  },
  'hydrangea-quercifolia': {
    file: 'hydrangea-quercifolia.jpg',
    author: 'Denis.prévôt',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hydrangea_quercifolia_-_Fleurs-2.jpg',
    title: 'Hydrangea quercifolia (Fleurs)',
  },
}

export function getCcPhoto(speciesId: string): CcPhoto | undefined {
  return ccPhotos[speciesId]
}
