# ⑤ 케어 엔진 + "오늘 할 일" 설계 (2026-06-21)

웹앱 구현 5단계. 식물별 케어 규칙(물주기·비료·분갈이)을 주기로 관리하고, "오늘 할 일"로
오늘 due인 케어를 모아 완료·스누즈하며, 물주기엔 날씨 조언을 곁들인다.

SwiftUI 원본(`ordinary-garden`, 동결)에 케어 엔진이 완전히 구현돼 있다. ①~④와 동일하게
**원본을 SoT로 1:1 이식**한다. 아래 동작 규칙은 모두 원본에서 추출한 것이다.

## 1. 목표·범위

- **케어 규칙 CRUD** — 식물 상세에서 종류·주기·날씨연동을 설정/편집/삭제
- **오늘 할 일** — 오늘 화면(`/today`)에서 오늘 due인 케어를 작업종류별로 모아 완료/스누즈
- **예정** — 14일 이내 다가오는 케어 목록
- **날씨 조언** — 물주기 규칙(weatherAware)에 비 예보·폭염 안내 칩

## 2. 결정 사항 (확정)

| 결정 | 선택 | 근거 |
|---|---|---|
| 이식 충실도 | 원본 1:1 (오늘 할 일 + 식물 상세 케어 섹션 전부) | ①~④ 일관, 원본이 SoT |
| 완료 ↔ 일지 | **분리** — 완료는 주기 재계산만, 일지 자동생성 없음 | 원본 동작 그대로 (사용자 확인) |
| 알림 | **범위 밖** — in-app "오늘 할 일"만 | iOS PWA 푸시 제약, 원본도 알림 없음 |
| 도감 주기 시드 | **범위 밖** — 하드코딩 기본값(3·14·365)만 | 식물↔도감 연결고리·구조화 데이터 없음 |
| 신규 의존성 | 0 | ①~④ 일관 |

## 3. 아키텍처

`src/care/` 신규 모듈 + `src/data/care.ts` 리포지토리. 의존 방향은 ②날씨·③정원과 동일:

```
순수 로직(scheduler·weatherAdvisor·selectors·careType)
  → 리포지토리(data/care.ts, Dexie)
    → store(createCareStore) → useCare(모듈 싱글톤 + useSyncExternalStore)
      → UI(오늘 할 일 / 식물 상세 케어 섹션)
```

- 순수 로직은 I/O·시계 무관(asOf·now 인자 주입) → 단위 테스트 용이
- store는 `gardenStore` 패턴 미러(뮤테이션마다 reload→통지, snapshot 안정참조)
- 식물·영역 데이터는 `gardenStore`에서 가져와 selector에서 조인(careStore는 규칙만 소유, 관심사 분리)

## 4. 데이터 계층

### 4.1 타입 보강 (`src/data/types.ts`)

`CareRule`은 ①에서 정의됨. `createdAt`만 추가(규칙 정렬용 — 원본은 createdAt 오름차순 표시).

```ts
export interface CareRule extends BaseRecord {
  plantId: string
  careType: CareType          // 'water' | 'fertilize' | 'repot' (기정의)
  intervalDays: number
  lastCompletedAt?: number
  nextDueAt: number           // epoch ms, KST 자정 정규화
  weatherAware: boolean
  createdAt: number           // 신규 — 규칙 정렬
}
```

Dexie 스키마(`db.ts`)는 변경 없음 — `careRules: 'id, plantId, nextDueAt, updatedAt'` 그대로.
`createdAt`은 인덱스 불필요(식물당 규칙 수 적음, 메모리 정렬). 필드 추가는 Dexie 마이그레이션 불요.

### 4.2 리포지토리 (`src/data/care.ts` 신규, `plants.ts` 패턴)

```ts
createRule(fields: NewCareRuleFields, now = Date.now()): Promise<CareRule>
  // nextDueAt = startOfDayKST(now) (오늘 due로 시작), lastCompletedAt 없음, createdAt = now
listRulesByPlant(plantId: string): Promise<CareRule[]>   // !deleted, createdAt 오름차순
listActiveRules(): Promise<CareRule[]>                    // 전체 !deleted (store가 보유)
updateRule(id: string, patch: CareRulePatch, now = Date.now()): Promise<CareRule>
softDeleteRule(id: string, now = Date.now()): Promise<void>
```

