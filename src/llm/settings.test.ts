import { describe, it, expect, beforeEach } from 'vitest'
import { loadLlmSettings, saveProvider, saveBridgeToken, savePuterModel, PUTER_MODELS } from './settings'

describe('llm 설정', () => {
  beforeEach(() => localStorage.clear())

  it('아무것도 저장돼 있지 않으면 넘기기를 기본으로 삼는다', () => {
    // 넘기기는 키도 계정도 필요 없어 어디서나 동작한다. 그래서 기본값으로 둔다.
    expect(loadLlmSettings().provider).toBe('handoff')
  })

  it('공급자 선택을 저장하고 되읽는다', () => {
    saveProvider('puter')
    expect(loadLlmSettings().provider).toBe('puter')
  })

  it('알 수 없는 값이 저장돼 있으면 기본값으로 되돌린다', () => {
    localStorage.setItem('og.llm.provider', 'nonsense')
    expect(loadLlmSettings().provider).toBe('handoff')
  })

  it('브리지 토큰을 저장하고 앞뒤 공백을 다듬는다', () => {
    saveBridgeToken('  abc123  ')
    expect(loadLlmSettings().bridgeToken).toBe('abc123')
  })

  it('puter 모델은 알려진 목록 안에서만 저장한다', () => {
    savePuterModel(PUTER_MODELS[1].id)
    expect(loadLlmSettings().puterModel).toBe(PUTER_MODELS[1].id)

    savePuterModel('made-up-model')
    expect(loadLlmSettings().puterModel).toBe(PUTER_MODELS[1].id)
  })

  it('모델 목록에 GPT·Claude·Gemini·Grok이 모두 들어 있다', () => {
    const ids = PUTER_MODELS.map((m) => m.id).join(' ')
    expect(ids).toMatch(/gpt/)
    expect(ids).toMatch(/claude/)
    expect(ids).toMatch(/gemini/)
    expect(ids).toMatch(/grok/)
  })
})
