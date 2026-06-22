const DRIVE_APPDATA = 'https://www.googleapis.com/auth/drive.appdata'
const MARGIN_MS = 60_000 // 만료 1분 전이면 무효 취급
const STORAGE_KEY = 'og.sync.token.v1'

/**
 * 액세스 토큰 캐시. localStorage에 영속해 콜드스타트(앱 재시작)에서도 복원한다.
 * GIS 토큰 모델은 무프롬프트(prompt:'') 재발급도 팝업 기반(사용자 제스처 필요)이라
 * 콜드스타트 silent 재인증이 구조적으로 불가하다(iOS PWA서 팝업 차단). 그래서
 * 유효한 액세스 토큰(스코프 drive.appdata·1h 만료)을 로컬에 두고 만료 전까지 재사용한다.
 */
export class TokenCache {
  private token: string | null = null
  private expiresAt = 0

  constructor() {
    this.restore()
  }

  set(token: string, expiresInSec: number, now = Date.now()) {
    this.token = token
    this.expiresAt = now + expiresInSec * 1000
    this.persist()
  }

  get(now = Date.now()): string | null {
    if (!this.token) return null
    if (now >= this.expiresAt - MARGIN_MS) return null
    return this.token
  }

  clear() {
    this.token = null
    this.expiresAt = 0
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* localStorage 불가 환경 무시 */
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: this.token, expiresAt: this.expiresAt }))
    } catch {
      /* 저장 실패(프라이빗 모드 등) 무시 — 메모리 캐시는 유지 */
    }
  }

  private restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { token?: unknown; expiresAt?: unknown }
      if (typeof parsed.token === 'string' && typeof parsed.expiresAt === 'number') {
        this.token = parsed.token
        this.expiresAt = parsed.expiresAt
      }
    } catch {
      /* 손상 데이터 무시 */
    }
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
 * drive.appdata 스코프 1개만 요청. 액세스 토큰은 TokenCache(localStorage 영속)에 둔다.
 *
 * - getToken(): cache-only. 유효 토큰이 있으면 반환, 없으면 throw — GIS 팝업을 절대 띄우지 않는다.
 *   (콜드스타트/자동 동기화 경로가 팝업을 띄우려다 차단되는 문제를 구조적으로 차단)
 * - signIn(): 사용자 제스처(로그인 버튼)에서만 호출. 이때만 GIS 팝업으로 토큰을 발급한다.
 * - isSignedIn(): 유효한 캐시 토큰 보유 여부. 만료되면 자동으로 false → 로그인 버튼 노출.
 */
export function createGisTokenProvider(clientId: string): TokenProvider {
  const cache = new TokenCache() // 생성 시 localStorage에서 유효 토큰 복원(콜드스타트 자동 로그인)
  // GIS TokenClient는 lazy 생성(스크립트 로드 후, signIn 시점).
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

  /** 팝업으로 토큰 발급. 반드시 사용자 제스처(signIn) 컨텍스트에서만 호출. */
  async function requestToken(): Promise<string> {
    const c = await ensureClient()
    return new Promise((resolve, reject) => {
      c.callback = (resp: google.accounts.oauth2.TokenResponse) => {
        if (resp.error || !resp.access_token) return reject(new Error(resp.error || 'no token'))
        cache.set(resp.access_token, Number(resp.expires_in ?? 3600))
        resolve(resp.access_token)
      }
      c.requestAccessToken({ prompt: '' }) // 사용자 제스처 컨텍스트 → 팝업 허용(첫 회 동의, 이후 빠름)
    })
  }

  return {
    async getToken() {
      const cached = cache.get()
      if (cached) return cached
      // cache-only: 콜드스타트 silent 재인증은 GIS 팝업 기반이라 불가 → throw.
      // 호출자(trySilentSignIn·drive 401 재시도)는 graceful 처리하고, 재인증은 signIn에서만.
      throw new Error('유효한 액세스 토큰 없음 — 로그인 필요')
    },
    async signIn() {
      await requestToken()
    },
    signOut() {
      cache.clear()
    },
    isSignedIn() {
      return cache.get() !== null
    },
  }
}
