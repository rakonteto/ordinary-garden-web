import { LlmError } from '../types'
import type { ConsultPrompt } from '../consultPrompt'

/** 맥에서 도는 로컬 브리지. 다른 기기에서는 이 주소에 닿지 않는다. */
export const BRIDGE_URL = 'http://127.0.0.1:8787'

export interface BridgeOptions {
  token: string
  model?: string
  timeoutMs?: number
}

interface BridgeFailure {
  code?: string
  message?: string
  hint?: string
}

/**
 * 로컬 브리지를 거쳐 Claude Code 구독으로 묻는다.
 *
 * 브라우저는 브리지의 토큰 파일을 읽을 수 없으므로, 토큰은 사용자가 설정 화면에
 * 한 번 붙여넣어 localStorage에 둔 값을 받는다.
 */
export async function completeViaBridge(
  prompt: ConsultPrompt,
  options: BridgeOptions,
): Promise<string> {
  const token = options.token.trim()
  if (!token) {
    throw new LlmError('auth', '브리지 토큰이 없습니다.', {
      hint: '설정에서 브리지 토큰을 넣어 주세요. 토큰은 ~/.claude-cli-bridge/token 파일에 있습니다.',
    })
  }

  let res: Response
  try {
    res = await fetch(`${BRIDGE_URL}/api/invoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.user,
        systemPrompt: prompt.system,
        model: options.model,
        timeoutMs: options.timeoutMs,
      }),
    })
  } catch {
    throw new LlmError('connection', '로컬 브리지에 닿지 못했습니다.', {
      hint: '맥에서 `npm start`로 브리지를 띄웠는지 확인해 주세요. 다른 기기에서는 이 경로를 쓸 수 없습니다.',
    })
  }

  const body = (await res.json().catch(() => null)) as
    | { ok?: boolean; result?: string; error?: BridgeFailure }
    | null

  if (!res.ok || !body?.ok) {
    const failure = body?.error ?? {}
    const kind = res.status === 403 || failure.code === 'not_authenticated' ? 'auth' : 'http'
    throw new LlmError(kind, failure.message ?? `브리지가 오류로 응답했습니다. (${res.status})`, {
      status: res.status,
      hint: failure.hint,
    })
  }

  const answer = (body.result ?? '').trim()
  if (!answer) throw new LlmError('empty', '브리지가 빈 답을 돌려줬습니다.')
  return answer
}
