import SyncSection from '../sync/SyncSection'
import LlmSection from '../llm/LlmSection'

export default function SettingsRoute() {
  return (
    <section style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h1>설정</h1>
      <SyncSection />
      <LlmSection />
    </section>
  )
}
