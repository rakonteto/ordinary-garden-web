export function tempString(v: number | null | undefined): string {
  return v == null ? '—' : String(Math.round(v))
}

export function percentString(v: number | null | undefined): string {
  return v == null ? '—' : `${v}%`
}

export function mmString(v: number | null | undefined): string {
  if (v == null) return '—'
  return v === 0 ? '0mm' : `${v.toFixed(1)}mm`
}

export function windString(v: number | null | undefined): string {
  return v == null ? '—' : `${v.toFixed(1)}㎧`
}

// generatedAt(UTC) → "방금 전/N분 전/N시간 전/N일 전". 파싱 실패 "—", 미래 "방금 전".
export function relativeFreshness(generatedAt: string, now: number): string {
  const then = Date.parse(generatedAt)
  if (Number.isNaN(then)) return '—'
  const sec = Math.max(0, (now - then) / 1000)
  const minutes = Math.floor(sec / 60)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

// ISO "+09:00" 문자열은 이미 KST → 시(hour) 필드를 직접 읽어 12시간제로.
export function hourLabel(isoKST: string): string {
  const h24 = Number(isoKST.slice(11, 13))
  const ampm = h24 < 12 ? '오전' : '오후'
  let h = h24 % 12
  if (h === 0) h = 12
  return `${ampm} ${h}시`
}

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']
export function weekdayLabel(date: string, today: string): string {
  if (date === today) return '오늘'
  const [y, m, d] = date.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  return WEEKDAY[dow]
}

// epoch ms → KST "YYYY-MM-DD"(+9h 후 UTC 날짜).
export function todayKSTDate(now: number): string {
  return new Date(now + 9 * 3600 * 1000).toISOString().slice(0, 10)
}
