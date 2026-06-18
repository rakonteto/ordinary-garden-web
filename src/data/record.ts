import type { BaseRecord } from './types'

export function newId(): string {
  return crypto.randomUUID()
}

/** 새 레코드의 공통 필드(id·updatedAt·deleted) */
export function baseFields(now: number): BaseRecord {
  return { id: newId(), updatedAt: now, deleted: false }
}
