/** (w,h)를 비율 유지로 긴 변 maxEdge 이내에 맞춘 정수 크기. 이미 작으면 그대로. */
export function fitWithin(w: number, h: number, maxEdge: number): { w: number; h: number } {
  const longest = Math.max(w, h)
  if (longest <= maxEdge) return { w, h }
  const scale = maxEdge / longest
  return { w: Math.round(w * scale), h: Math.round(h * scale) }
}

/**
 * 사진을 긴 변 maxEdge·JPEG quality로 다운스케일한다.
 * canvas/createImageBitmap을 지원하지 않는 환경(jsdom·node)에서는 원본을 그대로 반환(폴백).
 * 실제 축소·화질은 브라우저 실검증으로 확인한다.
 */
export async function downscaleImage(blob: Blob, maxEdge = 2048, quality = 0.8): Promise<Blob> {
  const canCanvas =
    typeof createImageBitmap === 'function' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function'
  if (!canCanvas) return blob
  try {
    const bitmap = await createImageBitmap(blob)
    const { w, h } = fitWithin(bitmap.width, bitmap.height, maxEdge)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return blob
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()
    const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))
    return out ?? blob
  } catch {
    return blob // 디코딩 실패 시 원본 유지(비파괴)
  }
}
