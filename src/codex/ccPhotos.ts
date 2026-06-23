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

/** 종 id → CC 사진. ②에서 점진 누적(현재: 수국 5종·작약 5종). 출처=위키미디어 공용, 자유 라이선스만(CC0·PD·BY·BY-SA). */
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
  // ── 작약·모란 5종 (② 둘째 배치) ─────────────────────────────
  'paeonia-lactiflora': {
    file: 'paeonia-lactiflora.jpg',
    author: 'Joanna Boisse',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Atlas_roslin_pl_Piwonia_chi%C5%84ska_10035_7511.jpg',
    title: 'Paeonia lactiflora (작약)',
  },
  'paeonia-suffruticosa': {
    file: 'paeonia-suffruticosa.jpg',
    author: 'Andrey Butko',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ab_plant_483.jpg',
    title: 'Paeonia suffruticosa (모란)',
  },
  'paeonia-itoh': {
    file: 'paeonia-itoh.jpg',
    author: 'F. D. Richards',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Paeonia_%27Bartzella%27_6_2021_Itoh-_(51218937473).jpg",
    title: "Paeonia Itoh 'Bartzella' (이토 작약)",
  },
  'paeonia-japonica': {
    file: 'paeonia-japonica.jpg',
    author: 'Alpsdake',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Paeonia_japonica_flower.JPG',
    title: 'Paeonia japonica (백작약)',
  },
  'paeonia-obovata': {
    file: 'paeonia-obovata.jpg',
    author: 'Motohiro Sunouchi',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Paeonia_obovata_%27Honoh_-_%E7%82%8E%27_Maxim.,_M%C3%A9m._Acad._Imp._Sci._St.-P%C3%A9tersbourg_Divers_Savans_9_39_(1859)_(40905468113).jpg",
    title: "Paeonia obovata 'Honoh' (산작약)",
  },
  // ── 구근 10종 (② 셋째 배치) ─────────────────────────────
  'tulip-main': {
    file: 'tulip-main.jpg',
    author: 'Dietmar Rabich',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:M%C3%BCnster,_Wolbeck,_Johannes_Blumenfelder,_Tulpen_--_2021_--_7833.jpg',
    title: 'Tulipa (튤립)',
  },
  'daffodil-main': {
    file: 'daffodil-main.jpg',
    author: 'JackyM59',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Fleur_de_narcisse_jaune_-_(Narcissus_pseudonarcissus).jpg',
    title: 'Narcissus (수선화)',
  },
  'hyacinth-main': {
    file: 'hyacinth-main.jpg',
    author: 'Sakartvelo',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Blue_flowers_Hyacinthus_orientalis.JPG',
    title: 'Hyacinthus orientalis (히아신스)',
  },
  'crocus-main': {
    file: 'crocus-main.jpg',
    author: 'Dirk Liesch',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Biene_im_Flug_an_Wildkrokus.jpg',
    title: 'Crocus (크로커스)',
  },
  'muscari-main': {
    file: 'muscari-main.jpg',
    author: 'OndraCalta trees',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mod%C5%99enec_(arm%C3%A9nsk%C3%BD%3F).jpg',
    title: 'Muscari (무스카리)',
  },
  'lily-main': {
    file: 'lily-main.jpg',
    author: 'Mike Peel (www.mikepeel.net)',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:At_Shugborough_2024_026.jpg',
    title: 'Lilium (백합·나리)',
  },
  'red-spider-lily-main': {
    file: 'red-spider-lily-main.jpg',
    author: 't.kunikuni',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cluster_amaryllis3.jpg',
    title: 'Lycoris radiata (꽃무릇·석산)',
  },
  'gladiolus-main': {
    file: 'gladiolus-main.jpg',
    author: 'Aw58',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mieczyki_w_wazonie_-_16.08.2024.jpg',
    title: 'Gladiolus (글라디올러스)',
  },
  'dahlia-main': {
    file: 'dahlia-main.jpg',
    author: 'Bengt Nyman from Vaxholm, Sweden',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dahlia_(52143078092).jpg',
    title: 'Dahlia (다알리아)',
  },
  'canna-main': {
    file: 'canna-main.jpg',
    author: 'PapiPijuan',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Canna_Indica_Flower.jpg',
    title: 'Canna (칸나)',
  },
}

export function getCcPhoto(speciesId: string): CcPhoto | undefined {
  return ccPhotos[speciesId]
}
