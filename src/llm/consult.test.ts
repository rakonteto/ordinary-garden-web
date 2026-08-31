import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runConsult, canProviderAnswer } from './consult'
import type { ConsultContext } from './consultPrompt'
import type { LlmSettings } from './settings'
import type { Plant } from '../data/types'

vi.mock('./providers/bridge', () => ({
  completeViaBridge: vi.fn(async () => '브리지 답'),
  BRIDGE_URL: 'http://127.0.0.1:8787',
}))

import { completeViaBridge } from './providers/bridge'

const NOW = Date.UTC(2026, 7, 31, 3, 0, 0)
const plant: Plant = {
  id: 'p1', updatedAt: NOW, deleted: false,
  areaId: 'a1', name: '방울토마토', isArchived: false, sortOrder: 0,
}
const ctx: ConsultContext = { plant, entries: [], rules: [], question: '왜 이래요', asOfMs: NOW }

function settings(over: Partial<LlmSettings> = {}): LlmSettings {
  return { provider: 'claude', bridgeToken: 'tok', ...over }
}

describe('runConsult', () => {
  beforeEach(() => vi.clearAllMocks())

  it('고른 구독을 브리지에 실어 보낸다', async () => {
    expect(await runConsult(ctx, settings({ provider: 'codex' }))).toBe('브리지 답')
    expect(completeViaBridge).toHaveBeenCalledWith(
      expect.objectContaining({ system: expect.any(String), user: expect.stringContaining('방울토마토') }),
      expect.objectContaining({ token: 'tok', provider: 'codex' }),
    )
  })

  it('네 구독이 모두 브리지를 거친다', async () => {
    for (const provider of ['claude', 'codex', 'gemini', 'grok'] as const) {
      vi.clearAllMocks()
      await runConsult(ctx, settings({ provider }))
      expect(completeViaBridge).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ provider }),
      )
    }
  })

  it('넘기기는 앱이 대신 부를 수 없으므로 거절한다', async () => {
    await expect(runConsult(ctx, settings({ provider: 'handoff' }))).rejects.toThrow()
    expect(completeViaBridge).not.toHaveBeenCalled()
  })
})

describe('canProviderAnswer', () => {
  it('넘기기만 사람 손이 필요하다', () => {
    expect(canProviderAnswer('handoff')).toBe(false)
    for (const p of ['claude', 'codex', 'gemini', 'grok'] as const) {
      expect(canProviderAnswer(p)).toBe(true)
    }
  })
})
