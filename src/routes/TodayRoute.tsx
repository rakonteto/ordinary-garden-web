import WeatherSummaryCard from '../weather/WeatherSummaryCard'

export default function TodayRoute() {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
      <h1>오늘</h1>
      <WeatherSummaryCard />
    </section>
  )
}
