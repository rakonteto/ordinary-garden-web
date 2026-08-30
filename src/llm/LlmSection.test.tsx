import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LlmSection from './LlmSection'
import { loadLlmSettings, PUTER_MODELS } from './settings'

describe('LlmSection', () => {
  beforeEach(() => localStorage.clear())

  it('기본은 넘기기가 골라져 있다', () => {
    render(<LlmSection />)
    expect(screen.getByRole('radio', { name: /질문 복사/ })).toBeChecked()
  })

  it('공급자를 바꾸면 저장된다', () => {
    render(<LlmSection />)
    fireEvent.click(screen.getByRole('radio', { name: /Puter/ }))
    expect(loadLlmSettings().provider).toBe('puter')
  })

  it('브리지를 고르면 토큰 칸이 나오고, 넣으면 저장된다', () => {
    render(<LlmSection />)
    expect(screen.queryByLabelText('브리지 토큰')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /맥에서 쓰는/ }))
    fireEvent.change(screen.getByLabelText('브리지 토큰'), { target: { value: 'abc123' } })

    expect(loadLlmSettings().bridgeToken).toBe('abc123')
  })

  it('Puter를 고르면 모델을 고를 수 있다', () => {
    render(<LlmSection />)
    fireEvent.click(screen.getByRole('radio', { name: /Puter/ }))

    const select = screen.getByLabelText('모델')
    fireEvent.change(select, { target: { value: PUTER_MODELS[2].id } })

    expect(loadLlmSettings().puterModel).toBe(PUTER_MODELS[2].id)
  })

  it('넘기기만이 이미 쓰는 구독을 그대로 쓴다는 점을 알린다', () => {
    render(<LlmSection />)
    expect(screen.getByText(/구독/)).toBeInTheDocument()
  })
})
