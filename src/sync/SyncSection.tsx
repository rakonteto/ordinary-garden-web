import { useSync } from './useSync'
import { relativeSyncTime } from './relativeTime'
import './SyncSection.css'

export default function SyncSection() {
  const { status, lastSyncedAt, signedIn, configured, error, syncNow, signIn, signOut } = useSync()

  if (!configured) {
    return (
      <section className="sync-card">
        <h2 className="sync-title">동기화</h2>
        <p className="sync-muted">동기화 미설정 — 앱은 이 기기에 정상 저장됩니다.</p>
      </section>
    )
  }

  return (
    <section className="sync-card">
      <h2 className="sync-title">동기화</h2>
      {!signedIn ? (
        <>
          <p className="sync-muted">아내 구글 계정으로 로그인하면 아이폰·아이패드·랩탑이 함께 동기화됩니다.</p>
          <button className="sync-btn sync-btn-primary" onClick={() => void signIn()}>구글로 로그인</button>
        </>
      ) : (
        <>
          <p className="sync-status">
            {status === 'syncing' ? '동기화 중…' : `마지막 동기화 · ${relativeSyncTime(lastSyncedAt, Date.now())}`}
          </p>
          {error && <p className="sync-error">동기화 실패 — 잠시 후 다시 시도해 주세요.</p>}
          {error && (
            <p className="sync-error" style={{ fontSize: '0.72rem', opacity: 0.75, wordBreak: 'break-all', marginTop: '0.25rem' }}>
              {error}
            </p>
          )}
          <div className="sync-actions">
            <button className="sync-btn sync-btn-primary" disabled={status === 'syncing'} onClick={() => void syncNow()}>
              지금 동기화
            </button>
            <button className="sync-btn" onClick={() => signOut()}>로그아웃</button>
          </div>
        </>
      )}
    </section>
  )
}
