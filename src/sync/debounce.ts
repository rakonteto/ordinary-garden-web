export function debounce<T extends unknown[]>(fn: (...a: T) => void, ms: number) {
  let handle: ReturnType<typeof setTimeout> | null = null
  return {
    call(...args: T) {
      if (handle) clearTimeout(handle)
      handle = setTimeout(() => { handle = null; fn(...args) }, ms)
    },
    cancel() { if (handle) { clearTimeout(handle); handle = null } },
  }
}
