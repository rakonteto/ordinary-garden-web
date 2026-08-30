import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runConsult, canProviderAnswer } from './consult'
import type { ConsultContext } from './consultPrompt'
import type { LlmSettings } from './settings'
import type { Plant } from '../data/types'

vi.mock('./providers/bridge', () => ({
  completeViaBridge: vi.fn(async () => '브리지 답'),
  BRIDGE_URL: 'http://127.0.0.1:8787',
}))
vi.mock('./providers/puter', () => ({
  completeViaPuter: vi.fn(async () => 'Puter 답'),
}))

import { completeViaBridge } from './providers/bridge'
import { completeViaPuter } from './providers/puter'

const NOW = Date.UTC(2026, 7, 31, 3, 0, 0)
const plant: Plant = {
  id: 'p1', updatedAt: NOW, deleted: false,
  areaId: 'a1', name: '방울토마토', isArchived: false, sortOrder: 0,
}
const ctx: ConsultContext = { plant, entries: [], rules: [], question: '왜 이래요', asOfMs: NOW }

function settings(over: Partial<LlmSettings> = {}): LlmSettings {
  return { provider: 'bridge', bridgeToken: 'tok', puterModel: 'gpt-5.6-luna', ...over }
}

describe('runConsult', () => {
  beforeEach(() => vi.clearAllMocks())

  it('브리지를 고르면 토큰을 실어 브리지로 보낸다', async () => {
    expect(await runConsult(ctx, settings())).toBe('브리지 답')
    expect(completeViaBridge).toHaveBeenCalledWith(
      expect.objectContaining({ system: expect.any(String), user: expect.stringContaining('방울토마토') }),
      expect.objectContaining({ token: 'tok' }),
    )
  })

  it('Puter를 고르면 고른 모델로 보낸다', async () => {
    expect(await runConsult(ctx, settings({ provider: 'puter' }))).toBe('Puter 답')
    expect(completeViaPuter).toHaveBeenCalledWith(
      expect.anything(),
      { model: 'gpt-5.6-luna' },
    )
  })

  it('넘기기는 앱이 대신 부를 수 없으므로 거절한다', async () => {
    await expect(runConsult(ctx, settings({ provider: 'handoff' }))).rejects.toThrow()
    expect(completeViaBridge).not.toHaveBeenCalled()
    expect(completeViaPuter).not.toHaveBeenCalled()
  })
})

describe('canProviderAnswer', () => {
  it('앱이 직접 답을 받아 올 수 있는 공급자만 참이다', () => {
    expect(canProviderAnswer('bridge')).toBe(true)
    expect(canProviderAnswer('puter')).toBe(true)
    expect(canProviderAnswer('handoff')).toBe(false)
  })
})
