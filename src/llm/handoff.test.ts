import { describe, it, expect } from 'vitest'
import { buildHandoffText } from './handoff'

describe('buildHandoffText', () => {
  const prompt = { system: '당신은 정원사입니다.', user: '식물: 방울토마토\n\n묻고 싶은 것: 잎이 처져요' }

  it('시스템 지시와 질문을 한 덩어리로 잇는다', () => {
    const text = buildHandoffText(prompt)
    expect(text).toMatch(/당신은 정원사입니다/)
    expect(text).toMatch(/방울토마토/)
    expect(text).toMatch(/잎이 처져요/)
  })

  it('시스템 지시가 질문보다 먼저 온다', () => {
    const text = buildHandoffText(prompt)
    expect(text.indexOf('정원사')).toBeLessThan(text.indexOf('방울토마토'))
  })

  it('어느 AI 앱에 붙여넣어도 되도록 특정 서비스를 언급하지 않는다', () => {
    const text = buildHandoffText(prompt)
    expect(text).not.toMatch(/ChatGPT|Claude|Gemini|Grok/i)
  })
})
