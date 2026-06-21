# ④ 식물 상세 + 재배일지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 식물 카드 → `/plant/:id` 상세 화면(히어로·정보칩) + 재배일지(작업태그·다중사진·그날 날씨 박제·역순 타임라인) + 식물 편집/보관/삭제 UI를 구현한다.

**Architecture:** 데이터 계층(Dexie 리포지토리)은 ③ 패턴을 그대로 따른다 — 순수 함수 리포지토리 + tombstone soft-delete. 일지는 plant별·상세화면 전용이라 전역 모듈 싱글톤 store가 아니라 **로컬 훅 `usePlantJournal(plantId)`** 로 관리한다(③ `gardenStore`는 전역 목록 전용). 식물 편집/보관/삭제는 정원 목록 일관성에 영향을 주므로 **`gardenStore` 액션**으로 추가한다. WeatherSnapshot은 발행 `WeatherBundle`의 핵심 필드만 추려 일지에 JSON으로 박제한다. SwiftUI 네이티브 "계획5"의 1:1 포팅이되, note 편집(SwiftUI 미구현)은 웹앱에서 보완한다.

**Tech Stack:** React 19 · Vite · TypeScript · Dexie(IndexedDB) · react-router v7(HashRouter) · Vitest. 신규 런타임 의존성 **0**.

## Global Constraints

- **비용 $0**: 신규 유료 의존성·서비스 금지. 신규 npm 런타임 의존성 0(개발의존성도 추가 없이 기존 vitest/testing-library로).
- **테스트가 SoT**: TDD 순서 엄수(실패 테스트 → 최소 구현 → 통과). 테스트를 약화시켜 통과시키지 말 것. 매 태스크 종료 시 `npm run build`(tsc 스키마 검증) + `npm test -- --run` 전체 통과 유지(현재 **106 통과** 기준, 태스크마다 증가).
- **절대경로**: 셸 cwd가 워크스페이스 루트로 리셋되므로 항상 `npm --prefix /Users/rakonteto/claude-workspace/ordinary-garden-web …`, `git -C /Users/rakonteto/claude-workspace/ordinary-garden-web …`.
- **데이터 모델 규칙**: 모든 레코드는 `BaseRecord`(id·updatedAt·deleted) 확장. boolean은 IndexedDB 키 불가 → 인덱스 금지(메모리 필터). `Date.now()`는 리포지토리 안에서만 호출(주입 아님, ③과 동일 — 동기화 clock 주입은 ⑥ 후속).
- **사진/Blob 테스트 환경**: jsdom + fake-indexeddb는 IDB 라운드트립에서 `Blob` 인스턴스를 보존하지 못한다 → blob 라운드트립을 검증하는 리포지토리 테스트는 파일 상단에 `// @vitest-environment node`. DOM 컴포넌트의 사진 표시는 `URL.createObjectURL` mock으로 검증(③ `PlantPhoto.test` 선례).
- **브랜치**: `feature/plant-detail`(main `8068cc1` 기반). 한글 conventional 커밋 + 끝줄 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **언어**: UI 문자열·주석 한국어. 존댓말 톤(③ "식물 추가" 등과 일관).

## 재사용할 기존 자산 (그대로 import)

- `src/data/types.ts`: `BaseRecord`·`Plant`·`JournalEntry`·`JournalPhoto`·`LightRequirement`
- `src/data/record.ts`: `newId()`, `baseFields(now)`
- `src/data/db.ts`: `db`(journalEntries 인덱스 `id,plantId,date,updatedAt` / journalPhotos `id,ownerId,updatedAt`)
- `src/data/plants.ts`: `updatePlant(id,patch)`·`softDeletePlant(id)`·`archivePlant(id)`·`PlantPatch`
- `src/data/photos.ts`: `putPhoto`·`getPhoto`·`softDeletePhoto`(여기에 `listPhotosByOwner` 추가)
- `src/garden/Sheet.tsx`: `<Sheet title onClose onSave canSave>{children}</Sheet>`
- `src/garden/PlantPhoto.tsx`: `<PlantPhoto photoId alt className/>`(photoId→getPhoto→objectURL→플레이스홀더)
- `src/garden/light.ts`: `LIGHT_OPTIONS`·`lightLabel(req)`
- `src/garden/useGarden.ts`: `useGarden()`(areas·plants·loaded + 액션), 모듈 싱글톤 `gardenStore`
- `src/weather/useWeather.ts`: 모듈 싱글톤 `weatherStore`(`getSnapshot().bundle`)
- `src/weather/types.ts`: `WeatherBundle`·`CurrentWeather`·`AirQuality`
- `src/weather/enums.ts`: `skyLabel(sky)`·`precipLabel(precip)`·`airGrade(grade)→{label,colorVar}`
- `src/weather/format.ts`: `tempString(v)`·`todayKSTDate(now)`
- `src/codex/SpeciesDetail.tsx`: 상세 라우트 패턴(`useParams`·뒤로가기 `Link`·glass)
- `src/garden/AddPlantSheet.tsx`: 편집 시트가 복제할 폼 패턴(field·file input+preview)

## File Structure

**수정:**
- `src/data/types.ts` — `WeatherSnapshot` 추가, `JournalEntry.weatherSnapshot: WeatherSnapshot?`, `JournalPhoto.sortOrder?: number`
- `src/data/photos.ts` — `listPhotosByOwner` 추가, `putPhoto`에 `sortOrder?`
- `src/garden/store.ts` — `GardenRepo`에 `archivePlant`·`softDeletePlant`, `GardenStore`에 `editPlant`·`archivePlant`·`deletePlant`, `EditPlantInput`
- `src/garden/useGarden.ts` — 신규 액션 연결
- `src/garden/PlantCard.tsx` — `Link to=/plant/:id`로 감쌈
- `src/App.tsx` — `/plant/:id` 라우트

**생성:**
- `src/journal/workType.ts`(+test) — WorkType 도메인
- `src/journal/format.ts`(+test) — 일지 날짜 포맷
- `src/journal/weatherSnapshot.ts`(+test) — 날씨 박제·요약
- `src/data/journal.ts`(+test) — 일지 리포지토리
- `src/journal/usePlantJournal.ts`(+test) — plant별 일지 훅
- `src/journal/WorkTypeChips.tsx`(+test) — 태그 다중선택 칩
- `src/journal/JournalEntrySheet.tsx`(+test) — 일지 작성/편집 모달
- `src/journal/JournalEntryCard.tsx`(+test) — 일지 카드
- `src/garden/EditPlantSheet.tsx`(+test) — 식물 편집/보관/삭제 모달
- `src/garden/PlantDetail.tsx`(+test) + `PlantDetail.css` — 상세 화면
- `src/routes/PlantDetailRoute.tsx` — 라우트 래퍼

---

### Task 1: WorkType 도메인

**Files:**
- Create: `src/journal/workType.ts`
- Test: `src/journal/workType.test.ts`

**Interfaces:**
- Produces: `type WorkType = 'water'|'fertilize'|'sowTransplant'|'observe'|'harvest'|'prune'|'pest'|'support'`; `WORK_TYPES: readonly {value: WorkType; label: string}[]`(정의 순서 = 표시 순서); `workLabel(value: string): string | undefined`; `sortWorkTypes(tags: string[]): WorkType[]`(WORK_TYPES 순서로 정렬·미지값 제외)

- [ ] **Step 1: 실패 테스트**

