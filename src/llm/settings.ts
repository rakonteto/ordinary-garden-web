import type { ProviderId } from './types'

const PROVIDER_KEY = 'og.llm.provider'
const BRIDGE_TOKEN_KEY = 'og.llm.bridgeToken'
const PUTER_MODEL_KEY = 'og.llm.puterModel'

/**
 * Puter로 고를 수 있는 모델.
 *
 * Puter는 사용자마다 무료 월 할당량을 주고 초과분만 그 사용자에게 청구한다.
 * 앱을 만드는 쪽은 키도 비용도 지지 않는다.
 */
export const PUTER_MODELS: readonly { id: string; label: string }[] = [
  { id: 'gpt-5.6-luna', label: 'GPT' },
  { id: 'claude-sonnet-4-5', label: 'Claude' },
  { id: 'gemini-3.1-flash-lite', label: 'Gemini' },
]

export interface LlmSettings {
  provider: ProviderId
  bridgeToken: string
  puterModel: string
}

// 넘기기는 키도 계정도 필요 없어 어느 기기에서나 곧바로 된다. 그래서 기본값으로 둔다.
const DEFAULTS: LlmSettings = {
  provider: 'handoff',
  bridgeToken: '',
  puterModel: PUTER_MODELS[0].id,
}

const PROVIDERS: readonly ProviderId[] = ['handoff', 'bridge', 'puter']

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
  const model = read(PUTER_MODEL_KEY)

  return {
    provider: provider && PROVIDERS.includes(provider) ? provider : DEFAULTS.provider,
    bridgeToken: read(BRIDGE_TOKEN_KEY) ?? DEFAULTS.bridgeToken,
    puterModel: model && PUTER_MODELS.some((m) => m.id === model) ? model : DEFAULTS.puterModel,
  }
}

export function saveProvider(provider: ProviderId): void {
  if (PROVIDERS.includes(provider)) write(PROVIDER_KEY, provider)
}

export function saveBridgeToken(token: string): void {
  write(BRIDGE_TOKEN_KEY, token.trim())
}

export function savePuterModel(model: string): void {
  if (PUTER_MODELS.some((m) => m.id === model)) write(PUTER_MODEL_KEY, model)
}
