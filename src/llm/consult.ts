import { buildConsultPrompt } from './consultPrompt'
import type { ConsultContext } from './consultPrompt'
import { completeViaBridge } from './providers/bridge'
import { LlmError } from './types'
import type { ProviderId } from './types'
import type { LlmSettings } from './settings'

/** 앱이 스스로 답을 받아 올 수 있는 공급자인지. 넘기기는 사람이 손으로 옮긴다. */
export function canProviderAnswer(provider: ProviderId): boolean {
  return provider !== 'handoff'
}

/**
 * 고른 구독으로 상담을 청한다.
 *
 * 넷 모두 맥에서 도는 로컬 브리지를 거쳐 각 회사의 공식 CLI를 부른다. 브리지가
 * 어느 CLI를 부를지는 provider가 정한다.
 */
export async function runConsult(ctx: ConsultContext, settings: LlmSettings): Promise<string> {
  const prompt = buildConsultPrompt(ctx)

  if (settings.provider === 'handoff') {
    throw new LlmError('http', '지금 고른 경로는 앱이 대신 물어볼 수 없습니다.', {
      hint: '질문을 복사해 쓰시는 AI 앱에 붙여넣어 주세요.',
    })
  }

  return completeViaBridge(prompt, {
    token: settings.bridgeToken,
    provider: settings.provider,
    baseUrl: settings.bridgeUrl,
  })
}