```ts
// src/journal/workType.test.ts
import { describe, it, expect } from 'vitest'
import { WORK_TYPES, workLabel, sortWorkTypes } from './workType'

describe('workType', () => {
  it('8종이 SwiftUI 원본 순서·라벨로 정의된다', () => {
    expect(WORK_TYPES.map((w) => w.value)).toEqual([
      'water', 'fertilize', 'sowTransplant', 'observe', 'harvest', 'prune', 'pest', 'support',
    ])
    expect(WORK_TYPES.map((w) => w.label)).toEqual([
      '물주기', '비료', '파종·모종', '관찰', '수확', '가지치기', '병해충', '지지대',
    ])
  })
  it('workLabel: 알면 라벨, 모르면 undefined', () => {
    expect(workLabel('water')).toBe('물주기')
    expect(workLabel('bogus')).toBeUndefined()
  })
  it('sortWorkTypes: 정의 순서로 정렬하고 미지 값은 버린다', () => {
    expect(sortWorkTypes(['prune', 'water', 'bogus', 'observe'])).toEqual(['water', 'observe', 'prune'])
  })
})
```

- [ ] **Step 2: 실패 확인** — `npm test -- --run src/journal/workType.test.ts` → FAIL(모듈 없음)
- [ ] **Step 3: 구현**

```ts
// src/journal/workType.ts
export type WorkType =
  | 'water' | 'fertilize' | 'sowTransplant' | 'observe'
  | 'harvest' | 'prune' | 'pest' | 'support'

// 정의 순서 = 칩 표시·태그 정렬 순서. SwiftUI JournalEntry.swift WorkType과 1:1.
export const WORK_TYPES: readonly { value: WorkType; label: string }[] = [
  { value: 'water', label: '물주기' },
  { value: 'fertilize', label: '비료' },
  { value: 'sowTransplant', label: '파종·모종' },
  { value: 'observe', label: '관찰' },
  { value: 'harvest', label: '수확' },
  { value: 'prune', label: '가지치기' },
  { value: 'pest', label: '병해충' },
  { value: 'support', label: '지지대' },
]

const LABEL = new Map(WORK_TYPES.map((w) => [w.value, w.label]))
export function workLabel(value: string): string | undefined {
  return LABEL.get(value as WorkType)
}

const ORDER = new Map(WORK_TYPES.map((w, i) => [w.value, i]))
export function sortWorkTypes(tags: string[]): WorkType[] {
  return tags.filter((t): t is WorkType => ORDER.has(t as WorkType)).sort((a, b) => ORDER.get(a)! - ORDER.get(b)!)
}
```

- [ ] **Step 4: 통과 확인** — `npm test -- --run src/journal/workType.test.ts` → PASS
- [ ] **Step 5: 커밋**

```bash
git -C /Users/rakonteto/claude-workspace/ordinary-garden-web add src/journal/workType.ts src/journal/workType.test.ts
git -C /Users/rakonteto/claude-workspace/ordinary-garden-web commit -m "feat(journal): WorkType 작업종류 도메인(8종)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: 일지 날짜 포맷

**Files:**
- Create: `src/journal/format.ts`
- Test: `src/journal/format.test.ts`

**Interfaces:**
- Produces: `journalDateLabel(ms: number): string`("6월 21일", KST) · `dateInputValue(ms: number): string`("YYYY-MM-DD", `<input type=date>` value용, KST) · `parseDateInput(value: string): number`("YYYY-MM-DD" → 그날 KST 자정 epoch ms)
- 근거: `format.ts`의 `todayKSTDate`와 동일하게 KST(+9h) 기준. round-trip(`dateInputValue(parseDateInput(s)) === s`) 보장.

- [ ] **Step 1: 실패 테스트**

```ts
// src/journal/format.test.ts
import { describe, it, expect } from 'vitest'
import { journalDateLabel, dateInputValue, parseDateInput } from './format'

// 2026-06-21 00:00 KST = 2026-06-20T15:00:00Z
const KST_2026_06_21 = Date.parse('2026-06-20T15:00:00Z')

describe('journal/format', () => {
  it('journalDateLabel: KST 월·일 한국어', () => {
    expect(journalDateLabel(KST_2026_06_21)).toBe('6월 21일')
  })
  it('dateInputValue: KST YYYY-MM-DD', () => {
    expect(dateInputValue(KST_2026_06_21)).toBe('2026-06-21')
  })
  it('parseDateInput ↔ dateInputValue round-trip', () => {
    expect(dateInputValue(parseDateInput('2026-06-21'))).toBe('2026-06-21')
  })
  it('parseDateInput: KST 자정 epoch', () => {
    expect(parseDateInput('2026-06-21')).toBe(KST_2026_06_21)
  })
})
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현**

```ts
// src/journal/format.ts
// 모두 KST(+9h) 기준. weather/format.ts todayKSTDate와 동일 규약.
function kstParts(ms: number): { y: number; m: number; d: number } {
  const k = new Date(ms + 9 * 3600 * 1000)
  return { y: k.getUTCFullYear(), m: k.getUTCMonth() + 1, d: k.getUTCDate() }
}

export function journalDateLabel(ms: number): string {
  const { m, d } = kstParts(ms)
  return `${m}월 ${d}일`
}

export function dateInputValue(ms: number): string {
  const { y, m, d } = kstParts(ms)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function parseDateInput(value: string): number {
  const [y, m, d] = value.split('-').map(Number)
  // 그날 KST 자정 = UTC 전날 15:00
  return Date.UTC(y, m - 1, d) - 9 * 3600 * 1000
}
```

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(journal): 일지 날짜 포맷(KST)`

---

### Task 3: WeatherSnapshot 타입 + 박제·요약

**Files:**
- Modify: `src/data/types.ts`(WeatherSnapshot 추가, JournalEntry/JournalPhoto 필드 확정)
- Create: `src/journal/weatherSnapshot.ts`
- Test: `src/journal/weatherSnapshot.test.ts`

**Interfaces:**
- Produces (types.ts): `interface WeatherSnapshot { tempC: number|null; feelsLikeC: number|null; humidity: number|null; sky: string|null; precipType: string; airGrade: number|null; capturedAt: number }`; `JournalEntry.weatherSnapshot?: WeatherSnapshot`(기존 `unknown` 대체); `JournalPhoto.sortOrder?: number`(추가)
- Produces (weatherSnapshot.ts): `captureSnapshot(bundle: WeatherBundle, capturedAt: number): WeatherSnapshot`(airGrade = khaiGrade ?? pm10Grade ?? pm25Grade) · `snapshotSummary(s: WeatherSnapshot): string`("21° 흐림 · 미세먼지 보통") · `snapshotShort(s: WeatherSnapshot): string`("21° 흐림")

- [ ] **Step 1: types.ts 수정**

`src/data/types.ts`에서 `JournalEntry`·`JournalPhoto`를 아래로 교체하고 `WeatherSnapshot`을 추가:

```ts
// 일지에 박제하는 그날 날씨(WeatherBundle 핵심 필드 부분집합). 집 위치 라벨은 프라이버시상 제외.
export interface WeatherSnapshot {
  tempC: number | null
  feelsLikeC: number | null
  humidity: number | null
  sky: string | null       // 'clear'|'partly'|'cloudy'|null
  precipType: string       // 'none'|'rain'|'rainSnow'|'snow'
  airGrade: number | null  // 통합 미세먼지 등급(khai>pm10>pm25)
  capturedAt: number       // epoch ms
}

