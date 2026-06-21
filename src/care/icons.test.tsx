import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CareTypeIcon, RainIcon } from './icons'

describe('care icons', () => {
  it('CareTypeIcon은 타입별 SVG를 렌더', () => {
    const { container } = render(<CareTypeIcon type="water" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
  it('RainIcon SVG 렌더', () => {
    const { container } = render(<RainIcon />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
