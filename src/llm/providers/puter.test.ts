import { describe, it, expect, vi, afterEach } from 'vitest'
import { completeViaPuter } from './puter'

const prompt = { system: 'sys', user: 'usr' }

afterEach(() => vi.unstubAllGlobals())

function stubPuter(chat: unknown, signedIn = true) {
  vi.stubGlobal('puter', {
    ai: { chat },
    auth: { isSignedIn: () => signedIn, signIn: vi.fn(async () => undefined) },
  })
}

describe('completeViaPuter', () => {
  it('시스템·사용자 메시지를 순서대로 보내고 모델을 지정한다', async () => {
    const chat = vi.fn(async (_m: unknown[], _t: boolean, _o: { model: string }) =>
      ({ message: { content: '잎을 살펴보세요.' } }))
    stubPuter(chat)

    const answer = await completeViaPuter(prompt, { model: 'gpt-5.6-luna' })

    expect(answer).toBe('잎을 살펴보세요.')
    const [messages, testMode, options] = chat.mock.calls[0] as [unknown[], boolean, { model: string }]
    expect(messages).toEqual([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'usr' },
    ])
    expect(testMode).toBe(false)
    expect(options.model).toBe('gpt-5.6-luna')
  })

  it('내용이 조각 배열로 와도 글자만 이어 붙인다', async () => {
    stubPuter(async () => ({ message: { content: [{ type: 'text', text: '앞' }, { type: 'text', text: '뒤' }] } }))
    expect(await completeViaPuter(prompt, { model: 'm' })).toBe('앞뒤')
  })

  it('로그인돼 있지 않으면 먼저 로그인시킨다', async () => {
    const chat = vi.fn(async () => ({ message: { content: 'ok' } }))
    stubPuter(chat, false)

    await completeViaPuter(prompt, { model: 'm' })

    const signIn = (globalThis as unknown as { puter: { auth: { signIn: ReturnType<typeof vi.fn> } } })
      .puter.auth.signIn
    expect(signIn).toHaveBeenCalled()
  })

  it('답이 비어 있으면 빈 응답으로 알린다', async () => {
    stubPuter(async () => ({ message: { content: '' } }))
    await expect(completeViaPuter(prompt, { model: 'm' })).rejects.toMatchObject({ kind: 'empty' })
  })

  it('할당량이 떨어지면 사람이 읽을 수 있게 알린다', async () => {
    stubPuter(async () => { throw new Error('Insufficient funds: usage limit exceeded') })
    await expect(completeViaPuter(prompt, { model: 'm' })).rejects.toThrow(/할당량|한도/)
  })
})
