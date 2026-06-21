// 모두 KST(+9h) 기준. weather/format.ts todayKSTDate와 동일 규약.
function kstParts(ms: number): { y: number; m: number; d: number } {
  const k = new Date(ms + 9 * 3600 * 1000)
  return { y: k.getUTCFullYear(), m: k.getUTCMonth() + 1, d: k.getUTCDate() }
}

export function journalDateLabel(ms: number): string {
  const { m, d } = kstParts(ms)
  return `${m}월 ${d}일`
}

export function dateInputValue(ms: number): string {
  const { y, m, d } = kstParts(ms)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function parseDateInput(value: string): number {
  const [y, m, d] = value.split('-').map(Number)
  // 그날 KST 자정 = UTC 전날 15:00
  return Date.UTC(y, m - 1, d) - 9 * 3600 * 1000
}
