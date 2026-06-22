// src/sync/gis.d.ts — GIS 토큰 모델 최소 타입(런타임 의존성 없이 타입만)
declare namespace google.accounts.oauth2 {
  interface TokenResponse { access_token?: string; expires_in?: number; error?: string }
  interface TokenClient { callback: (r: TokenResponse) => void; requestAccessToken(opts?: { prompt?: '' | 'consent' }): void }
  function initTokenClient(cfg: { client_id: string; scope: string; callback: (r: TokenResponse) => void }): TokenClient
}
