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

/** 종 id → CC 사진. ②에서 채운다(지금은 비어 있어 자연히 이모지로 폴백). */
export const ccPhotos: Record<string, CcPhoto> = {}

export function getCcPhoto(speciesId: string): CcPhoto | undefined {
  return ccPhotos[speciesId]
}