- `NewCareRuleFields` = `{ plantId, careType, intervalDays, weatherAware }`
- `CareRulePatch` = 부분 갱신(`careType`·`intervalDays`·`weatherAware`·`lastCompletedAt`·`nextDueAt`)
- 시계는 함수 인자 주입(기본 `Date.now()`). ⑥에서 plants/journal과 통일 예정(현 패턴 일관)

## 5. 순수 로직 (`src/care/`)

### 5.1 `careType.ts` — 케어 종류 메타 (`workType.ts` 패턴)

```ts
export type { CareType } from '../data/types'  // 'water' | 'fertilize' | 'repot'

export const CARE_TYPES: readonly { value: CareType; label: string; defaultIntervalDays: number }[] = [
  { value: 'water',     label: '물주기', defaultIntervalDays: 3 },
  { value: 'fertilize', label: '비료',   defaultIntervalDays: 14 },
  { value: 'repot',     label: '분갈이', defaultIntervalDays: 365 },
]
```

- 정의 순서 = "오늘 할 일" 그룹 정렬 순서(원본 `CareType.allCases`)
- `careLabel(value)`·`defaultIntervalDays(value)` 헬퍼
- 아이콘은 인라인 SVG(`weather/icons.tsx` 패턴): 물방울(water)·잎(fertilize)·순환화살표(repot) + 비구름(날씨칩)

### 5.2 `scheduler.ts` — due 날짜 계산 (순수, KST)

```ts
startOfDayKST(ms): number     // 그 시각의 KST 자정 epoch. format.ts 규약 재사용:
                              //   k = new Date(ms + 9h); Date.UTC(k.UTC년,월,일) - 9h
nextDue(completedMs, intervalDays): number   // startOfDayKST(completed) + intervalDays*86400000
dueDescription(nextDueAt | undefined, asOfMs = Date.now()): string
  // days = (startOfDayKST(nextDueAt) - startOfDayKST(asOf)) / 86400000
  //   undefined → "—" / 0 → "오늘" / <0 → "n일 지남" / >0 → "D-n"
```

한국은 DST 없음 → `+일수*86400000` 안전. `format.ts`의 KST 규약(`Date.UTC(y,m,d)-9h`)과 동일.

### 5.3 `weatherAdvisor.ts` — 물주기 날씨 조언 (순수)

```ts
export type CareAdvice = 'none' | 'holdForRain' | 'heat'
export function adviceMessage(a: CareAdvice): string | null
  // holdForRain → "비 예보 — 오늘 물주기는 건너뛰어도 돼요"
  // heat        → "더운 날 — 물을 평소보다 자주 주세요"
  // none        → null

export function advice(careType, weatherAware, bundle: WeatherBundle | null): CareAdvice
```

규칙(원본 임계값 그대로):
- `weatherAware && careType==='water' && bundle` 아니면 → `none`
- `todayPop = bundle.daily[0]?.pop ?? 0`; `next24Precip = bundle.hourly.slice(0,24)`의 `precipMm` 합
- `todayPop >= 60 || next24Precip >= 5.0` → `holdForRain`
- `bundle.daily[0]?.maxC >= 33` → `heat`
- 그 외 → `none`

웹 weather 계약 확인: `DailyPoint.pop`·`maxC`, `HourlyPoint.precipMm` 모두 존재 ✓.

### 5.4 `selectors.ts` — 오늘/예정 derive (순수)

식물·영역과 조인해 표시용 항목을 만든다. `plants`·`areas`는 인자(gardenStore 소유).

```ts
interface CareTaskItem { rule: CareRule; plant: Plant; areaName?: string }

dueGroups(rules, plants, asOfMs = Date.now()): { type: CareType; items: CareTaskItem[] }[]
  // due = nextDueAt < startOfDayKST(asOf) + 86400000 (= 내일 자정 미만)
  // 미보관 식물(plant 존재 && !isArchived)만, deleted 규칙 제외
  // CARE_TYPES 순서로 그룹화, 빈 그룹 제외, 그룹 내 nextDueAt 오름차순

upcoming(rules, plants, asOfMs = Date.now(), within = 14): CareTaskItem[]
  // 내일 자정 <= nextDueAt < (startOfDayKST(asOf) + (within+1)*86400000)
  // 미보관 식물만, nextDueAt 오름차순
```

## 6. Store (`src/care/`)

### 6.1 `store.ts` — `createCareStore(repo)` (`gardenStore` 미러)

