import { describe, it, expect } from 'vitest'
import { fitWithin, downscaleImage } from './image'

describe('fitWithin', () => {
  it('긴 변이 maxEdge 이하면 그대로', () => {
    expect(fitWithin(800, 600, 2048)).toEqual({ w: 800, h: 600 })
  })
  it('가로가 길면 가로를 maxEdge로 맞추고 비율 유지', () => {
    expect(fitWithin(4096, 2048, 2048)).toEqual({ w: 2048, h: 1024 })
  })
  it('세로가 길면 세로를 maxEdge로 맞춘다', () => {
    expect(fitWithin(1000, 4000, 2000)).toEqual({ w: 500, h: 2000 })
  })
  it('반올림된 정수를 반환', () => {
    const r = fitWithin(3333, 1111, 2048)
    expect(Number.isInteger(r.w) && Number.isInteger(r.h)).toBe(true)
  })
})

describe('downscaleImage (canvas 미지원 폴백)', () => {
  it('jsdom에 canvas/createImageBitmap이 없으면 원본 blob을 그대로 반환', async () => {
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    const out = await downscaleImage(blob)
    expect(out).toBe(blob)
  })
})
