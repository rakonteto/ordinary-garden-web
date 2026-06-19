import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { WeatherGlyph } from './icons'

describe('WeatherGlyph', () => {
  it('강수 우선 아이콘키를 data-icon으로 노출', () => {
    const { container } = render(<WeatherGlyph precipType="rain" sky="clear" />)
    expect(container.querySelector('svg')?.getAttribute('data-icon')).toBe('rain')
  })
  it('맑음 → sun, 미상 → cloud', () => {
    const a = render(<WeatherGlyph precipType="none" sky="clear" />)
    expect(a.container.querySelector('svg')?.getAttribute('data-icon')).toBe('sun')
    const b = render(<WeatherGlyph precipType="none" sky={null} />)
    expect(b.container.querySelector('svg')?.getAttribute('data-icon')).toBe('cloud')
  })
})
