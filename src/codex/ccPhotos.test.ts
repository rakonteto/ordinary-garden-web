import { describe, it, expect } from 'vitest'
import { ccPhotos, getCcPhoto, type CcPhoto } from './ccPhotos'
import { findSpecies } from './search'

// ② 첫 배치 = 수국 5종.
const HYDRANGEA_SPECIES = [
  'hydrangea-macrophylla',
  'hydrangea-serrata',
  'hydrangea-paniculata',
  'hydrangea-arborescens',
  'hydrangea-quercifolia',
]

// ② 둘째 배치 = 작약·모란 5종.
const PEONY_SPECIES = [
  'paeonia-lactiflora',
  'paeonia-suffruticosa',
  'paeonia-itoh',
  'paeonia-japonica',
  'paeonia-obovata',
]

// ② 셋째 배치 = 구근 10종.
const BULB_SPECIES = [
  'tulip-main',
  'daffodil-main',
  'hyacinth-main',
  'crocus-main',
  'muscari-main',
  'lily-main',
  'red-spider-lily-main',
  'gladiolus-main',
  'dahlia-main',
  'canna-main',
]

// ② 넷째 배치 = 한해살이 10종.
const ANNUAL_SPECIES = [
  'petunia-main',
  'marigold-main',
  'pansy-main',
  'balsam-main',
  'cosmos-main',
  'portulaca-main',
  'zinnia-main',
  'sunflower-main',
  'celosia-main',
  'scarlet-sage-main',
]

// ② 다섯째 배치 = 숙근 11종.
const PERENNIAL_SPECIES = [
  'chrysanthemum-main',
  'hosta-main',
  'iris-main',
  'gujeolcho-main',
  'korean-aster-main',
  'coreopsis-main',
  'rudbeckia-main',
  'echinacea-main',
  'shasta-daisy-main',
  'hollyhock-main',
  'balloon-flower-main',
]

// 공개·무료 배포에 안전한 자유 라이선스만 허용한다(NC/ND 불가).
const ALLOWED_LICENSE = /^(CC0|Public Domain|CC BY \d\.\d|CC BY-SA \d\.\d)$/

describe('ccPhotos — CC 사진 매핑', () => {
  it('수국 5종이 모두 매핑돼 있다(② 첫 배치)', () => {
    for (const id of HYDRANGEA_SPECIES) {
      expect(ccPhotos[id], `${id} 누락`).toBeDefined()
      expect(getCcPhoto(id)).toBe(ccPhotos[id])
    }
  })

  it('작약·모란 5종이 모두 매핑돼 있다(② 둘째 배치)', () => {
    for (const id of PEONY_SPECIES) {
      expect(ccPhotos[id], `${id} 누락`).toBeDefined()
      expect(getCcPhoto(id)).toBe(ccPhotos[id])
    }
  })

  it('구근 10종이 모두 매핑돼 있다(② 셋째 배치)', () => {
    for (const id of BULB_SPECIES) {
      expect(ccPhotos[id], `${id} 누락`).toBeDefined()
      expect(getCcPhoto(id)).toBe(ccPhotos[id])
    }
  })

  it('한해살이 10종이 모두 매핑돼 있다(② 넷째 배치)', () => {
    for (const id of ANNUAL_SPECIES) {
      expect(ccPhotos[id], `${id} 누락`).toBeDefined()
      expect(getCcPhoto(id)).toBe(ccPhotos[id])
    }
  })

  it('숙근 11종이 모두 매핑돼 있다(② 다섯째 배치)', () => {
    for (const id of PERENNIAL_SPECIES) {
      expect(ccPhotos[id], `${id} 누락`).toBeDefined()
      expect(getCcPhoto(id)).toBe(ccPhotos[id])
    }
  })

  const entries = Object.entries(ccPhotos)

  it('모든 key가 실제 종 id다(오타·유령 매핑 차단)', () => {
    for (const [id] of entries) {
      expect(findSpecies(id), `${id} = 존재하지 않는 종`).not.toBeNull()
    }
  })

  it('모든 엔트리에 필수 메타가 채워져 있다', () => {
    const required: (keyof CcPhoto)[] = ['file', 'author', 'license', 'licenseUrl', 'sourceUrl']
    for (const [id, p] of entries) {
      for (const field of required) {
        expect(p[field], `${id}.${field} 비어 있음`).toBeTruthy()
      }
    }
  })

  it('파일명은 "<종id>.jpg" 규칙을 따른다', () => {
    for (const [id, p] of entries) {
      expect(p.file).toBe(`${id}.jpg`)
    }
  })

  it('라이선스는 자유 라이선스만(NC/ND 불가)', () => {
    for (const [id, p] of entries) {
      expect(p.license, `${id}: ${p.license}`).toMatch(ALLOWED_LICENSE)
      expect(p.license).not.toMatch(/\bN[CD]\b/)
    }
  })

  it('라이선스·출처 링크는 https URL이다', () => {
    for (const [id, p] of entries) {
      expect(p.licenseUrl, `${id}.licenseUrl`).toMatch(/^https:\/\//)
      expect(p.sourceUrl, `${id}.sourceUrl`).toMatch(/^https:\/\//)
    }
  })
})
