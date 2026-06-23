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
  // ── 한해살이 10종 (② 넷째 배치) ─────────────────────────────
  'petunia-main': {
    file: 'petunia-main.jpg',
    author: 'Anik Sarker',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Surfinia_Purple_Flower.jpg',
    title: 'Petunia (페튜니아)',
  },
  'marigold-main': {
    file: 'marigold-main.jpg',
    author: 'Sixflashphoto',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Inniswood_-_Tagetes_erecta_1.jpg',
    title: 'Tagetes (메리골드)',
  },
  'pansy-main': {
    file: 'pansy-main.jpg',
    author: 'Agnieszka Kwiecień, Nova',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Viola_x_wittrockiana_%27Carneval_Cherry%27_Bratek_ogrodowy_2018-04-15_01_(2).jpg",
    title: 'Viola × wittrockiana (팬지·비올라)',
  },
  'balsam-main': {
    file: 'balsam-main.jpg',
    author: 'Astari28',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bunga_Pacar_Air.png',
    title: 'Impatiens balsamina (봉선화·봉숭아)',
  },
  'cosmos-main': {
    file: 'cosmos-main.jpg',
    author: 'Juan Carlos Fonseca Mata',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mirasol_(Cosmos_bipinnatus).jpg',
    title: 'Cosmos bipinnatus (코스모스)',
  },
  'portulaca-main': {
    file: 'portulaca-main.jpg',
    author: 'Darkpeanut',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Fleur_Portulaca_grandiflora.jpg',
    title: 'Portulaca grandiflora (채송화)',
  },
  'zinnia-main': {
    file: 'zinnia-main.jpg',
    author: 'Ermell',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Zinnienbl%C3%BCte_Zinnia_elegans_stack15_20190722-RM-7222254.jpg',
    title: 'Zinnia elegans (백일홍·백일초)',
  },
  'sunflower-main': {
    file: 'sunflower-main.jpg',
    author: 'Andreas Eichler',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:2017.07.18.-01-Ahrensdorf_Rietz-Neuendorf--Sonnenblumenfeld.jpg',
    title: 'Helianthus annuus (해바라기)',
  },
  'celosia-main': {
    file: 'celosia-main.jpg',
    author: 'ProtoplasmaKid',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Celosia_cristata_(terciopelo)_-_flor_de_D%C3%ADa_de_Muertos_-_Closeup_-_2.jpg',
    title: 'Celosia (맨드라미)',
  },
  'scarlet-sage-main': {
    file: 'scarlet-sage-main.jpg',
    author: 'Maurice07',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Flower_-_Istanbul.jpg',
    title: 'Salvia splendens (샐비어·사루비아)',
  },
  // ── 숙근 11종 (② 다섯째 배치) ─────────────────────────────
  'chrysanthemum-main': {
    file: 'chrysanthemum-main.jpg',
    author: 'Ermell',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Chrysantheme_rot_tautropfen_-20191024-RM-102058.jpg',
    title: 'Chrysanthemum × morifolium (국화)',
  },
  'hosta-main': {
    file: 'hosta-main.jpg',
    author: 'Mike Peel (www.mikepeel.net)',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:At_Berrington_Hall_2022_116.jpg',
    title: 'Hosta (옥잠화·호스타)',
  },
  'iris-main': {
    file: 'iris-main.jpg',
    author: 'Ermell',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Iris_versicolor_-20200620-RM-100933.jpg',
    title: 'Iris (붓꽃·아이리스)',
  },
  'gujeolcho-main': {
    file: 'gujeolcho-main.jpg',
    author: 'Averater',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Chrysanthemum_zawadskii_ssp._acutilobum_var._alpinum_GotBot_2015_001.jpg',
    title: 'Dendranthema zawadskii (구절초)',
  },
  'korean-aster-main': {
    file: 'korean-aster-main.jpg',
    author: 'Dalgial (파생: Sang Seo)',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:%EB%B2%8C%EA%B0%9C%EB%AF%B8%EC%B7%A8_%EA%B0%80%EA%B9%8C%EC%9D%B4-2.JPG',
    title: 'Aster koraiensis (벌개미취)',
  },
  'coreopsis-main': {
    file: 'coreopsis-main.jpg',
    author: 'houroumono',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Coreopsis_lanceolata_(14254188771).jpg',
    title: 'Coreopsis (금계국·큰금계국)',
  },
  'rudbeckia-main': {
    file: 'rudbeckia-main.jpg',
    author: 'Sander van der Wel from Netherlands',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Autumn_flowers_(10376232316).jpg',
    title: 'Rudbeckia (루드베키아)',
  },
  'echinacea-main': {
    file: 'echinacea-main.jpg',
    author: 'Krzysztof Golik',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Echinacea_purpurea_in_Jardin_botanique_de_la_Charme_01.jpg',
    title: 'Echinacea purpurea (에키네시아)',
  },
  'shasta-daisy-main': {
    file: 'shasta-daisy-main.jpg',
    author: 'Sankar 1995',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:White_Shasta_Daisies-_Shola_Gardens_-_Kotagiri.jpg',
    title: 'Leucanthemum × superbum (샤스타데이지)',
  },
  'hollyhock-main': {
    file: 'hollyhock-main.jpg',
    author: 'S.G.S.',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Alcea_ficifolia_IMG_1983.jpg',
    title: 'Alcea (접시꽃)',
  },
  'balloon-flower-main': {
    file: 'balloon-flower-main.jpg',
    author: 'Krzysztof Golik',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Platycodon_grandiflorus_in_Jardin_botanique_de_la_Charme.jpg',
    title: 'Platycodon grandiflorus (도라지)',
  },
  // ── 덩굴·화목 11종 (② 여섯째 배치) ─────────────────────────────
  'clematis-main': {
    file: 'clematis-main.jpg',
    author: 'Bengt Nyman from Vaxholm, Sweden',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:A7R09085_(52138013652).jpg',
    title: 'Clematis (클레마티스)',
  },
  'trumpet-vine-main': {
    file: 'trumpet-vine-main.jpg',
    author: 'Zythème',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Campsis_grandiflora,_2.jpg',
    title: 'Campsis grandiflora (능소화)',
  },
  'wisteria-main': {
    file: 'wisteria-main.jpg',
    author: 'Tangopaso',
    license: 'Public Domain',
    licenseUrl: 'https://creativecommons.org/publicdomain/mark/1.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Abbaye_de_L%C3%A9rins,_wisteria_in_the_yard_of_the_church.jpg',
    title: 'Wisteria floribunda (등나무)',
  },
  'morning-glory-main': {
    file: 'morning-glory-main.jpg',
    author: 'Melgisan',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ipomoea_Nil_Flower.jpg',
    title: 'Ipomoea nil (나팔꽃)',
  },
  'azalea-jindalrae-main': {
    file: 'azalea-jindalrae-main.jpg',
    author: '최광모',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:20150331%EC%B5%9C%EA%B4%91%EB%AA%A8123.jpg',
    title: 'Rhododendron mucronulatum (진달래)',
  },
  'azalea-cheoljjuk-main': {
    file: 'azalea-cheoljjuk-main.jpg',
    author: 'Cephas',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rhododendron_schlippenbachii_JRVdH_07.jpg',
    title: 'Rhododendron schlippenbachii (철쭉)',
  },
  'camellia-main': {
    file: 'camellia-main.jpg',
    author: 'Motohiro Sunouchi',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Camellia_japonica_%27Izumo-no-okuni_%E5%87%BA%E9%9B%B2%E9%98%BF%E5%9B%BD%27_L.-_Sp._Pl._2-_698_(1753)_20240216_174759.jpg",
    title: 'Camellia japonica (동백)',
  },
  'rose-of-sharon-main': {
    file: 'rose-of-sharon-main.jpg',
    author: 'Sevayuu',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Hibiscus_syriacus_purple_flower_in_Tashkent_Region.jpg',
    title: 'Hibiscus syriacus (무궁화)',
  },
  'lilac-main': {
    file: 'lilac-main.jpg',
    author: 'Joselodos',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Syringa_vulgaris_in_bloom.jpg',
    title: 'Syringa (라일락·수수꽃다리)',
  },
  'magnolia-main': {
    file: 'magnolia-main.jpg',
    author: 'Susanne Nilsson',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Magnolia_(34982957795).jpg',
    title: 'Magnolia (목련)',
  },
  'forsythia-main': {
    file: 'forsythia-main.jpg',
    author: 'Palberts9956',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yellow_Flowers_2020.jpg',
    title: 'Forsythia koreana (개나리)',
  },
}

export function getCcPhoto(speciesId: string): CcPhoto | undefined {
  return ccPhotos[speciesId]
}