export interface JournalEntry extends BaseRecord {
  plantId: string
  date: number
  note: string
  tags: string[]                       // WorkType 식별자(다중)
  weatherSnapshot?: WeatherSnapshot
}

export interface JournalPhoto extends BaseRecord {
  ownerId: string          // entry id 또는 plant 대표사진
  blob?: Blob
  driveFileId?: string
  sortOrder?: number       // 일지 다중 사진 표시 순서(대표사진은 생략)
}
```

- [ ] **Step 2: 실패 테스트**

```ts
// src/journal/weatherSnapshot.test.ts
import { describe, it, expect } from 'vitest'
import type { WeatherBundle } from '../weather/types'
import { captureSnapshot, snapshotSummary, snapshotShort } from './weatherSnapshot'

function bundle(over: Partial<WeatherBundle['current']>, air: Partial<WeatherBundle['airQuality']>): WeatherBundle {
  return {
    current: { tempC: 21, humidity: 60, precip1h: 0, precipType: 'none', windDeg: null, windSpeed: null, sky: 'cloudy', feelsLikeC: 20, ...over },
    hourly: [], daily: [], alerts: [],
    airQuality: { pm10: null, pm10Grade: null, pm25: null, pm25Grade: null, khai: null, khaiGrade: null, ...air },
    meta: { generatedAt: '2026-06-20T15:00:00.000Z', sources: [], locationLabel: '우리집' },
  }
}

describe('weatherSnapshot', () => {
  it('captureSnapshot: current+airQuality 핵심 필드, airGrade는 khai>pm10>pm25', () => {
    const s = captureSnapshot(bundle({ tempC: 21, sky: 'cloudy' }, { khaiGrade: 2, pm10Grade: 3 }), 1000)
    expect(s).toEqual({ tempC: 21, feelsLikeC: 20, humidity: 60, sky: 'cloudy', precipType: 'none', airGrade: 2, capturedAt: 1000 })
  })
  it('captureSnapshot: khai 없으면 pm10, 그것도 없으면 pm25', () => {
    expect(captureSnapshot(bundle({}, { pm10Grade: 3 }), 0).airGrade).toBe(3)
    expect(captureSnapshot(bundle({}, { pm25Grade: 1 }), 0).airGrade).toBe(1)
    expect(captureSnapshot(bundle({}, {}), 0).airGrade).toBeNull()
  })
  it('snapshotSummary: 기온 + (강수 우선, 없으면 하늘) + 미세먼지', () => {
    const s = captureSnapshot(bundle({ tempC: 21, sky: 'cloudy', precipType: 'none' }, { khaiGrade: 2 }), 0)
    expect(snapshotSummary(s)).toBe('21° 흐림 · 미세먼지 보통')
  })
  it('snapshotSummary: 강수가 하늘보다 우선', () => {
    const s = captureSnapshot(bundle({ tempC: 18, sky: 'cloudy', precipType: 'rain' }, {}), 0)
    expect(snapshotSummary(s)).toBe('18° 비')
  })
  it('snapshotShort: 미세먼지 제외', () => {
    const s = captureSnapshot(bundle({ tempC: 21, sky: 'clear' }, { khaiGrade: 1 }), 0)
    expect(snapshotShort(s)).toBe('21° 맑음')
  })
})
```

- [ ] **Step 3: 실패 확인** → FAIL
- [ ] **Step 4: 구현**

```ts
// src/journal/weatherSnapshot.ts
import type { WeatherBundle, AirQuality } from '../weather/types'
import type { WeatherSnapshot } from '../data/types'
import { skyLabel, precipLabel, airGrade } from '../weather/enums'
import { tempString } from '../weather/format'

function pickGrade(aq: AirQuality): number | null {
  return aq.khaiGrade ?? aq.pm10Grade ?? aq.pm25Grade ?? null
}

export function captureSnapshot(bundle: WeatherBundle, capturedAt: number): WeatherSnapshot {
  const c = bundle.current
  return {
    tempC: c.tempC,
    feelsLikeC: c.feelsLikeC ?? null,
    humidity: c.humidity,
    sky: c.sky,
    precipType: c.precipType,
    airGrade: pickGrade(bundle.airQuality),
    capturedAt,
  }
}

function headline(s: WeatherSnapshot): string {
  const parts: string[] = []
  if (s.tempC != null) parts.push(`${tempString(s.tempC)}°`)
  const wx = precipLabel(s.precipType) ?? skyLabel(s.sky) // 강수 우선, 없으면 하늘
  if (wx) parts.push(wx)
  return parts.join(' ') || '—'
}

export function snapshotShort(s: WeatherSnapshot): string {
  return headline(s)
}

export function snapshotSummary(s: WeatherSnapshot): string {
  const g = airGrade(s.airGrade)
  return g ? `${headline(s)} · 미세먼지 ${g.label}` : headline(s)
}
```

- [ ] **Step 5: 통과 + 빌드(tsc로 types 검증)** — `npm test -- --run src/journal/weatherSnapshot.test.ts` PASS, `npm run build` 클린
- [ ] **Step 6: 커밋** — `feat(journal): WeatherSnapshot 날씨 박제·요약 + 일지 타입 확정`

---

### Task 4: 일지 리포지토리

**Files:**
- Create: `src/data/journal.ts`
- Test: `src/data/journal.test.ts`(`// @vitest-environment node`)

**Interfaces:**
- Consumes: `db`, `baseFields`, `JournalEntry`·`WeatherSnapshot`(Task 3)
- Produces: `NewEntryFields { plantId; date; note; tags: string[]; weatherSnapshot?: WeatherSnapshot }`; `EntryPatch = Partial<Pick<JournalEntry,'date'|'note'|'tags'|'weatherSnapshot'>>`; `createEntry(fields): Promise<JournalEntry>`; `listEntriesByPlant(plantId): Promise<JournalEntry[]>`(date 내림차순=최신 위, 동률은 updatedAt 내림차순, deleted 제외); `updateEntry(id, patch): Promise<JournalEntry>`; `softDeleteEntry(id): Promise<void>`(멱등)

- [ ] **Step 1: 실패 테스트**

```ts
// src/data/journal.test.ts
// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from './db'
import { createEntry, listEntriesByPlant, updateEntry, softDeleteEntry } from './journal'

beforeEach(async () => {
  await db.journalEntries.clear()
})

describe('journal repository', () => {
  it('createEntry: 저장하고 BaseRecord 필드를 채운다', async () => {
    const e = await createEntry({ plantId: 'p1', date: 100, note: '메모', tags: ['water'] })
    expect(e.id).toBeTruthy()
    expect(e.deleted).toBe(false)
    expect(await db.journalEntries.get(e.id)).toMatchObject({ plantId: 'p1', note: '메모', tags: ['water'] })
  })
  it('listEntriesByPlant: 해당 식물만, 최신(date 내림차순)이 위', async () => {
    await createEntry({ plantId: 'p1', date: 100, note: 'a', tags: [] })
    await createEntry({ plantId: 'p1', date: 300, note: 'b', tags: [] })
    await createEntry({ plantId: 'p2', date: 200, note: 'c', tags: [] })
    const list = await listEntriesByPlant('p1')
    expect(list.map((e) => e.note)).toEqual(['b', 'a'])
  })
  it('updateEntry: 패치 적용 + updatedAt 갱신', async () => {
    const e = await createEntry({ plantId: 'p1', date: 100, note: 'old', tags: [] })
    const up = await updateEntry(e.id, { note: 'new', tags: ['prune'] })
    expect(up.note).toBe('new')
    expect(up.tags).toEqual(['prune'])
  })
  it('softDeleteEntry: tombstone, 목록서 제외, 멱등', async () => {
    const e = await createEntry({ plantId: 'p1', date: 100, note: 'x', tags: [] })
    await softDeleteEntry(e.id)
    await softDeleteEntry(e.id) // 멱등
    expect(await listEntriesByPlant('p1')).toEqual([])
    expect((await db.journalEntries.get(e.id))?.deleted).toBe(true)
  })
})
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현**

```ts
// src/data/journal.ts
import { db } from './db'
import { baseFields } from './record'
import type { JournalEntry, WeatherSnapshot } from './types'

