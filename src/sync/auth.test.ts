import { describe, it, expect, beforeEach } from 'vitest'
import { TokenCache, createGisTokenProvider } from './auth'

const T = 1_000_000

beforeEach(() => {
  localStorage.clear()
})

describe('TokenCache', () => {
  it('만료 전이면 토큰 반환', () => {
    const c = new TokenCache()
    c.set('tok', 3600, T)
    expect(c.get(T + 1000)).toBe('tok')
  })
  it('만료 60초 마진 안쪽이면 null(곧 만료 → 재발급 유도)', () => {
    const c = new TokenCache()
    c.set('tok', 3600, T)
    expect(c.get(T + 3600_000 - 30_000)).toBeNull() // 만료 30초 전
  })
  it('clear 후 null', () => {
    const c = new TokenCache()
    c.set('tok', 3600, T)
    c.clear()
    expect(c.get(T)).toBeNull()
  })

  // localStorage 영속 — 콜드스타트(앱 재시작 = 새 인스턴스)에서도 토큰 복원
  it('set한 토큰을 새 인스턴스가 localStorage에서 복원(콜드스타트)', () => {
    new TokenCache().set('tok', 3600, T)
    const fresh = new TokenCache() // 앱 재시작 시뮬
    expect(fresh.get(T + 1000)).toBe('tok')
  })
  it('clear하면 localStorage도 비워 새 인스턴스가 복원 못 함', () => {
    const c = new TokenCache()
    c.set('tok', 3600, T)
    c.clear()
    expect(new TokenCache().get(T)).toBeNull()
  })
  it('만료된 저장 토큰은 복원돼도 get()이 null', () => {
    new TokenCache().set('tok', 3600, T)
    const fresh = new TokenCache()
    expect(fresh.get(T + 3600_000)).toBeNull() // 만료 시점(마진 포함)
  })
})

describe('createGisTokenProvider (cache-only, 콜드스타트 팝업 회피)', () => {
  const NOW = Date.now()

  it('저장된 유효 토큰이 있으면 isSignedIn=true(콜드스타트 자동 로그인)', () => {
    new TokenCache().set('tok', 3600, NOW)
    const p = createGisTokenProvider('client-id')
    expect(p.isSignedIn()).toBe(true)
  })
  it('저장 토큰 없으면 isSignedIn=false', () => {
    const p = createGisTokenProvider('client-id')
    expect(p.isSignedIn()).toBe(false)
  })
  it('getToken: 유효 캐시 있으면 팝업 없이 반환', async () => {
    new TokenCache().set('tok', 3600, NOW)
    const p = createGisTokenProvider('client-id')
    await expect(p.getToken()).resolves.toBe('tok')
  })
  it('getToken: 유효 캐시 없으면 throw(GIS 팝업 호출 안 함 = 콜드스타트 차단 회피)', async () => {
    const p = createGisTokenProvider('client-id')
    await expect(p.getToken()).rejects.toThrow()
  })
  it('signOut 후 isSignedIn=false + 저장 토큰 제거', () => {
    new TokenCache().set('tok', 3600, NOW)
    const p = createGisTokenProvider('client-id')
    p.signOut()
    expect(p.isSignedIn()).toBe(false)
    expect(new TokenCache().get(NOW)).toBeNull()
  })
})
