import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App 셸', () => {
  it('세 탭(오늘·내 정원·설정)을 렌더한다', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: '오늘' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '내 정원' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '설정' })).toBeInTheDocument()
  })

  it('기본 경로에서 오늘 화면을 보여준다', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: '오늘' })).toBeInTheDocument()
  })
})