```ts
interface CareState { rules: CareRule[]; loaded: boolean }   // 전체 !deleted 규칙 메모리 보유

interface CareStore {
  getSnapshot(): CareState
  subscribe(listener): () => void
  load(): Promise<void>
  addRule(input: { plantId; careType; intervalDays; weatherAware }): Promise<CareRule>
  updateRule(id, patch: { careType; intervalDays; weatherAware }): Promise<void>
  deleteRule(id): Promise<void>
  complete(id, asOf = Date.now()): Promise<void>
  snooze(id, by = 1, asOf = Date.now()): Promise<void>
}
```

동작 규칙(원본 추출):
- **addRule** → `repo.createRule`(nextDueAt = 오늘 KST 자정, lastCompletedAt 없음)
- **updateRule** → careType·intervalDays·weatherAware만 갱신. 물주기 아니면 weatherAware=false 강제(시트에서 처리)
- **complete** → `lastCompletedAt = asOf`(raw), `nextDueAt = nextDue(asOf, intervalDays)`
- **snooze** → `base = max(nextDueAt, startOfDayKST(asOf))`; `nextDueAt = base + by*86400000`
  (이미 지났거나 오늘인 것도 최소 "내일 이후"가 됨 = 오늘 목록에서 빠짐)
- 모든 뮤테이션 후 `reload()`(listActiveRules) → `set()` → listeners 통지

### 6.2 `useCare.ts` — 모듈 싱글톤 + `useSyncExternalStore` (`useGarden` 미러)

`ensureStarted`로 1회 자동 로드. snapshot 안정참조(무한루프 방지). 뮤테이션 시 store 통지로
자동 리렌더 — 원본의 `careRefreshID` 수동 무효화 불필요.

## 7. UI — 오늘 할 일 (`TodayRoute` 확장)

현재 `TodayRoute` = `<h1>오늘</h1>` + `<WeatherSummaryCard/>`. 그 아래 `CareTodaySection` 추가.

- **`SegmentedToggle`** (`src/ui/`, 신규 소형): 2택 토글(오늘/예정), `aria-pressed`
- **`CareTodaySection`**: 헤더("오늘 할 일" + SegmentedToggle) + 오늘/예정 분기
  - `useCare()` + `useGarden()` 구독 → `dueGroups`/`upcoming`(selector)
  - **오늘**: 그룹별 `CareTaskCard`. 비었으면 "오늘 할 일이 없어요"
  - **예정**: `UpcomingList`(카드 내 행: 아이콘·이름·타입·D-day). 비었으면 "예정된 케어가 없어요"
- **`CareTaskCard`**: 헤더(타입 아이콘·라벨·개수) + 물주기면 날씨 조언 칩 + 행들(`CareTaskRow`)
  - 날씨 칩: 그룹 내 weatherAware 규칙이 하나라도 있으면 `advice(...)` 결과 표시(카드 단위, 단일 집 위치라 예보 공유)
- **`CareTaskRow`**: 썸네일(`PlantPhoto`)·식물명·영역명 + 스누즈 버튼 + 원형 체크
  - 체크 = 즉시 `complete`(되돌리기 없음, 토글 상태 미보관) → 목록에서 빠짐
  - 스누즈 = `snooze(id)` (1일)

## 8. UI — 식물 상세 케어 섹션 (`PlantDetail` 확장)

정보칩(`head`)과 재배일지 섹션 사이에 `CareSection` 삽입(원본 careSection→journalSection 순서).
모달 상태는 일지의 `journalOpen: false|null|JournalEntry` 패턴 미러: `careOpen: false|null|CareRule`.

- **`CareSection(plantId)`**: 헤더("케어" + 추가버튼) + 규칙 행(`CareRuleRow`, 탭→편집)
  - `listRulesByPlant`는 careStore.rules에서 필터(plantId·!deleted·createdAt순)
  - 비었으면 "케어 일정을 추가해보세요"
- **`CareRuleRow`**: 아이콘·라벨·(weatherAware면 비구름 배지)·"n일마다" + `dueDescription` D-day
- **`CareRuleSheet`** (`Sheet` 재사용): 추가/편집
  - 종류 3택(세그먼트형 단일 선택) / 주기(숫자 입력 `<input type="number">`, 1~365) / 물주기일 때만 날씨토글("비 오면 물주기 미루기 제안") + 설명 / 편집 모드면 삭제 버튼
  - **추가 모드**에서 종류 변경 시 `defaultIntervalDays`로 주기 시드
  - 저장: 물주기 아니면 weatherAware=false. 추가→`addRule`, 편집→`updateRule`

