import type { ConsultPrompt } from './consultPrompt'

export type { ConsultPrompt }

/** 어디서 답을 받아 올지. handoff는 앱이 부르지 않고 사용자가 손으로 옮긴다. */
export type ProviderId = 'handoff' | 'bridge' | 'puter'

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
