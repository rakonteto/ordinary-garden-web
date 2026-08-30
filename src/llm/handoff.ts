import type { ConsultPrompt } from './consultPrompt'

/**
 * 프롬프트를 사람이 다른 AI 앱에 붙여넣을 수 있는 한 덩어리 글로 만든다.
 *
 * 이 경로만이 사용자가 이미 결제 중인 구독을 실제로 쓴다. 브라우저 웹앱은 남의 구독
 * 세션을 대신 부를 수 없으므로, 구독을 쓰려면 사람이 자기 앱에서 직접 물어야 한다.
 * 그래서 특정 서비스를 가리키지 않고 어디에 넣어도 되는 형태로 남긴다.
 */
export function buildHandoffText(prompt: ConsultPrompt): string {
  return `${prompt.system}\n\n---\n\n${prompt.user}`
}
