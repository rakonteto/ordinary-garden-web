const DRIVE_APPDATA = 'https://www.googleapis.com/auth/drive.appdata'
const MARGIN_MS = 60_000 // 만료 1분 전이면 재발급

export class TokenCache {
  private token: string | null = null
  private expiresAt = 0
  set(token: string, expiresInSec: number, now = Date.now()) {
    this.token = token
    this.expiresAt = now + expiresInSec * 1000
  }
  get(now = Date.now()): string | null {
    if (!this.token) return null
    if (now >= this.expiresAt - MARGIN_MS) return null
    return this.token
  }
  clear() {
    this.token = null
    this.expiresAt = 0
  }
}

export interface TokenProvider {
  getToken(): Promise<string>
  signIn(): Promise<void>
  signOut(): void
  isSignedIn(): boolean
}

let scriptPromise: Promise<void> | null = null
/** GIS 클라이언트 스크립트를 1회만 로드(idempotent). */
export function loadGisScript(): Promise<void> {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gis]')
    if (existing) return resolve()
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.dataset.gis = '1'
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('GIS 스크립트 로드 실패'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

/**
 * Google Identity Services 토큰 모델 기반 TokenProvider.
 * drive.appdata 스코프 1개만 요청. 액세스 토큰은 메모리(TokenCache)에만 둔다.
 * 만료 시 prompt:'' 무프롬프트 재발급 시도 → 실패하면 signIn() 재요청 유도.
 */
export function createGisTokenProvider(clientId: string): TokenProvider {
  const cache = new TokenCache()
  let signedIn = false
  // GIS TokenClient는 lazy 생성(스크립트 로드 후).
  let client: google.accounts.oauth2.TokenClient | null = null

  async function ensureClient() {
    await loadGisScript()
    if (!client) {
      client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: DRIVE_APPDATA,
        callback: () => {}, // requestToken에서 per-call 콜백으로 덮어씀
      })
    }
    return client
  }

  async function requestToken(prompt: '' | 'consent'): Promise<string> {
    const c = await ensureClient()
    return new Promise((resolve, reject) => {
      c.callback = (resp: google.accounts.oauth2.TokenResponse) => {
        if (resp.error || !resp.access_token) return reject(new Error(resp.error || 'no token'))
        cache.set(resp.access_token, Number(resp.expires_in ?? 3600))
        signedIn = true
        resolve(resp.access_token)
      }
      c.requestAccessToken({ prompt })
    })
  }

  return {
    async getToken() {
      const cached = cache.get()
      if (cached) return cached
      return requestToken('') // 무프롬프트 갱신
    },
    async signIn() {
      await requestToken('consent')
    },
    signOut() {
      cache.clear()
      signedIn = false
    },
    isSignedIn() {
      return signedIn
    },
  }
}
