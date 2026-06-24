import { useEffect } from 'react'
import WeatherSummaryCard from '../weather/WeatherSummaryCard'
import CareTodaySection from '../care/CareTodaySection'
import { weatherStore, useWeather } from '../weather/useWeather'
import { usePullToRefresh, PTR_THRESHOLD } from '../ui/usePullToRefresh'
import './TodayRoute.css'

export default function TodayRoute() {
  const { isRefreshing } = useWeather()

  // 오늘 탭에 들어오거나, 앱이 다시 보일 때 최신 날씨로 갱신한다.
  // 마운트 직후 동기 갱신은 형제(WeatherSummaryCard) 리렌더와 겹쳐 경고를 내므로 한 틱 미룬다.
  useEffect(() => {
    const t = setTimeout(() => void weatherStore.refresh(), 0)
    function onVisible() {
      if (document.visibilityState === 'visible') void weatherStore.refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // 화면을 아래로 당기면 새로고침(모바일).
  const pull = usePullToRefresh(() => void weatherStore.refresh())
  const indicatorH = isRefreshing ? 32 : pull
  const label = isRefreshing
    ? '새로고침 중…'
    : pull >= PTR_THRESHOLD
      ? '놓으면 새로고침'
      : '당겨서 새로고침'

  return (
    <section
      className="today"
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-4)' }}
    >
      <div className="today__ptr" style={{ height: indicatorH }} aria-hidden={indicatorH === 0}>
        {indicatorH > 0 ? label : null}
      </div>
      <h1>오늘</h1>
      <WeatherSummaryCard />
      <CareTodaySection />
    </section>
  )
}
