import { useEffect, useSyncExternalStore } from 'react'
import { createCareStore, type CareState, type AddRuleInput, type UpdateRuleInput } from './store'
import { listActiveRules, createRule, updateRule, softDeleteRule } from '../data/care'
import type { CareRule } from '../data/types'

export const careStore = createCareStore({ listActiveRules, createRule, updateRule, softDeleteRule })

let started = false
function ensureStarted() {
  if (started) return
  started = true
  void careStore.load()
}

export function useCare(): CareState & {
  addRule: (input: AddRuleInput) => Promise<CareRule>
  updateRule: (id: string, input: UpdateRuleInput) => Promise<void>
  deleteRule: (id: string) => Promise<void>
  complete: (id: string, asOf?: number) => Promise<void>
  snooze: (id: string, by?: number, asOf?: number) => Promise<void>
} {
  const state = useSyncExternalStore(careStore.subscribe, careStore.getSnapshot)
  useEffect(() => {
    ensureStarted()
  }, [])
  return {
    ...state,
    addRule: careStore.addRule,
    updateRule: careStore.updateRule,
    deleteRule: careStore.deleteRule,
    complete: careStore.complete,
    snooze: careStore.snooze,
  }
}
