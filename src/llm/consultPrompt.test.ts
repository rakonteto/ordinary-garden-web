import { describe, it, expect } from 'vitest'
import { buildConsultPrompt, RECENT_ENTRY_LIMIT } from './consultPrompt'
import type { ConsultContext } from './consultPrompt'
import type { Plant, JournalEntry, CareRule, WeatherSnapshot } from '../data/types'

const DAY = 86400_000
// 2026-08-31 12:00 KST
const NOW = Date.UTC(2026, 7, 31, 3, 0, 0)

function plant(over: Partial<Plant> = {}): Plant {
  return {
    id: 'p1', updatedAt: NOW, deleted: false,
    areaId: 'a1', name: '방울토마토', isArchived: false, sortOrder: 0,
    ...over,
  }
}

function entry(over: Partial<JournalEntry> = {}): JournalEntry {
  return {
    id: 'e1', updatedAt: NOW, deleted: false,
    plantId: 'p1', date: NOW - DAY, note: '', tags: [],
    ...over,
  }
}

function rule(over: Partial<CareRule> = {}): CareRule {
  return {
    id: 'r1', updatedAt: NOW, deleted: false,
    plantId: 'p1', careType: 'water', intervalDays: 3,
    nextDueAt: NOW + DAY, weatherAware: true, createdAt: NOW - 10 * DAY,
    ...over,
  }
}

const weather: WeatherSnapshot = {
  tempC: 31, feelsLikeC: 34, humidity: 70,
  sky: 'clear', precipType: 'none', airGrade: 2, capturedAt: NOW,
}

function base(over: Partial<ConsultContext> = {}): ConsultContext {
  return {
    plant: plant(), entries: [], rules: [], question: '요즘 잎이 처져요.',
    asOfMs: NOW, ...over,
  }
}

describe('buildConsultPrompt', () => {
  it('시스템 프롬프트가 한국 노지·텃밭 맥락과 답변 형식을 지시한다', () => {
    const { system } = buildConsultPrompt(base())
    expect(system).toMatch(/한국/)
    expect(system).toMatch(/노지|텃밭/)
  })

  it('식물 이름과 영역·광 조건을 담는다', () => {
    const { user } = buildConsultPrompt(base({
      plant: plant({ lightRequirement: 'high', note: '작년에 심음' }),
      areaName: '앞마당',
    }))
    expect(user).toMatch(/방울토마토/)
    expect(user).toMatch(/앞마당/)
    expect(user).toMatch(/양지/)
    expect(user).toMatch(/작년에 심음/)
  })

  it('심은 날이 있으면 며칠째인지 함께 알려 준다', () => {
    const { user } = buildConsultPrompt(base({
      plant: plant({ datePlanted: NOW - 30 * DAY }),
    }))
    expect(user).toMatch(/30일/)
  })

  it('사용자 질문을 그대로 싣는다', () => {
    const { user } = buildConsultPrompt(base({ question: '열매가 안 달려요' }))
    expect(user).toMatch(/열매가 안 달려요/)
  })

  it('일지를 최신순으로 담고 작업 태그를 한국어 라벨로 옮긴다', () => {
    const { user } = buildConsultPrompt(base({
      entries: [
        entry({ id: 'e1', date: NOW - DAY, note: '물 줌', tags: ['water'] }),
        entry({ id: 'e2', date: NOW - 5 * DAY, note: '진딧물 발견', tags: ['pest', 'observe'] }),
      ],
    }))
    expect(user).toMatch(/물주기/)
    expect(user).toMatch(/진딧물 발견/)
    expect(user).toMatch(/병해충/)
    // 최신이 먼저 나와야 한다
    expect(user.indexOf('물 줌')).toBeLessThan(user.indexOf('진딧물 발견'))
  })

  it('일지가 상한을 넘으면 최근 것만 싣고 생략을 알린다', () => {
    const many = Array.from({ length: RECENT_ENTRY_LIMIT + 3 }, (_, i) =>
      entry({ id: `e${i}`, date: NOW - i * DAY, note: `기록${i}` }))
    const { user } = buildConsultPrompt(base({ entries: many }))

    expect(user).toMatch(/기록0/)
    expect(user).not.toMatch(new RegExp(`기록${RECENT_ENTRY_LIMIT + 1}\\b`))
    expect(user).toMatch(/외 \d+건/)
  })

  it('일지가 없으면 없다고 적는다', () => {
    const { user } = buildConsultPrompt(base({ entries: [] }))
    expect(user).toMatch(/일지 기록이 없습니다|기록 없음/)
  })

  it('케어 규칙을 주기와 다음 예정으로 담는다', () => {
    const { user } = buildConsultPrompt(base({
      rules: [rule({ careType: 'water', intervalDays: 3, lastCompletedAt: NOW - DAY })],
    }))
    expect(user).toMatch(/물주기/)
    expect(user).toMatch(/3일/)
  })

  it('날씨가 있으면 담는다', () => {
    const { user } = buildConsultPrompt(base({ weather }))
    expect(user).toMatch(/31/)
    expect(user).toMatch(/맑음/)
  })

  it('날씨가 없으면 날씨 절을 넣지 않는다', () => {
    const { user } = buildConsultPrompt(base({ weather: undefined }))
    expect(user).not.toMatch(/오늘 날씨/)
  })

  it('집 위치나 좌표를 싣지 않는다', () => {
    // 일지 날씨 스냅샷에 위치 라벨을 제외한 규약을 프롬프트에서도 지킨다.
    const { user, system } = buildConsultPrompt(base({ weather }))
    expect(`${user}${system}`).not.toMatch(/위도|경도|좌표|nx|ny/)
  })
})
