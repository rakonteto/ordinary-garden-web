export function relativeSyncTime(ts: number | null, now: number): string {
  if (ts == null) return '아직 동기화 안 함'
  const sec = Math.max(0, Math.floor((now - ts) / 1000))
  if (sec < 60) return '방금 전'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  return `${Math.floor(hr / 24)}일 전`
}
