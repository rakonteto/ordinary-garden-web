# 보관함 + 보관 해제 — 설계

날짜: 2026-06-22
상태: 설계 승인 대기

## 배경 / 문제

식물 수정 화면에 **보관(archive)** 버튼이 있다. 누르면 `isArchived=true`가 되어
"내 정원" 목록에서 사라진다(데이터는 보존, 삭제와 다름). 그러나 현재 웹앱에는:

- 보관된 식물을 **다시 보는 화면이 없다**(`listPlants`가 무조건 `isArchived` 제외).
- **보관 해제(unarchive) 기능이 없다**(`unarchivePlant` 미구현).
- 보관 식물 상세도 "식물을 찾을 수 없어요"로 막힘(`PlantDetail`).

결과적으로 보관은 "조용히 사라지는데 못 꺼내는" 반쪽 기능이다. 데이터는 IndexedDB와
드라이브에 살아있으니, **보관함 화면 + 되돌리기**를 추가해 기능을 완성한다.

## 목표

- 보관한 식물을 모아 보는 **보관함 화면**.
- 각 식물을 **되돌리기(보관 해제)** → 내 정원으로 복귀.
- 보관 해제도 **기존 동기화에 자동 전파**(`updatedAt` 갱신 → 레코드별 LWW).

## 설계 결정 (사용자 승인)

1. **진입점 = 내 정원 화면.** 식물 목록 아래에 "보관함 N개 보기" 줄. N=0이면 숨김.
2. **보관함 = 별도 화면**(라우트 `/archive`). 보관 식물을 단순 목록으로(영역 구분 없음).
3. **되돌리기 = 카드별 버튼.** 보관함 각 식물 카드에 "되돌리기" 버튼.
4. **보관 식물 상세는 막아둠**(현행 유지). 상세 편집·삭제는 되돌린 뒤 내 정원에서.
5. **보관 버튼은 확인 없이 즉시**(현행 유지). 보관함에서 쉽게 되돌릴 수 있으므로.

## 변경 사항

### 데이터 (`src/data/plants.ts`)
- `listArchivedPlants(): Promise<Plant[]>` — `!deleted && isArchived`, `sortOrder` 순(메모리 필터, `listPlants` 미러).
- `unarchivePlant(id, now = Date.now()): Promise<void>` — `isArchived=false` + `updatedAt=now`. 멱등(없으면 no-op).

### 스토어 (`src/garden/store.ts`, `useGarden.ts`)
- `GardenState`에 `archivedPlants: Plant[]` 추가(`EMPTY`도).
- `GardenRepo`에 `listArchivedPlants`, `unarchivePlant` 추가.
- `reload()`의 `Promise.all`에 `listArchivedPlants()` 포함 → `set({ areas, plants, archivedPlants, loaded })`.
- `unarchivePlant(id)` 액션 추가: `repo.unarchivePlant(id)` → `reload()`(내 정원·보관함 동시 갱신).
- `useGarden.ts`: import·repo 배선·반환에 `unarchivePlant` 추가.

### UI
- **`src/garden/ArchiveView.tsx`**(신규): `state.archivedPlants` 목록.
  - 기존 `PlantCard` 재사용하되 **상세 링크는 비활성**(보관 식물 상세 막음). PlantCard에 링크 토글 prop을 추가하거나 보관함 전용 행으로 — 구현 시 PlantCard 구조 보고 최소 변경 택일.
  - 각 항목에 "되돌리기" 버튼 → `unarchivePlant(id)`.
  - `loaded && archivedPlants.length === 0` → 빈 상태 문구("보관한 식물이 없어요").
  - 상단 "← 내 정원" 뒤로가기.
- **`src/garden/GardenView.tsx`**: 식물 목록 아래에 진입점 줄. `loaded && archivedPlants.length > 0`일 때만 "보관함 N개 보기"(→ `/archive`).

### 라우트
- `src/routes/ArchiveRoute.tsx`(신규) → `<ArchiveView/>`.
- `src/App.tsx`: `<Route path="/archive" element={<ArchiveRoute />} />` 추가(`/garden` 인접).

## 동작 흐름

1. 내 정원 로드 → `reload()` → `areas`·`plants`(미보관)·`archivedPlants`(보관).
2. 보관 식물 있으면 진입점 "보관함 N개 보기" 노출 → `/archive`.
3. 보관함에서 "되돌리기" → `unarchivePlant` → `isArchived=false` → `reload()` → 식물이 내 정원에 복귀, 보관함에서 제거.
4. `updatedAt` 갱신으로 다음 동기화 시 다른 기기에도 복귀 전파(레코드별 LWW).

## 테스트 계획 (TDD)

- `plants.test.ts`: `listArchivedPlants`(보관만·삭제 제외·sortOrder순), `unarchivePlant`(isArchived=false·updatedAt 갱신·멱등).
- `store.test.ts`(garden): `reload`가 `archivedPlants` 채움, `unarchivePlant` 액션이 `repo.unarchivePlant`+`reload` 호출.
- `ArchiveView.test.tsx`: 목록 렌더, 빈 상태, 되돌리기 버튼 클릭 → 액션 호출.
- `GardenView.test.tsx`: 진입점 조건부 표시(N>0 노출, N=0 숨김).

## 범위 밖 (YAGNI)

- 보관함에서 영구 삭제(되돌린 뒤 내 정원에서 삭제 가능).
- 보관 식물 상세 열람.
- 보관 시 확인 절차(확인 없이 즉시 유지).
- 영역별 그룹화(보관은 소량 → 단순 목록).
