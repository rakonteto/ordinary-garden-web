import type { ConsultPrompt } from './consultPrompt'

export type { ConsultPrompt }

/**
 * 어디로 물을지.
 *
 * handoff는 앱이 부르지 않고 사용자가 질문을 복사해 자기 AI 앱에 붙여넣는다.
 * 나머지 넷은 맥에서 도는 로컬 브리지가 각 구독의 공식 CLI를 부른다.
 */
export type ProviderId = 'handoff' | 'claude' | 'codex' | 'gemini' | 'grok'

/** 브리지를 거치는 공급자들. 이 순서대로 화면에 보인다. */
export const BRIDGE_PROVIDERS = ['claude', 'codex', 'gemini', 'grok'] as const

export type BridgeProviderId = (typeof BRIDGE_PROVIDERS)[number]

export type LlmErrorKind = 'auth' | 'connection' | 'timeout' | 'http' | 'empty' | 'limit'

export class LlmError extends Error {
  kind: LlmErrorKind
  status?: number
  hint?: string

  constructor(kind: LlmErrorKind, message: string, opts: { status?: number; hint?: string } = {}) {
    super(message)
    this.name = 'LlmError'
    this.kind = kind
    this.status = opts.status
    this.hint = opts.hint
  }
}