export interface NewEntryFields {
  plantId: string
  date: number
  note: string
  tags: string[]
  weatherSnapshot?: WeatherSnapshot
}

export type EntryPatch = Partial<Pick<JournalEntry, 'date' | 'note' | 'tags' | 'weatherSnapshot'>>

export async function createEntry(fields: NewEntryFields): Promise<JournalEntry> {
  const entry: JournalEntry = {
    ...baseFields(Date.now()),
    plantId: fields.plantId,
    date: fields.date,
    note: fields.note,
    tags: fields.tags,
    weatherSnapshot: fields.weatherSnapshot,
  }
  await db.journalEntries.add(entry)
  return entry
}

export async function listEntriesByPlant(plantId: string): Promise<JournalEntry[]> {
  const all = await db.journalEntries.where('plantId').equals(plantId).toArray()
  return all
    .filter((e) => !e.deleted)
    .sort((a, b) => b.date - a.date || b.updatedAt - a.updatedAt) // 최신이 위
}

export async function updateEntry(id: string, patch: EntryPatch): Promise<JournalEntry> {
  const existing = await db.journalEntries.get(id)
  if (!existing) throw new Error(`journal entry not found: ${id}`)
  const updated: JournalEntry = { ...existing, ...patch, updatedAt: Date.now() }
  await db.journalEntries.put(updated)
  return updated
}

export async function softDeleteEntry(id: string): Promise<void> {
  const existing = await db.journalEntries.get(id)
  if (!existing) return
  await db.journalEntries.put({ ...existing, deleted: true, updatedAt: Date.now() })
}
```

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(data): 재배일지 리포지토리(createEntry·list·update·softDelete)`

---

### Task 5: photos 리포지토리 확장 (ownerId 다중 조회 + sortOrder)

**Files:**
- Modify: `src/data/photos.ts`
- Modify(test): `src/data/photos.test.ts`(기존, `// @vitest-environment node`)

**Interfaces:**
- Produces: `NewPhoto`에 `sortOrder?: number` 추가; `putPhoto({ownerId, blob, sortOrder?})`; `listPhotosByOwner(ownerId): Promise<JournalPhoto[]>`(deleted·blob 없는 것 제외, `sortOrder ?? 0` 오름차순, 동률은 updatedAt 오름차순)

- [ ] **Step 1: 실패 테스트 추가**(기존 photos.test.ts에 describe 블록 추가)

```ts
import { putPhoto, listPhotosByOwner, softDeletePhoto } from './photos'
// ... 기존 import/setup 유지(beforeEach에 db.journalPhotos.clear() 있다고 가정; 없으면 추가)

describe('listPhotosByOwner', () => {
  it('ownerId로 모아 sortOrder 순으로, deleted 제외', async () => {
    const blob = new Blob(['x'], { type: 'image/png' })
    await putPhoto({ ownerId: 'e1', blob, sortOrder: 1 })
    await putPhoto({ ownerId: 'e1', blob, sortOrder: 0 })
    const other = await putPhoto({ ownerId: 'e2', blob, sortOrder: 0 })
    const list = await listPhotosByOwner('e1')
    expect(list.map((p) => p.sortOrder)).toEqual([0, 1])
    await softDeletePhoto(other.id)
    expect(await listPhotosByOwner('e2')).toEqual([])
  })
})
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현**(photos.ts 수정)

```ts
export interface NewPhoto {
  ownerId: string
  blob: Blob
  sortOrder?: number
}

export async function putPhoto({ ownerId, blob, sortOrder }: NewPhoto): Promise<JournalPhoto> {
  const photo: JournalPhoto = { ...baseFields(Date.now()), ownerId, blob, sortOrder }
  await db.journalPhotos.add(photo)
  return photo
}

export async function listPhotosByOwner(ownerId: string): Promise<JournalPhoto[]> {
  const all = await db.journalPhotos.where('ownerId').equals(ownerId).toArray()
  return all
    .filter((p) => !p.deleted && p.blob)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.updatedAt - b.updatedAt)
}
```
(`getPhoto`·`softDeletePhoto`는 그대로.)

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(data): photos listPhotosByOwner + sortOrder(일지 다중사진)`

---

### Task 6: usePlantJournal 훅

**Files:**
- Create: `src/journal/usePlantJournal.ts`
- Test: `src/journal/usePlantJournal.test.tsx`(jsdom; blob 라운드트립은 검증 안 함 — Task 5가 커버)

**Interfaces:**
- Consumes: `createEntry`·`listEntriesByPlant`·`updateEntry`·`softDeleteEntry`(journal.ts); `putPhoto`·`listPhotosByOwner`·`softDeletePhoto`(photos.ts)
- Produces: `EntryInput { date: number; note: string; tags: string[]; weatherSnapshot?: WeatherSnapshot; photos?: File[] }`; `usePlantJournal(plantId): { entries: JournalEntry[]; loaded: boolean; addEntry(input): Promise<void>; updateEntry(id, input, replacePhotos: boolean): Promise<void>; deleteEntry(id): Promise<void> }`
- 동작: `addEntry` = createEntry → 각 photo `putPhoto({ownerId: entry.id, blob, sortOrder: i})` → reload. `updateEntry` = updateEntry(필드) → `replacePhotos`면 기존 listPhotosByOwner 전부 softDeletePhoto 후 새 photos putPhoto → reload. `deleteEntry` = 사진 전부 softDeletePhoto → softDeleteEntry → reload.

- [ ] **Step 1: 실패 테스트**

```tsx
// src/journal/usePlantJournal.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { renderHook, act, waitFor } from '@testing-library/react'
import { db } from '../data/db'
import { usePlantJournal } from './usePlantJournal'

beforeEach(async () => {
  await db.journalEntries.clear()
  await db.journalPhotos.clear()
})

describe('usePlantJournal', () => {
  it('addEntry 후 목록에 최신순으로 반영된다', async () => {
    const { result } = renderHook(() => usePlantJournal('p1'))
    await waitFor(() => expect(result.current.loaded).toBe(true))
    await act(async () => {
      await result.current.addEntry({ date: 100, note: '첫 기록', tags: ['water'] })
      await result.current.addEntry({ date: 200, note: '둘째', tags: [] })
    })
    expect(result.current.entries.map((e) => e.note)).toEqual(['둘째', '첫 기록'])
  })
  it('deleteEntry 후 목록서 빠진다', async () => {
    const { result } = renderHook(() => usePlantJournal('p1'))
    await waitFor(() => expect(result.current.loaded).toBe(true))
    await act(async () => { await result.current.addEntry({ date: 100, note: 'x', tags: [] }) })
    const id = result.current.entries[0].id
    await act(async () => { await result.current.deleteEntry(id) })
    expect(result.current.entries).toEqual([])
  })
})
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현**

```ts
// src/journal/usePlantJournal.ts
import { useCallback, useEffect, useState } from 'react'
import type { JournalEntry, WeatherSnapshot } from '../data/types'
import { createEntry, listEntriesByPlant, updateEntry as repoUpdate, softDeleteEntry } from '../data/journal'
import { putPhoto, listPhotosByOwner, softDeletePhoto } from '../data/photos'

