import type { Plant, JournalEntry, CareRule, WeatherSnapshot } from '../data/types'
import { journalDateLabel } from '../journal/format'
import { workLabel } from '../journal/workType'
import { careLabel } from '../care/careType'
import { lightLabel } from '../garden/light'
import { skyLabel, precipLabel } from '../weather/enums'

const DAY = 86400_000

/** 프롬프트에 싣는 최근 일지 개수. 넘는 만큼은 건수만 알린다. */
export const RECENT_ENTRY_LIMIT = 12

export interface ConsultContext {
  plant: Plant
  areaName?: string
  entries: JournalEntry[]
  rules: CareRule[]
  weather?: WeatherSnapshot
  question: string
  asOfMs?: number
}

export interface ConsultPrompt {
  system: string
  user: string
}

const SYSTEM = [
  '당신은 한국의 노지·텃밭 정원을 오래 가꿔 온 사람입니다.',
  '사용자가 실제로 기르는 식물의 기록을 보고, 지금 무엇을 하면 되는지 알려 주세요.',
  '',
  '지킬 것:',
  '- 한국의 기후와 절기를 기준으로 말합니다. 노지와 텃밭 사정을 우선하고, 화분은 따로 언급될 때만 다룹니다.',
  '- 기록에 없는 사실을 지어내지 않습니다. 판단에 필요한 정보가 없으면 무엇을 더 살펴봐야 하는지 되묻습니다.',
  '- 원인이 여럿일 수 있으면 가장 그럴듯한 것부터 순서대로 짚고, 각각을 어떻게 구별하는지 알려 줍니다.',
  '- 오늘 당장 할 일과 며칠 지켜볼 일을 나눠서 말합니다.',
  '- 농약이나 약제를 권할 때는 반드시 대체할 만한 물리적·생태적 방법을 함께 알려 주고, 사람과 반려동물에 대한 주의를 덧붙입니다.',
  '',
  '형식: 서론 없이 바로 본론으로 들어가고, 400자 안팎으로 짧게 씁니다.',
].join('\n')

function plantSection(plant: Plant, areaName: string | undefined, asOfMs: number): string {
  const lines = [`식물: ${plant.name}`]
  if (areaName) lines.push(`두는 곳: ${areaName}`)
  if (plant.lightRequirement) lines.push(`빛 조건: ${lightLabel(plant.lightRequirement)}`)
  if (plant.datePlanted != null) {
    const days = Math.floor((asOfMs - plant.datePlanted) / DAY)
    lines.push(`심은 날: ${journalDateLabel(plant.datePlanted)} (오늘로 ${days}일째)`)
  }
  if (plant.note) lines.push(`메모: ${plant.note}`)
  return lines.join('\n')
}

function entriesSection(entries: JournalEntry[]): string {
  if (entries.length === 0) return '최근 일지: 일지 기록이 없습니다.'

  const sorted = [...entries].sort((a, b) => b.date - a.date)
  const shown = sorted.slice(0, RECENT_ENTRY_LIMIT)
  const omitted = sorted.length - shown.length

  const lines = shown.map((e) => {
    const tags = e.tags.map((t) => workLabel(t) ?? t).filter(Boolean).join('·')
    const head = tags ? `${journalDateLabel(e.date)} [${tags}]` : journalDateLabel(e.date)
    return e.note ? `- ${head} ${e.note}` : `- ${head}`
  })
  if (omitted > 0) lines.push(`- (외 ${omitted}건은 생략)`)

  return ['최근 일지:', ...lines].join('\n')
}

function rulesSection(rules: CareRule[], asOfMs: number): string {
  if (rules.length === 0) return ''

  const lines = rules.map((r) => {
    const parts = [`${careLabel(r.careType)} ${r.intervalDays}일마다`]
    if (r.lastCompletedAt != null) {
      const ago = Math.floor((asOfMs - r.lastCompletedAt) / DAY)
      parts.push(ago <= 0 ? '오늘 함' : `${ago}일 전에 함`)
    }
    return `- ${parts.join(', ')}`
  })
  return ['정해 둔 돌봄:', ...lines].join('\n')
}

function weatherSection(w: WeatherSnapshot | undefined): string {
  if (!w) return ''

  const parts: string[] = []
  if (w.tempC != null) parts.push(`기온 ${w.tempC}도`)
  if (w.feelsLikeC != null) parts.push(`체감 ${w.feelsLikeC}도`)
  if (w.humidity != null) parts.push(`습도 ${w.humidity}%`)
  const sky = skyLabel(w.sky)
  if (sky) parts.push(sky)
  if (w.precipType !== 'none') {
    const precip = precipLabel(w.precipType)
    if (precip) parts.push(precip)
  }

  return parts.length > 0 ? `오늘 날씨: ${parts.join(', ')}` : ''
}

/**
 * 한 식물의 기록을 모아 상담 질문으로 엮는다.
 *
 * 집 위치와 좌표는 싣지 않는다. 일지의 날씨 스냅샷이 위치 라벨을 빼고 박제되는 규약을
 * 프롬프트에서도 그대로 지킨다.
 */
export function buildConsultPrompt(ctx: ConsultContext): ConsultPrompt {
  const asOfMs = ctx.asOfMs ?? Date.now()

  const sections = [
    plantSection(ctx.plant, ctx.areaName, asOfMs),
    weatherSection(ctx.weather),
    rulesSection(ctx.rules, asOfMs),
    entriesSection(ctx.entries),
    `묻고 싶은 것: ${ctx.question}`,
  ].filter(Boolean)

  return { system: SYSTEM, user: sections.join('\n\n') }
}
