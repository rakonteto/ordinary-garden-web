import { nextDue, startOfDayKST } from './scheduler'
import type { NewCareRuleFields, CareRulePatch } from '../data/care'
import type { CareRule, CareType } from '../data/types'

const DAY = 86400000

export interface CareState {
  rules: CareRule[]
  loaded: boolean
}

export interface CareRepo {
  listActiveRules(): Promise<CareRule[]>
  createRule(fields: NewCareRuleFields, now?: number): Promise<CareRule>
  updateRule(id: string, patch: CareRulePatch, now?: number): Promise<CareRule>
  softDeleteRule(id: string, now?: number): Promise<void>
}

export type AddRuleInput = NewCareRuleFields
export interface UpdateRuleInput {
  careType: CareType
  intervalDays: number
  weatherAware: boolean
}

export interface CareStore {
  getSnapshot(): CareState
  subscribe(listener: () => void): () => void
  load(): Promise<void>
  addRule(input: AddRuleInput): Promise<CareRule>
  updateRule(id: string, input: UpdateRuleInput): Promise<void>
  deleteRule(id: string): Promise<void>
  complete(id: string, asOf?: number): Promise<void>
  snooze(id: string, by?: number, asOf?: number): Promise<void>
}

const EMPTY: CareState = { rules: [], loaded: false }

export function createCareStore(repo: CareRepo): CareStore {
  let state: CareState = EMPTY
  const listeners = new Set<() => void>()

  function set(next: CareState) {
    state = next
    listeners.forEach((l) => l())
  }

  async function reload() {
    const rules = await repo.listActiveRules()
    set({ rules, loaded: true })
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    load: reload,
    async addRule(input) {
      const rule = await repo.createRule(input)
      await reload()
      return rule
    },
    async updateRule(id, input) {
      await repo.updateRule(id, {
        careType: input.careType,
        intervalDays: input.intervalDays,
        weatherAware: input.weatherAware,
      })
      await reload()
    },
    async deleteRule(id) {
      await repo.softDeleteRule(id)
      await reload()
    },
    async complete(id, asOf = Date.now()) {
      const r = state.rules.find((x) => x.id === id)
      if (!r) return
      await repo.updateRule(id, { lastCompletedAt: asOf, nextDueAt: nextDue(asOf, r.intervalDays) })
      await reload()
    },
    async snooze(id, by = 1, asOf = Date.now()) {
      const r = state.rules.find((x) => x.id === id)
      if (!r) return
      // 이미 지났거나 오늘인 건 오늘 자정 기준 +by → 최소 '내일 이후'(오늘 목록에서 빠짐).
      const base = Math.max(r.nextDueAt, startOfDayKST(asOf))
      await repo.updateRule(id, { nextDueAt: base + by * DAY })
      await reload()
    },
  }
}
