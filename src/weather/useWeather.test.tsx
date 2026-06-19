import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useWeather } from './useWeather'

function Probe() {
  const { bundle } = useWeather()
  return <div>{bundle ? `temp:${bundle.current.tempC}` : 'loading'}</div>
}

describe('useWeather', () => {
  it('마운트 시 자동 로드되어 번들을 노출한다', async () => {
    render(<Probe />)
    expect(await screen.findByText('temp:24.4')).toBeInTheDocument()
  })
})