## 9. KST·시계 처리

- 모든 자정 정규화는 `scheduler.startOfDayKST`로 통일 — `format.ts` KST 규약(`Date.UTC(y,m,d)-9h`) 재사용
- 순수 로직·repo·store 모두 `asOf`/`now` 인자 주입(기본 `Date.now()`) → 테스트 결정론 + ⑥ clock 통일 대비
- `lastCompletedAt`은 완료 시각 raw(자정 정규화 안 함). `nextDueAt`만 자정 정규화

## 10. 엣지 케이스

- **식물 보관/삭제**: 보관 식물 규칙은 due/upcoming에서 제외(selector에서 `!isArchived`). 식물 삭제(④ cascade)는 케어 규칙까지 soft-delete해야 함 → `softDeletePlantDeep`에 careRules 추가(orphan 방지)
- **지난 due(overdue)**: dueGroups에 포함(nextDueAt < 내일 자정이면 과거도 due). `CareRuleRow` D-day는 "n일 지남"
- **물주기 아닌데 weatherAware=true 저장 시도**: 시트 저장 단계에서 false 강제
- **bundle null/필드 null**: advice는 `none`(가드). pop/maxC null이면 해당 분기 skip
- **같은 식물 같은 종류 복수 규칙**: 허용(원본 제약 없음). 각각 독립 행

## 11. 테스트 계획 (TDD)

순수 로직부터 단언이 SoT가 되게 작성(①~④ 교훈: 테스트 약화 금지).

1. **`scheduler`**: startOfDayKST(KST 경계·자정), nextDue, dueDescription(오늘/D-n/지남/—)
2. **`weatherAdvisor`**: 임계값 경계(pop 59/60, precip 4.9/5.0, maxC 32/33), water 아님·weatherAware false·bundle null → none
3. **`careType`**: label·defaultIntervalDays·순서
4. **`data/care`**: createRule(오늘 due·createdAt), listRulesByPlant(정렬·deleted 제외), update/softDelete (fake-indexeddb)
5. **`selectors`**: dueGroups(그룹순·빈그룹 제외·보관 제외·overdue 포함), upcoming(범위 경계·정렬)
6. **`store`**: complete(nextDueAt 재계산)·snooze(max 기준·내일 이후)·뮤테이션 후 통지
7. **컴포넌트(RTL)**: CareTaskRow(체크→complete·스누즈), CareTaskCard(날씨칩 조건), CareRuleSheet(종류변경→시드·물주기만 토글·저장), CareSection·CareTodaySection(빈상태·분기)

## 12. 검증·통합 계획

- **subagent-driven TDD** — ①~④ 절차: 태스크별 spec+품질 2단계 리뷰 + opus 종합 리뷰(READY-TO-MERGE)
- **브라우저 실검증**(필수, 단위테스트가 못 잡는 것):
  - 규칙 추가 → 오늘 할 일 등장 → 완료 체크 → 목록서 사라짐 + 식물 상세 D-day가 다음 주기로
  - 스누즈 → 오늘서 빠지고 예정/D-day 내일로
  - 물주기 날씨칩(라이브 weather.json, weatherAware on)
  - 예정 토글 전환, 빈 상태 문구
  - **F5 후 IndexedDB 복원**, 라이트/다크, 콘솔 에러 0
  - preview = 워크스페이스 `.claude/launch.json` `garden-web`, `localhost:5173/ordinary-garden-web/#/today`
  - React19 위임 이벤트: `preview_click` 대신 `preview_eval` 네이티브 `.click()`(③ 교훈)
- **머지**: `feature/care` → main FF머지, 브랜치 삭제. 신규 의존성 0

## 13. 범위 밖 (명시)

- 푸시/로컬 알림 (iOS PWA 제약 — in-app만)
- 도감 연동 자동 주기 시드 (연결고리·구조화 데이터 필요)
- 케어 완료 → 일지 자동 기록 (결정대로 분리)
- 오늘 화면 특보 배너(②날씨 범위 — 현재 WeatherDetail에만, 케어에서 건드리지 않음)
- 케어 통계/히스토리, 커스텀 알림 시각
