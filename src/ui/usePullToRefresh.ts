import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 70 // 이만큼(px) 당기면 새로고침이 발동한다
const MAX = 110 // 인디케이터 최대 높이

// 화면이 최상단인지 — window 스크롤·main 스크롤 어느 쪽이든 맨 위일 때만 당김을 받는다.
function atScrollTop() {
  const main = document.querySelector('main')
  return (window.scrollY || 0) <= 0 && (main ? main.scrollTop <= 0 : true)
}

/**
 * 모바일에서 화면 최상단을 아래로 당기면 onRefresh를 호출한다.
 * 반환값은 현재 당김 거리(px) — 인디케이터 높이로 쓴다.
 */
export function usePullToRefresh(onRefresh: () => void): number {
  const [distance, setDistance] = useState(0)
  const distanceRef = useRef(0) // 이벤트 핸들러에서 최신 거리를 읽기 위한 미러
  const startY = useRef<number | null>(null)
  const cb = useRef(onRefresh)
  cb.current = onRefresh

  useEffect(() => {
    function setPull(d: number) {
      distanceRef.current = d
      setDistance(d)
    }
    function start(e: TouchEvent) {
      startY.current = atScrollTop() ? e.touches[0].clientY : null
    }
    function move(e: TouchEvent) {
      if (startY.current == null) return
      const dy = e.touches[0].clientY - startY.current
      setPull(dy > 0 ? Math.min(dy, MAX) : 0)
    }
    function end() {
      if (startY.current == null) return
      const shouldRefresh = distanceRef.current >= THRESHOLD
      setPull(0)
      startY.current = null
      // setState(setPull) 밖에서 호출 — updater 안에서 부르면 렌더 중 setState 경고가 난다.
      if (shouldRefresh) cb.current()
    }
    window.addEventListener('touchstart', start, { passive: true })
    window.addEventListener('touchmove', move, { passive: true })
    window.addEventListener('touchend', end)
    window.addEventListener('touchcancel', end)
    return () => {
      window.removeEventListener('touchstart', start)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', end)
      window.removeEventListener('touchcancel', end)
    }
  }, [])

  return distance
}

export const PTR_THRESHOLD = THRESHOLD
