import { useEffect, useState } from 'react'
import { getPhoto } from '../data/photos'

interface Props {
  photoId?: string
  alt: string
  className?: string
}

/** photoId의 Blob을 object URL로 표시. 없으면 sage + leaf 플레이스홀더. */
export default function PlantPhoto({ photoId, alt, className }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    setUrl(null)
    if (!photoId) return
    let revoked = false
    let objectUrl: string | null = null
    void getPhoto(photoId).then((photo) => {
      if (revoked || !photo?.blob) return
      objectUrl = URL.createObjectURL(photo.blob)
      setUrl(objectUrl)
    })
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [photoId])

  if (!url) {
    return (
      <div className={`plant-photo plant-photo--empty ${className ?? ''}`} data-testid="plant-photo-placeholder" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a8 8 0 0 1-9 10" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6" />
        </svg>
      </div>
    )
  }
  return <img className={`plant-photo ${className ?? ''}`} src={url} alt={alt} />
}