export interface EntryInput {
  date: number
  note: string
  tags: string[]
  weatherSnapshot?: WeatherSnapshot
  photos?: File[]
}

async function savePhotos(ownerId: string, files: File[]) {
  for (let i = 0; i < files.length; i++) {
    await putPhoto({ ownerId, blob: files[i], sortOrder: i })
  }
}

export function usePlantJournal(plantId: string) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  const reload = useCallback(async () => {
    setEntries(await listEntriesByPlant(plantId))
    setLoaded(true)
  }, [plantId])

  useEffect(() => { void reload() }, [reload])

  const addEntry = useCallback(async (input: EntryInput) => {
    const entry = await createEntry({
      plantId, date: input.date, note: input.note, tags: input.tags, weatherSnapshot: input.weatherSnapshot,
    })
    if (input.photos?.length) await savePhotos(entry.id, input.photos)
    await reload()
  }, [plantId, reload])

  const updateEntry = useCallback(async (id: string, input: EntryInput, replacePhotos: boolean) => {
    await repoUpdate(id, { date: input.date, note: input.note, tags: input.tags, weatherSnapshot: input.weatherSnapshot })
    if (replacePhotos) {
      const old = await listPhotosByOwner(id)
      for (const p of old) await softDeletePhoto(p.id)
      if (input.photos?.length) await savePhotos(id, input.photos)
    }
    await reload()
  }, [reload])

  const deleteEntry = useCallback(async (id: string) => {
    const photos = await listPhotosByOwner(id)
    for (const p of photos) await softDeletePhoto(p.id)
    await softDeleteEntry(id)
    await reload()
  }, [reload])

  return { entries, loaded, addEntry, updateEntry, deleteEntry }
}
```

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(journal): usePlantJournal 훅(일지 CRUD+사진 오케스트레이션)`

---

### Task 7: WorkTypeChips (태그 다중선택)

**Files:**
- Create: `src/journal/WorkTypeChips.tsx`, `src/journal/WorkTypeChips.css`
- Test: `src/journal/WorkTypeChips.test.tsx`

**Interfaces:**
- Consumes: `WORK_TYPES`(workType.ts)
- Produces: `<WorkTypeChips selected={string[]} onToggle={(value: string) => void} />` — 8개 토글 버튼, 선택 시 `aria-pressed=true` + `chip--on`

- [ ] **Step 1: 실패 테스트**

```tsx
// src/journal/WorkTypeChips.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import WorkTypeChips from './WorkTypeChips'

describe('WorkTypeChips', () => {
  it('8개 칩, 선택된 것만 aria-pressed', () => {
    render(<WorkTypeChips selected={['water']} onToggle={() => {}} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(8)
    expect(screen.getByRole('button', { name: '물주기' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '비료' })).toHaveAttribute('aria-pressed', 'false')
  })
  it('클릭 시 onToggle(value)', () => {
    const onToggle = vi.fn()
    render(<WorkTypeChips selected={[]} onToggle={onToggle} />)
    screen.getByRole('button', { name: '가지치기' }).click()
    expect(onToggle).toHaveBeenCalledWith('prune')
  })
})
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현**

```tsx
// src/journal/WorkTypeChips.tsx
import { WORK_TYPES } from './workType'
import './WorkTypeChips.css'

interface Props {
  selected: string[]
  onToggle: (value: string) => void
}

export default function WorkTypeChips({ selected, onToggle }: Props) {
  return (
    <div className="worktype-chips" role="group" aria-label="작업 종류">
      {WORK_TYPES.map((w) => {
        const on = selected.includes(w.value)
        return (
          <button
            key={w.value}
            type="button"
            className={on ? 'worktype-chip worktype-chip--on' : 'worktype-chip'}
            aria-pressed={on}
            onClick={() => onToggle(w.value)}
          >
            {w.label}
          </button>
        )
      })}
    </div>
  )
}
```

CSS: 4열 그리드(`grid-template-columns: repeat(4, 1fr)`, gap sm). `.worktype-chip`은 ③ FilterChips 칩 스타일 차용(rounded·sage 보더·`aria-pressed`/`--on`에 forest green 배경+흰 글씨). 디자인 토큰만 사용.

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(journal): WorkTypeChips 작업태그 다중선택`

---

### Task 8: JournalEntrySheet (일지 작성/편집 모달)

**Files:**
- Create: `src/journal/JournalEntrySheet.tsx`, `src/journal/JournalEntrySheet.css`
- Test: `src/journal/JournalEntrySheet.test.tsx`

**Interfaces:**
- Consumes: `Sheet`(garden), `WorkTypeChips`(Task 7), `EntryInput`(Task 6), `captureSnapshot`(Task 3), `dateInputValue`·`parseDateInput`(Task 2), `weatherStore`(useWeather), `JournalEntry`·`WeatherSnapshot`
- Produces: `<JournalEntrySheet entry?={JournalEntry} defaultDate={number} onClose={()=>void} onSubmit={(input: EntryInput, replacePhotos: boolean) => Promise<unknown>} />`
- 동작: 날짜(`<input type=date>`), 작업태그(WorkTypeChips), 메모(textarea), 사진(file multiple, 최대 5장 미리보기·가로 스크롤), 날씨 토글("오늘 날씨 함께 기록"; `weatherStore.getSnapshot().bundle`이 있어야 활성). 저장 가능 조건 `canSave = tags.length>0 || note.trim() || photos.length>0`. 편집 모드(entry 있음)는 초기값 채움; 사진을 새로 고르면 `replacePhotos=true`(가이드 문구 표시). 날씨 토글 ON이고 bundle 있으면 `captureSnapshot(bundle, Date.now())`, 편집 시 기존 유지 fallback.

- [ ] **Step 1: 실패 테스트**

```tsx
// src/journal/JournalEntrySheet.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import JournalEntrySheet from './JournalEntrySheet'

beforeEach(() => { vi.restoreAllMocks() })

describe('JournalEntrySheet', () => {
  it('빈 입력이면 저장 비활성, 메모를 쓰면 활성', () => {
    render(<JournalEntrySheet defaultDate={0} onClose={() => {}} onSubmit={vi.fn()} />)
    const save = screen.getByRole('button', { name: '저장' })
    expect(save).toBeDisabled()
    fireEvent.change(screen.getByLabelText('메모'), { target: { value: '새 잎이 났다' } })
    expect(save).toBeEnabled()
  })
  it('태그 선택만으로도 저장 가능, onSubmit에 input 전달', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<JournalEntrySheet defaultDate={123} onClose={() => {}} onSubmit={onSubmit} />)
    screen.getByRole('button', { name: '물주기' }).click()
    screen.getByRole('button', { name: '저장' }).click()
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const [input, replacePhotos] = onSubmit.mock.calls[0]
    expect(input.tags).toEqual(['water'])
    expect(replacePhotos).toBe(false)
  })
})
```
(weatherStore는 모듈 싱글톤이라 기본 bundle=null → 날씨 토글 비활성 상태로 렌더된다. 토글 활성 케이스는 브라우저 검증에서 확인.)

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현** — `Sheet`로 감싸고 위 동작 구현. 핵심 골격:

```tsx
// src/journal/JournalEntrySheet.tsx (핵심 구조)
import { useEffect, useState } from 'react'
import Sheet from '../garden/Sheet'
import WorkTypeChips from './WorkTypeChips'
import { weatherStore } from '../weather/useWeather'
import { captureSnapshot } from './weatherSnapshot'
import { dateInputValue, parseDateInput } from './format'
import type { EntryInput } from './usePlantJournal'
import type { JournalEntry } from '../data/types'
import './JournalEntrySheet.css'

interface Props {
  entry?: JournalEntry
  defaultDate: number
  onClose: () => void
  onSubmit: (input: EntryInput, replacePhotos: boolean) => Promise<unknown>
}

export default function JournalEntrySheet({ entry, defaultDate, onClose, onSubmit }: Props) {
  const [dateStr, setDateStr] = useState(dateInputValue(entry?.date ?? defaultDate))
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [note, setNote] = useState(entry?.note ?? '')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [recordWeather, setRecordWeather] = useState<boolean>(!!entry?.weatherSnapshot)

  const bundle = weatherStore.getSnapshot().bundle
  const photosTouched = photos.length > 0
  const canSave = tags.length > 0 || note.trim().length > 0 || photosTouched || (!!entry && !!entry.note)

  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews])

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 5)
    setPhotos(files)
    setPreviews((prev) => { prev.forEach((u) => URL.revokeObjectURL(u)); return files.map((f) => URL.createObjectURL(f)) })
  }

  function toggleTag(v: string) {
    setTags((t) => (t.includes(v) ? t.filter((x) => x !== v) : [...t, v]))
  }

  async function save() {
    const weatherSnapshot = recordWeather
      ? (bundle ? captureSnapshot(bundle, Date.now()) : entry?.weatherSnapshot)
      : undefined
    const input: EntryInput = {
      date: parseDateInput(dateStr), note: note.trim(), tags, weatherSnapshot,
      photos: photosTouched ? photos : undefined,
    }
    await onSubmit(input, photosTouched)
    onClose()
  }

  return (
    <Sheet title={entry ? '일지 편집' : '일지 작성'} onClose={onClose} onSave={save} canSave={canSave}>
      <label className="field"><span>날짜</span>
        <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} /></label>
      <div className="field"><span>작업</span><WorkTypeChips selected={tags} onToggle={toggleTag} /></div>
      <label className="field"><span>메모</span>
        <textarea aria-label="메모" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="오늘의 기록" /></label>
      <label className="field"><span>사진</span>
        <input type="file" accept="image/*" multiple onChange={onPick} /></label>
      {entry && photosTouched && <p className="journal-sheet__hint">사진을 다시 고르면 기존 사진이 교체됩니다.</p>}
      {previews.length > 0 && (
        <div className="journal-sheet__previews">
          {previews.map((u, i) => <img key={i} src={u} alt={`사진 ${i + 1}`} />)}
        </div>
      )}
      <label className="field field--row">
        <span>오늘 날씨 함께 기록</span>
        <input type="checkbox" checked={recordWeather} disabled={!bundle && !entry?.weatherSnapshot}
          onChange={(e) => setRecordWeather(e.target.checked)} />
      </label>
    </Sheet>
  )
}
```

CSS: `field`/`field--row` 레이아웃(③ AddPlantSheet.css 차용), `.journal-sheet__previews` 가로 스크롤 썸네일, `.journal-sheet__hint` muted 캡션.

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(journal): JournalEntrySheet 일지 작성·편집 모달`

---

### Task 9: JournalEntryCard (일지 카드)

**Files:**
- Create: `src/journal/JournalEntryCard.tsx`, `src/journal/JournalEntryCard.css`
- Test: `src/journal/JournalEntryCard.test.tsx`

**Interfaces:**
- Consumes: `JournalEntry`, `journalDateLabel`(Task 2), `sortWorkTypes`·`workLabel`(Task 1), `snapshotSummary`(Task 3), `listPhotosByOwner`(Task 5)
- Produces: `<JournalEntryCard entry={JournalEntry} onEdit={()=>void} onDelete={()=>void} />` — 날짜·날씨 배지(있으면)·태그 칩·메모·사진 썸네일(가로 스크롤, `listPhotosByOwner(entry.id)`로 비동기 로드+objectURL). 카드 탭=편집, "삭제" 버튼=삭제.

- [ ] **Step 1: 실패 테스트** (사진 로드는 mock — jsdom blob 한계 회피)

```tsx
// src/journal/JournalEntryCard.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import JournalEntryCard from './JournalEntryCard'
import type { JournalEntry } from '../data/types'

vi.mock('../data/photos', () => ({ listPhotosByOwner: vi.fn().mockResolvedValue([]) }))

const entry: JournalEntry = {
  id: 'e1', updatedAt: 0, deleted: false, plantId: 'p1',
  date: Date.parse('2026-06-20T15:00:00Z'), note: '새 잎', tags: ['water', 'observe'],
  weatherSnapshot: { tempC: 21, feelsLikeC: 20, humidity: 60, sky: 'cloudy', precipType: 'none', airGrade: 2, capturedAt: 0 },
}

