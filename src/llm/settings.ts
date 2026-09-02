import type { ProviderId } from './types'
import { BRIDGE_PROVIDERS } from './types'

const PROVIDER_KEY = 'og.llm.provider'
const BRIDGE_TOKEN_KEY = 'og.llm.bridgeToken'
const BRIDGE_URL_KEY = 'og.llm.bridgeUrl'

export interface LlmSettings {
  provider: ProviderId
  bridgeToken: string
  /** 브리지 주소. 빈 문자열이면 이 맥의 루프백으로 간다. */
  bridgeUrl: string
}

/**
 * 넘기기가 기본이다. 브리지는 맥에서만 닿으므로, 아내분 아이폰에서 앱을 처음 열었을 때
 * 곧바로 쓸 수 있는 경로여야 한다.
 */
const DEFAULTS: LlmSettings = {
  provider: 'handoff',
  bridgeToken: '',
  bridgeUrl: '',
}

const PROVIDERS: readonly ProviderId[] = ['handoff', ...BRIDGE_PROVIDERS]

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    // 사파리 프라이빗 모드처럼 저장이 막힌 곳에서는 기본값으로 돈다.
    return null
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 저장에 실패해도 이번 세션은 그대로 쓸 수 있게 조용히 넘긴다.
  }
}

export function loadLlmSettings(): LlmSettings {
  const provider = read(PROVIDER_KEY) as ProviderId | null

  return {
    provider: provider && PROVIDERS.includes(provider) ? provider : DEFAULTS.provider,
    bridgeToken: read(BRIDGE_TOKEN_KEY) ?? DEFAULTS.bridgeToken,
    bridgeUrl: normalizeBridgeUrl(read(BRIDGE_URL_KEY) ?? DEFAULTS.bridgeUrl),
  }
}

export function saveProvider(provider: ProviderId): void {
  if (PROVIDERS.includes(provider)) write(PROVIDER_KEY, provider)
}

export function saveBridgeToken(token: string): void {
  write(BRIDGE_TOKEN_KEY, token.trim())
}

/**
 * 주소를 다듬는다.
 *
 * 스킴을 빠뜨린 값에는 https를 붙인다. 손으로 주소를 바꾸는 상황은 사실상 테일넷 주소를
 * 넣을 때뿐이고 그쪽은 늘 https이기 때문이다(이 맥에서 쓸 사람은 칸을 비워 두면 된다).
 * 끝의 빗금은 떼어 낸다. 남겨 두면 `//api/invoke`가 되어 헛되이 실패한다.
 */
export function normalizeBridgeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  return withScheme.replace(/\/+$/, '')
}

export function saveBridgeUrl(url: string): void {
  write(BRIDGE_URL_KEY, normalizeBridgeUrl(url))
}

export { BRIDGE_PROVIDERS }
