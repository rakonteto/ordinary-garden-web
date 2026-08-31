import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LlmSection from './LlmSection'
import { loadLlmSettings } from './settings'

describe('LlmSection', () => {
  beforeEach(() => localStorage.clear())

  it('기본은 넘기기가 골라져 있다', () => {
    render(<LlmSection />)
    expect(screen.getByRole('radio', { name: /질문 복사/ })).toBeChecked()
  })

  it('네 구독을 모두 고를 수 있다', () => {
    render(<LlmSection />)
    for (const [name, id] of [['Claude', 'claude'], ['ChatGPT', 'codex'], ['Gemini', 'gemini'], ['Grok', 'grok']] as const) {
      fireEvent.click(screen.getByRole('radio', { name: new RegExp(name) }))
      expect(loadLlmSettings().provider).toBe(id)
    }
  })

  it('어느 CLI가 도는지 화면에 밝힌다', () => {
    render(<LlmSection />)
    expect(screen.getByText(/공식 CLI agy/)).toBeInTheDocument()
    expect(screen.getByText(/공식 CLI codex/)).toBeInTheDocument()
  })

  it('넘기기일 때는 토큰 칸이 나오지 않는다', () => {
    render(<LlmSection />)
    expect(screen.queryByLabelText('브리지 토큰')).not.toBeInTheDocument()
  })

  it('구독을 고르면 토큰 칸이 나오고, 넣으면 저장된다', () => {
    render(<LlmSection />)
    fireEvent.click(screen.getByRole('radio', { name: /Grok/ }))
    fireEvent.change(screen.getByLabelText('브리지 토큰'), { target: { value: 'abc123' } })

    expect(loadLlmSettings().bridgeToken).toBe('abc123')
  })

  it('브리지가 맥에서만 된다는 점을 알린다', () => {
    render(<LlmSection />)
    expect(screen.getByText(/아이폰·아이패드에서는 닿지 않습니다/)).toBeInTheDocument()
  })

  it('넘기기만이 이미 쓰는 구독을 그대로 쓴다는 점을 알린다', () => {
    render(<LlmSection />)
    expect(screen.getByText(/이미 결제 중인 구독을 그대로 쓰는 길은 이것뿐/)).toBeInTheDocument()
  })
})
