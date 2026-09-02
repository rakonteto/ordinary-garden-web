import { describe, it, expect, vi, afterEach } from 'vitest'
import { completeViaBridge, BRIDGE_DEFAULT_URL } from './bridge'

const prompt = { system: 'sys', user: 'usr' }

afterEach(() => vi.unstubAllGlobals())

function stubFetch(impl: (url: string, init: RequestInit) => Promise<unknown>) {
  const spy = vi.fn(impl)
  vi.stubGlobal('fetch', spy)
  return spy
}

describe('completeViaBridge', () => {
  it('브리지에 프롬프트를 보내고 답을 꺼낸다', async () => {
    const spy = stubFetch(async () => ({
      ok: true,
      json: async () => ({ ok: true, result: '물을 줄여 보세요.' }),
    }))

    const answer = await completeViaBridge(prompt, { token: 'tok' })

    expect(answer).toBe('물을 줄여 보세요.')
    const [url, init] = spy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(`${BRIDGE_DEFAULT_URL}/api/invoke`)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
  })

  it('주소를 주면 그 주소로 부른다', async () => {
    // 아이폰이나 배포된 https 페이지에서는 루프백에 닿지 못한다. tailscale serve가 TLS를
    // 받아 루프백으로 넘겨 주므로 앱은 부를 주소만 바꾸면 된다.
    const spy = stubFetch(async () => ({ ok: true, json: async () => ({ ok: true, result: 'ok' }) }))
    await completeViaBridge(prompt, { token: 'tok', baseUrl: 'https://mac.tail1234.ts.net' })

    expect((spy.mock.calls[0] as [string, RequestInit])[0]).toBe(
      'https://mac.tail1234.ts.net/api/invoke',
    )
  })

  it('주소를 비워 두면 이 맥의 루프백으로 간다', async () => {
    const spy = stubFetch(async () => ({ ok: true, json: async () => ({ ok: true, result: 'ok' }) }))
    await completeViaBridge(prompt, { token: 'tok', baseUrl: '   ' })

    expect((spy.mock.calls[0] as [string, RequestInit])[0]).toBe(`${BRIDGE_DEFAULT_URL}/api/invoke`)
  })

  it('어느 구독 CLI를 부를지 함께 보낸다', async () => {
    const spy = stubFetch(async () => ({ ok: true, json: async () => ({ ok: true, result: 'ok' }) }))
    await completeViaBridge(prompt, { token: 'tok', provider: 'grok' })

    const body = JSON.parse(((spy.mock.calls[0] as [string, RequestInit])[1].body as string))
    expect(body.provider).toBe('grok')
  })

  it('공급자를 지정하지 않으면 claude로 간다', async () => {
    const spy = stubFetch(async () => ({ ok: true, json: async () => ({ ok: true, result: 'ok' }) }))
    await completeViaBridge(prompt, { token: 'tok' })

    const body = JSON.parse(((spy.mock.calls[0] as [string, RequestInit])[1].body as string))
    expect(body.provider).toBe('claude')
  })

  it('시스템 지시를 systemPrompt로 따로 실어 보낸다', async () => {
    const spy = stubFetch(async () => ({ ok: true, json: async () => ({ ok: true, result: 'ok' }) }))
    await completeViaBridge(prompt, { token: 'tok' })

    const body = JSON.parse(((spy.mock.calls[0] as [string, RequestInit])[1].body as string))
    expect(body.systemPrompt).toBe('sys')
    expect(body.prompt).toBe('usr')
  })

  it('브리지가 꺼져 있으면 연결 오류로 알린다', async () => {
    stubFetch(async () => { throw new TypeError('Failed to fetch') })

    await expect(completeViaBridge(prompt, { token: 'tok' }))
      .rejects.toMatchObject({ kind: 'connection' })
  })

  it('토큰이 틀리면 인증 오류로 알린다', async () => {
    stubFetch(async () => ({
      ok: false, status: 403,
      json: async () => ({ ok: false, error: { code: 'forbidden', message: '토큰이 올바르지 않습니다.' } }),
    }))

    await expect(completeViaBridge(prompt, { token: 'bad' }))
      .rejects.toMatchObject({ kind: 'auth' })
  })

  it('CLI 쪽 실패는 안내 문구를 그대로 전한다', async () => {
    stubFetch(async () => ({
      ok: false, status: 502,
      json: async () => ({
        ok: false,
        error: { code: 'not_authenticated', message: '구독 인증이 확인되지 않습니다.', hint: 'claude 로그인' },
      }),
    }))

    await expect(completeViaBridge(prompt, { token: 'tok' }))
      .rejects.toThrow(/구독 인증/)
  })

  it('토큰이 비어 있으면 부르기 전에 막는다', async () => {
    const spy = stubFetch(async () => ({ ok: true, json: async () => ({ ok: true, result: 'x' }) }))
    await expect(completeViaBridge(prompt, { token: '' })).rejects.toMatchObject({ kind: 'auth' })
    expect(spy).not.toHaveBeenCalled()
  })
})
