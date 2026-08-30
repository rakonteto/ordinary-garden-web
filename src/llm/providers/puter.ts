import { LlmError } from '../types'
import type { ConsultPrompt } from '../consultPrompt'

const SCRIPT_URL = 'https://js.puter.com/v2/'

interface PuterContentPart { text?: string }
interface PuterResponse { message?: { content?: string | PuterContentPart[] } }

interface PuterGlobal {
  ai: { chat: (messages: unknown[], testMode: boolean, options: { model: string }) => Promise<PuterResponse> }
  auth: { isSignedIn: () => boolean; signIn: () => Promise<unknown> }
}

function puterGlobal(): PuterGlobal | undefined {
  return (globalThis as { puter?: PuterGlobal }).puter
}

/** Puter 스크립트를 한 번만 싣는다. 이미 실려 있으면 그대로 쓴다. */
function loadPuter(): Promise<PuterGlobal> {
  const existing = puterGlobal()
  if (existing) return Promise.resolve(existing)

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.onload = () => {
      const loaded = puterGlobal()
      if (loaded) resolve(loaded)
      else reject(new LlmError('connection', 'Puter를 불러오지 못했습니다.'))
    }
    script.onerror = () => reject(new LlmError('connection', 'Puter를 불러오지 못했습니다.', {
      hint: '인터넷 연결을 확인해 주세요.',
    }))
    document.head.appendChild(script)
  })
}

function extractText(res: PuterResponse): string {
  const content = res.message?.content
  if (typeof content === 'string') return content.trim()
  if (Array.isArray(content)) return content.map((part) => part.text ?? '').join('').trim()
  return ''
}

const LIMIT_PATTERNS = ['insufficient', 'usage limit', 'quota', 'credit', 'exceeded']

/**
 * Puter를 거쳐 묻는다. 사용자가 자기 Puter 계정의 무료 할당량을 쓰고,
 * 넘치는 만큼은 그 사용자에게 청구된다. 앱을 만드는 쪽은 키도 비용도 지지 않는다.
 */
export async function completeViaPuter(
  prompt: ConsultPrompt,
  options: { model: string },
): Promise<string> {
  const puter = await loadPuter()

  if (!puter.auth.isSignedIn()) {
    try {
      await puter.auth.signIn()
    } catch {
      throw new LlmError('auth', 'Puter 로그인이 취소됐습니다.', {
        hint: 'Puter 계정으로 로그인해야 이 경로를 쓸 수 있습니다.',
      })
    }
  }

  let res: PuterResponse
  try {
    res = await puter.ai.chat(
      [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      false,
      { model: options.model },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (LIMIT_PATTERNS.some((p) => message.toLowerCase().includes(p))) {
      throw new LlmError('limit', 'Puter 무료 할당량을 다 쓴 것으로 보입니다.', {
        hint: '다음 달을 기다리거나, 설정에서 다른 경로를 골라 주세요.',
      })
    }
    throw new LlmError('http', `Puter 호출이 실패했습니다. ${message}`)
  }

  const answer = extractText(res)
  if (!answer) throw new LlmError('empty', 'Puter가 빈 답을 돌려줬습니다.')
  return answer
}
