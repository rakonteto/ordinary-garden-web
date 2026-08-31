import { describe, it, expect, beforeEach } from 'vitest'
import { loadLlmSettings, saveProvider, saveBridgeToken, BRIDGE_PROVIDERS } from './settings'

describe('llm 설정', () => {
  beforeEach(() => localStorage.clear())

  it('아무것도 저장돼 있지 않으면 넘기기를 기본으로 삼는다', () => {
    // 브리지는 맥에서만 닿는다. 아이폰에서 처음 열어도 곧바로 쓸 수 있어야 한다.
    expect(loadLlmSettings().provider).toBe('handoff')
  })

  it('네 구독을 모두 고를 수 있다', () => {
    expect([...BRIDGE_PROVIDERS]).toEqual(['claude', 'codex', 'gemini', 'grok'])
    for (const p of BRIDGE_PROVIDERS) {
      saveProvider(p)
      expect(loadLlmSettings().provider).toBe(p)
    }
  })

  it('알 수 없는 값이 저장돼 있으면 기본값으로 되돌린다', () => {
    localStorage.setItem('og.llm.provider', 'nonsense')
    expect(loadLlmSettings().provider).toBe('handoff')
  })

  it('예전에 쓰던 puter가 저장돼 있어도 기본값으로 되돌린다', () => {
    // Puter는 채택하지 않았다. 그 값이 남아 있어도 앱이 깨지면 안 된다.
    localStorage.setItem('og.llm.provider', 'puter')
    expect(loadLlmSettings().provider).toBe('handoff')
  })

  it('브리지 토큰을 저장하고 앞뒤 공백을 다듬는다', () => {
    saveBridgeToken('  abc123  ')
    expect(loadLlmSettings().bridgeToken).toBe('abc123')
  })

  it('공급자를 바꿔도 토큰은 하나를 공유한다', () => {
    // 네 CLI를 브리지 하나가 다루므로 토큰도 하나면 된다.
    saveBridgeToken('shared')
    saveProvider('grok')
    expect(loadLlmSettings().bridgeToken).toBe('shared')
    saveProvider('codex')
    expect(loadLlmSettings().bridgeToken).toBe('shared')
  })
})
