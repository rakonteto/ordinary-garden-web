import { LlmError } from '../types'
import type { BridgeProviderId } from '../types'
import type { ConsultPrompt } from '../consultPrompt'

/** 이 맥에서 열었을 때의 브리지 주소. 다른 기기에서는 설정에서 테일넷 주소로 갈아 끼운다. */
export const BRIDGE_DEFAULT_URL = 'http://127.0.0.1:8787'

export interface BridgeOptions {
  token: string
  /** 브리지가 부를 구독 CLI. 비우면 claude. */
  provider?: BridgeProviderId
  model?: string
  timeoutMs?: number
  /**
   * 브리지 주소. 비우면 이 맥의 루프백으로 간다.
   *
   * 아이폰에서나 배포된 https 페이지에서는 루프백에 닿지 못한다. `tailscale serve`가 TLS를
   * 받아 루프백으로 넘겨 주므로, 앱은 부를 주소만 테일넷 주소로 바꾸면 된다.
   */
  baseUrl?: string
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
  const baseUrl = options.baseUrl?.trim() || BRIDGE_DEFAULT_URL
  const token = options.token.trim()
  if (!token) {
    throw new LlmError('auth', '브리지 토큰이 없습니다.', {
      hint: '설정에서 브리지 토큰을 넣어 주세요. 토큰은 ~/.claude-cli-bridge/token 파일에 있습니다.',
    })
  }

  let res: Response
  try {
    res = await fetch(`${baseUrl}/api/invoke`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: options.provider ?? 'claude',
        prompt: prompt.user,
        systemPrompt: prompt.system,
        model: options.model,
        timeoutMs: options.timeoutMs,
      }),
    })
  } catch {
    throw new LlmError('connection', `브리지에 닿지 못했습니다(${baseUrl}).`, {
      hint:
        '이 맥에서 열었다면 상주 여부를 `npm run agent:status`로 확인해 주세요. 다른 기기나 배포된 주소에서 열었다면 설정의 브리지 주소에 테일넷 주소를 넣어야 하고, 맥이 켜져 있어야 합니다.',
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
