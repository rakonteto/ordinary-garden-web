import { useEffect, useState } from 'react'
import type { CodexCategory } from './types'
import { CATEGORY_EMOJI } from './categories'
import { getPhoto } from '../data/photos'
import { useSpeciesCoverPhotoId } from './photoStore'
import { getCcPhoto, CC_BASE } from './ccPhotos'
import './SpeciesPhoto.css'

interface Props {
  speciesId: string
  category: CodexCategory
  variant: 'card' | 'detail'
  alt: string
}

/** 종 사진을 우선순위(내 사진 > CC > 이모지)대로 해석해 렌더한다. */
export default function SpeciesPhoto({ speciesId, category, variant, alt }: Props) {
  const minePhotoId = useSpeciesCoverPhotoId(speciesId)
  const [mineUrl, setMineUrl] = useState<string | null>(null)

  // 내 사진 blob → object URL (PlantPhoto 패턴).
  useEffect(() => {
    setMineUrl(null)
    if (!minePhotoId) return
    let revoked = false
    let objectUrl: string | null = null
    void getPhoto(minePhotoId).then((photo) => {
      if (revoked || !photo?.blob) return
      objectUrl = URL.createObjectURL(photo.blob)
      setMineUrl(objectUrl)
    })
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [minePhotoId])

  const cls = `sphoto sphoto--${variant}`

  // 1) 내 사진 — 있으면 무조건 우선. 로딩 중엔 폴백 대신 빈 자리(깜빡임 방지).
  if (minePhotoId) {
    return mineUrl ? (
      <img className={cls} src={mineUrl} alt={alt} />
    ) : (
      <span className={`${cls} sphoto--loading`} aria-hidden />
    )
  }

  // 2) CC 사진
  const cc = getCcPhoto(speciesId)
  if (cc) {
    const img = <img className={cls} src={CC_BASE + cc.file} alt={alt} loading="lazy" />
    if (variant === 'detail') {
      return (
        <figure className="sphoto__fig">
          {img}
          <figcaption className="sphoto__cc">
            사진 © {cc.author} ·{' '}
            <a href={cc.licenseUrl} target="_blank" rel="noreferrer noopener">
              {cc.license}
            </a>
            {' · '}
            <a href={cc.sourceUrl} target="_blank" rel="noreferrer noopener">
              출처
            </a>
          </figcaption>
        </figure>
      )
    }
    return img
  }

  // 3) 폴백 — 카테고리 이모지
  return (
    <span className={`${cls} sphoto--emoji`} aria-hidden>
      {CATEGORY_EMOJI[category]}
    </span>
  )
}