describe('JournalEntryCard', () => {
  it('날짜·태그·메모·날씨 요약을 보여준다', () => {
    render(<JournalEntryCard entry={entry} onEdit={() => {}} onDelete={() => {}} />)
    expect(screen.getByText('6월 21일')).toBeInTheDocument()
    expect(screen.getByText('물주기')).toBeInTheDocument()
    expect(screen.getByText('관찰')).toBeInTheDocument()
    expect(screen.getByText('새 잎')).toBeInTheDocument()
    expect(screen.getByText('21° 흐림 · 미세먼지 보통')).toBeInTheDocument()
  })
  it('삭제 버튼이 onDelete를 부른다', () => {
    const onDelete = vi.fn()
    render(<JournalEntryCard entry={entry} onEdit={() => {}} onDelete={onDelete} />)
    screen.getByRole('button', { name: '일지 삭제' }).click()
    expect(onDelete).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현** — 날짜/날씨/태그/메모 + 사진 썸네일(useEffect로 listPhotosByOwner→objectURL, cleanup revoke). 태그는 `sortWorkTypes(entry.tags).map(workLabel)`. 날씨 배지는 `entry.weatherSnapshot && snapshotSummary(...)`.
- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(journal): JournalEntryCard 일지 카드(날짜·날씨·태그·사진)`

---

### Task 10: gardenStore 편집/보관/삭제 액션

**Files:**
- Modify: `src/garden/store.ts`, `src/garden/useGarden.ts`
- Modify(test): `src/garden/store.test.ts`

**Interfaces:**
- Produces (store.ts): `GardenRepo`에 `archivePlant(id): Promise<void>`·`softDeletePlant(id): Promise<void>` 추가(`updatePlant` 기존). `EditPlantInput { name: string; areaId: string; lightRequirement?: Plant['lightRequirement']; datePlanted?: number; note?: string; photo?: Blob }`. `GardenStore`에 `editPlant(id, input): Promise<void>`·`archivePlant(id): Promise<void>`·`deletePlant(id): Promise<void>` 추가.
- 동작: `editPlant` = `repo.updatePlant(id, {name,areaId,lightRequirement,datePlanted,note})` → photo 있으면 `repo.putPhoto({ownerId:id, blob})` 후 `repo.updatePlant(id,{photoId})` → reload. `archivePlant`/`deletePlant` = repo 호출 → reload.

- [ ] **Step 1: 실패 테스트**(store.test.ts에 fake repo로 추가)

```ts
it('editPlant: 필드 갱신 후 reload로 목록 반영', async () => {
  const repo = makeFakeRepo() // 기존 테스트 헬퍼; archivePlant/softDeletePlant 추가됨
  const store = createGardenStore(repo)
  await store.load()
  const p = await store.addPlant({ areaId: 'a1', name: '바질' })
  await store.editPlant(p.id, { name: '타임', areaId: 'a1' })
  expect(store.getSnapshot().plants.find((x) => x.id === p.id)?.name).toBe('타임')
})
it('deletePlant: 목록서 사라진다', async () => {
  const repo = makeFakeRepo()
  const store = createGardenStore(repo)
  await store.load()
  const p = await store.addPlant({ areaId: 'a1', name: '바질' })
  await store.deletePlant(p.id)
  expect(store.getSnapshot().plants.find((x) => x.id === p.id)).toBeUndefined()
})
```
(기존 fake repo 헬퍼에 `archivePlant`·`softDeletePlant` 구현 추가 — soft delete는 tombstone 후 `listPlants`가 제외.)

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현** — store.ts에 인터페이스·액션 추가:

```ts
export interface EditPlantInput {
  name: string
  areaId: string
  lightRequirement?: Plant['lightRequirement']
  datePlanted?: number
  note?: string
  photo?: Blob
}
// GardenRepo += archivePlant, softDeletePlant
// GardenStore += editPlant, archivePlant, deletePlant

async editPlant(id, input) {
  await repo.updatePlant(id, {
    name: input.name, areaId: input.areaId, lightRequirement: input.lightRequirement,
    datePlanted: input.datePlanted, note: input.note,
  })
  if (input.photo) {
    const photo = await repo.putPhoto({ ownerId: id, blob: input.photo })
    await repo.updatePlant(id, { photoId: photo.id })
  }
  await reload()
},
async archivePlant(id) { await repo.archivePlant(id); await reload() },
async deletePlant(id) { await repo.softDeletePlant(id); await reload() },
```

useGarden.ts: `archivePlant`·`softDeletePlant`(data/plants) import해 `createGardenStore`에 주입, `useGarden` 반환에 `editPlant`·`archivePlant`·`deletePlant` 추가.

- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(garden): 식물 편집·보관·삭제 store 액션`

---

### Task 11: EditPlantSheet (식물 편집/보관/삭제 모달)

**Files:**
- Create: `src/garden/EditPlantSheet.tsx`, `src/garden/EditPlantSheet.css`
- Test: `src/garden/EditPlantSheet.test.tsx`

**Interfaces:**
- Consumes: `Sheet`, `LIGHT_OPTIONS`, `EditPlantInput`(Task 10), `dateInputValue`·`parseDateInput`(Task 2), `Plant`·`Area`
- Produces: `<EditPlantSheet plant={Plant} areas={Area[]} onClose={()=>void} onSubmit={(input: EditPlantInput)=>Promise<unknown>} onArchive={()=>Promise<unknown>} onDelete={()=>Promise<unknown>} />`
- 동작: AddPlantSheet 폼(이름·영역·광·사진) + **메모(textarea)** + **심은 날짜**(`<input type=date>`, 선택) 초기값 채움. 하단 위험구역: "보관"(바로 실행) · "삭제"(2단계 확인 — 클릭하면 "정말 삭제할까요? 일지·사진까지 사라집니다" 표시 후 확인 버튼). `canSave = name.trim() && areaId`.

- [ ] **Step 1: 실패 테스트**

```tsx
// src/garden/EditPlantSheet.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EditPlantSheet from './EditPlantSheet'
import type { Plant, Area } from '../data/types'

const area: Area = { id: 'a1', updatedAt: 0, deleted: false, name: '베란다', sortOrder: 0 }
const plant: Plant = { id: 'p1', updatedAt: 0, deleted: false, areaId: 'a1', name: '바질', isArchived: false, sortOrder: 0 }

describe('EditPlantSheet', () => {
  it('기존 값으로 초기화하고 수정해 저장', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<EditPlantSheet plant={plant} areas={[area]} onClose={() => {}} onSubmit={onSubmit} onArchive={vi.fn()} onDelete={vi.fn()} />)
    const name = screen.getByLabelText('이름') as HTMLInputElement
    expect(name.value).toBe('바질')
    fireEvent.change(name, { target: { value: '타임' } })
    screen.getByRole('button', { name: '저장' }).click()
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: '타임', areaId: 'a1' })
  })
  it('삭제는 2단계 확인을 거친다', () => {
    const onDelete = vi.fn()
    render(<EditPlantSheet plant={plant} areas={[area]} onClose={() => {}} onSubmit={vi.fn()} onArchive={vi.fn()} onDelete={onDelete} />)
    screen.getByRole('button', { name: '삭제' }).click()
    expect(onDelete).not.toHaveBeenCalled() // 아직
    screen.getByRole('button', { name: '정말 삭제' }).click()
    expect(onDelete).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현** — AddPlantSheet 복제 + 메모/심은날짜 필드 + 위험구역(보관/삭제 2단계). `label`에 `이름` 텍스트가 `getByLabelText('이름')`로 잡히도록 `<span>이름</span>` 구조 유지.
- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(garden): EditPlantSheet 식물 편집·보관·삭제 모달`

---

### Task 12: PlantDetail 화면

**Files:**
- Create: `src/garden/PlantDetail.tsx`, `src/garden/PlantDetail.css`
- Test: `src/garden/PlantDetail.test.tsx`

**Interfaces:**
- Consumes: `useParams`·`useNavigate`·`Link`(react-router), `useGarden`(plant/areas + editPlant·archivePlant·deletePlant), `usePlantJournal`(Task 6), `PlantPhoto`·`lightLabel`, `JournalEntryCard`(Task 9), `JournalEntrySheet`(Task 8), `EditPlantSheet`(Task 11), `journalDateLabel`(Task 2), `todayKSTDate`/`Date.now`
- Produces: `<PlantDetail />`(라우트 컴포넌트; `useParams().id`로 plant 식별)
- 레이아웃(스크롤 VStack): 뒤로가기 `Link to=/garden` + 편집(연필) → 히어로 `PlantPhoto`(큰 사이즈) → 제목(이름)·정보칩(광요구도·심은날·영역명) → "재배일지" 섹션 헤더 + "+" 추가 버튼 → `usePlantJournal(id).entries`를 `JournalEntryCard`로 역순 렌더(빈 상태 "첫 일지를 남겨보세요"). 일지 추가/편집은 `JournalEntrySheet`, 식물 편집/보관/삭제는 `EditPlantSheet`(보관/삭제 후 `navigate('/garden')`). plant 못 찾으면(미로드/보관/삭제) 로딩 또는 "식물을 찾을 수 없어요"(SpeciesDetail not-found 패턴).

- [ ] **Step 1: 실패 테스트** — 라우터로 감싸 렌더, 빈 일지/정보칩 확인:

```tsx
// src/garden/PlantDetail.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { db } from '../data/db'
import { createPlant } from '../data/plants'
import { createArea } from '../data/areas'
import { gardenStore } from '../garden/useGarden'
import PlantDetail from './PlantDetail'

vi.mock('./PlantPhoto', () => ({ default: () => <div data-testid="photo" /> }))

beforeEach(async () => {
  await db.plants.clear(); await db.areas.clear(); await db.journalEntries.clear()
})

async function renderAt(plantId: string) {
  await gardenStore.load()
  return render(
    <MemoryRouter initialEntries={[`/plant/${plantId}`]}>
      <Routes><Route path="/plant/:id" element={<PlantDetail />} /><Route path="/garden" element={<div>정원</div>} /></Routes>
    </MemoryRouter>,
  )
}

describe('PlantDetail', () => {
  it('식물 이름·영역과 빈 일지 안내를 보여준다', async () => {
    const area = await createArea('베란다', 0)
    const plant = await createPlant({ areaId: area.id, name: '바질' })
    await renderAt(plant.id)
    await waitFor(() => expect(screen.getByRole('heading', { name: '바질' })).toBeInTheDocument())
    expect(screen.getByText('베란다')).toBeInTheDocument()
    expect(screen.getByText('첫 일지를 남겨보세요')).toBeInTheDocument()
  })
})
```
(주: `gardenStore`는 모듈 싱글톤이라 테스트가 직접 `load()`해 IndexedDB와 동기화. `Date.now()` 직접 호출은 리포지토리 내부라 테스트에 영향 없음.)

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현** — 위 레이아웃. plant = `useGarden().plants.find(p => p.id === id)`, area명 = `areas.find`. 모달 상태(편집/일지작성/일지편집)는 로컬 useState. 일지 추가 시 `addEntry`, 편집 시 `updateEntry(id, input, replacePhotos)`, 삭제 시 `deleteEntry`.
- [ ] **Step 4: 통과 확인** → PASS
- [ ] **Step 5: 커밋** — `feat(garden): PlantDetail 식물 상세 화면(히어로·정보칩·일지 타임라인)`

---

### Task 13: 네비 연결 (카드 → 상세 라우트)

**Files:**
- Modify: `src/garden/PlantCard.tsx`
- Create: `src/routes/PlantDetailRoute.tsx`
- Modify: `src/App.tsx`
- Modify(test): `src/garden/PlantCard.test.tsx`

**Interfaces:**
- `PlantCard`를 `<Link to={`/plant/${plant.id}`}>`로 감쌈(기존 표시 구조 유지, 카드 스타일 보존). `PlantDetailRoute` = `<PlantDetail/>` 래퍼. `App`에 `<Route path="/plant/:id" element={<PlantDetailRoute />} />`(`/garden`과 `/codex` 사이).

- [ ] **Step 1: 실패 테스트**(PlantCard가 링크가 되는지)

```tsx
// PlantCard.test.tsx에 추가
import { MemoryRouter } from 'react-router-dom'
it('카드는 상세로 가는 링크다', () => {
  render(<MemoryRouter><PlantCard plant={plant} /></MemoryRouter>)
  expect(screen.getByRole('link')).toHaveAttribute('href', '#/plant/p1') // HashRouter면 #/, MemoryRouter면 /plant/p1
})
```
(라우터 종류에 맞게 단언 조정 — MemoryRouter에서는 `/plant/p1`. 기존 PlantCard.test의 렌더를 `MemoryRouter`로 감싸도록 수정.)

- [ ] **Step 2: 실패 확인** → FAIL
- [ ] **Step 3: 구현** — PlantCard를 Link로 감싸고(`className="plant-card-link"`, text-decoration none), PlantDetailRoute 생성, App에 라우트 추가.
- [ ] **Step 4: 통과 확인 + 전체 빌드/테스트** — `npm run build` 클린 + `npm test -- --run` 전체 PASS
- [ ] **Step 5: 커밋** — `feat(garden): 식물 카드 → 상세 라우트 연결`

---

### Task 14: 브라우저 실검증 (테스트 아님 — 수동 절차)

**Files:** 없음(검증만). preview = 워크스페이스 루트 `.claude/launch.json`의 `garden-web`(5173), URL `localhost:5173/ordinary-garden-web/#/garden`.

단위 테스트가 못 잡는 것을 preview로 확인(③ 교훈: `preview_eval` 네이티브 `.click()`, controlled input은 native value setter + input/change 이벤트). 콘솔 에러 0 확인.

- [ ] 식물 카드 클릭 → `/plant/:id` 진입(히어로·정보칩 표시)
- [ ] 일지 "+" → 작성 시트: 날짜 기본 오늘, 태그 다중선택, 메모, 사진 다중 미리보기, 날씨 토글(bundle 로드 시 활성)
- [ ] 일지 저장 → 타임라인 최신 위에 카드(날짜·날씨 요약·태그·메모·썸네일)
- [ ] F5 후 IndexedDB에서 일지·사진 복원
- [ ] 일지 카드 탭 → 편집(사진 교체 경고), 삭제 → 카드 사라짐
- [ ] 편집(연필) → 이름·영역·광·심은날·메모 수정 저장 → 정보칩 갱신
- [ ] 보관 → `/garden`으로, 목록서 사라짐 / 삭제(2단계 확인) → `/garden`으로, 목록서 사라짐
- [ ] 라이트/다크 모드 모두 확인
- [ ] 통과하면 `feature/plant-detail` → main FF 머지(①②③ 절차), feature 브랜치 삭제, 메모리(webapp.md ④ 완료) 업데이트

---

## Self-Review

**1. 스펙 커버리지:**
- `/plant/:id` 라우트 → Task 13 ✓
- 카드 네비 → Task 13 ✓
- journalEntries·journalPhotos(다중 사진) → Task 4·5·6 ✓
- WorkType enum(SwiftUI 8종 확정) → Task 1 ✓
- 그날 날씨 박제(weatherSnapshot) → Task 3·8 ✓
- 일지 타임라인(역순) → Task 4(정렬)·9(카드)·12(섹션) ✓
- 식물 편집/보관/삭제(리포지토리 기존 활용) → Task 10·11·12 ✓
- note 편집 보완(SwiftUI 미구현) → Task 11 ✓

**2. Placeholder 스캔:** 코드 step은 모두 실제 코드/테스트 포함. CSS는 "기존 토큰·③ 스타일 차용" 명시(구현자가 기존 `*.css` 패턴 따름) — 디자인 디테일은 구현 자유도이되 신규 색/값 도입 금지(Global Constraints).

**3. 타입 일관성:**
- `EntryInput`(usePlantJournal, Task 6) ↔ JournalEntrySheet onSubmit(Task 8) ↔ 사용처 일치 ✓
- `EditPlantInput`(store, Task 10) ↔ EditPlantSheet onSubmit(Task 11) 일치 ✓
- `WeatherSnapshot`(data/types, Task 3) — captureSnapshot 반환·JournalEntry 필드·snapshotSummary 인자 일치 ✓
- `listPhotosByOwner`(Task 5) — usePlantJournal·JournalEntryCard에서 동일 시그니처 사용 ✓
- `updateEntry`: 리포지토리(journal.ts) `updateEntry(id, patch)` vs 훅의 `updateEntry(id, input, replacePhotos)` — 훅은 `repoUpdate`로 alias 처리(Task 6 import 별칭) ✓

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-06-21-04-plant-detail.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — 태스크마다 fresh subagent 디스패치, 태스크 사이 리뷰, 빠른 반복(①②③과 동일).

**2. Inline Execution** — 이 세션에서 executing-plans로 체크포인트 단위 일괄 실행.

**Which approach?**
