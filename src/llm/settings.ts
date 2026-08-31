import type { ProviderId } from './types'
import { BRIDGE_PROVIDERS } from './types'

const PROVIDER_KEY = 'og.llm.provider'
const BRIDGE_TOKEN_KEY = 'og.llm.bridgeToken'

export interface LlmSettings {
  provider: ProviderId
  bridgeToken: string
}

/**
 * 넘기기가 기본이다. 브리지는 맥에서만 닿으므로, 아내분 아이폰에서 앱을 처음 열었을 때
 * 곧바로 쓸 수 있는 경로여야 한다.
 */
const DEFAULTS: LlmSettings = {
  provider: 'handoff',
  bridgeToken: '',
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
  }
}

export function saveProvider(provider: ProviderId): void {
  if (PROVIDERS.includes(provider)) write(PROVIDER_KEY, provider)
}

export function saveBridgeToken(token: string): void {
  write(BRIDGE_TOKEN_KEY, token.trim())
}

export { BRIDGE_PROVIDERS }
