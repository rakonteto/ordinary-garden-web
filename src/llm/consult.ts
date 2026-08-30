import { buildConsultPrompt } from './consultPrompt'
import type { ConsultContext } from './consultPrompt'
import { completeViaBridge } from './providers/bridge'
import { completeViaPuter } from './providers/puter'
import { LlmError } from './types'
import type { ProviderId } from './types'
import type { LlmSettings } from './settings'

/** 앱이 스스로 답을 받아 올 수 있는 공급자인지. 넘기기는 사람이 손으로 옮긴다. */
export function canProviderAnswer(provider: ProviderId): boolean {
  return provider === 'bridge' || provider === 'puter'
}

export async function runConsult(ctx: ConsultContext, settings: LlmSettings): Promise<string> {
  const prompt = buildConsultPrompt(ctx)

  switch (settings.provider) {
    case 'bridge':
      return completeViaBridge(prompt, { token: settings.bridgeToken })
    case 'puter':
      return completeViaPuter(prompt, { model: settings.puterModel })
    default:
      throw new LlmError('http', '지금 고른 경로는 앱이 대신 물어볼 수 없습니다.', {
        hint: '질문을 복사해 쓰시는 AI 앱에 붙여넣어 주세요.',
      })
  }
}
