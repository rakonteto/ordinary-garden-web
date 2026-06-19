import type { LightRequirement } from '../data/types'

export const LIGHT_OPTIONS: { value: LightRequirement; label: string }[] = [
  { value: 'high', label: '양지' },
  { value: 'medium', label: '반양지' },
  { value: 'low', label: '음지' },
]

export function lightLabel(value: LightRequirement | undefined): string | null {
  if (!value) return null
  return LIGHT_OPTIONS.find((o) => o.value === value)?.label ?? null
}
