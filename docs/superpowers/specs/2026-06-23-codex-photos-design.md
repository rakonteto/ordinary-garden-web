# 도감 사진 — 설계

날짜: 2026-06-23
상태: 설계 승인됨(브레인스토밍 완료) — 스펙 검토 대기

## 배경 / 문제

도감(`src/codex/`)은 현재 완전 정적·읽기전용이다. 종 카드([SpeciesCard](../../../src/codex/SpeciesCard.tsx))와
종 상세([SpeciesDetail](../../../src/codex/SpeciesDetail.tsx))는 **카테고리 이모지만** 보여준다.
LLM 발췌로 만든 도감이라 사진이 없어, 시각적 단서가 약하다.

사진을 더하되 두 갈래로 간다:

1. **보유종 = 아내가 찍은 내 사진**(비공개·드라이브 동기화). 키우는 종의 도감 항목을 실제 사진으로 개인화.
2. **도감 전체 = CC(크리에이티브 커먼즈) 사진 매핑**(공개 자원·출처 표기·점진 누적).

핵심 발견(코드 실측): 사진 저장 테이블 `journalPhotos`는 `ownerId` 기준이고, 동기화
([photos-sync.ts](../../../src/sync/photos-sync.ts)·[snapshot.ts](../../../src/sync/snapshot.ts))는 **ownerId를 가리지 않고
모든 사진 행을 처리**한다. 따라서 내 사진을 `ownerId="species:<id>"`로 넣으면 드라이브 동기화는
**추가 배선 없이 자동으로 따라온다**. `newId()=crypto.randomUUID()`이므로 기존 ownerId(식물·일지 id)와
`"species:"` 접두는 절대 겹치지 않는다.

## 목표

- 종 카드·상세에 사진 표시. 우선순위 **내 사진 > CC 사진 > 카테고리 이모지(폴백)**.
- **①** 종 상세에서 아내가 **내 사진을 올리고·교체·삭제**(종당 단일 대표사진). 비공개·드라이브 동기화.
- **②** 종별 **CC 사진 매핑**(출처·라이선스 표기) — 점진 큐레이션.
- 사진이 없는 종은 **지금과 동일**(이모지). 무회귀.

## 설계 결정 (사용자 승인)

1. **표시 우선순위 = 내 사진 > CC > 이모지.** 셋을 한 resolver에 모은다.
2. **보유종 모델 = 종 카드에 바로 지정.** 어느 종이든 종 상세에서 내 사진을 올릴 수 있고,
   **사진을 올린 종이 곧 "내 보유종"**이다. 별도 보유종 플래그 없음, 내 정원과 자동 연동 없음.
3. **종당 단일 대표사진**(올리기·교체·삭제). 데이터층은 다중도 지원하지만 UI는 단일 커버.
4. **① 저장 = `journalPhotos` 재사용**, `ownerId="species:<id>"`. 동기화·다운스케일·tombstone 공짜.
5. **② CC 이미지 호스팅 = 공개 데이터 repo URL + SW 캐시.** 이미지는 `ordinary-garden-data/codex/`,
   메타(출처·저작자·라이선스)는 앱 안 타입 TS 맵(`tsc` 검증).
6. **한 스펙, 빌드는 ①(1차) → ②(2차).** 둘은 표시 모델(A)을 공유한다.

## 변경 사항

### A. 공유 표시 모델 (① ② 공통 척추)

#### `src/codex/SpeciesPhoto.tsx` (신규)
종의 사진을 우선순위대로 해석해 렌더하는 단일 컴포넌트.

```ts
interface Props {
  speciesId: string
  category: CodexCategory   // 이모지 폴백용
  variant: 'card' | 'detail'
  alt: string
}
```

- 해석 순서:
  1. **내 사진** — `useSpeciesCoverPhotoId(speciesId)`로 store에서 photoId 조회. 있으면
     `getPhoto(photoId)` → object URL로 `<img>`([PlantPhoto](../../../src/garden/PlantPhoto.tsx)의 blob 로딩 패턴 재사용:
     mount 시 생성, cleanup 시 `revokeObjectURL`).
  2. **CC 사진** — `getCcPhoto(speciesId)`(정적 맵). 있으면 `<img src={CC_BASE + cc.file}>`.
     `variant==='detail'`이면 하단 출처 캡션도.
  3. **폴백** — `CATEGORY_EMOJI[category]`(현행 그대로).
- `variant`로 크기·형태만 다름(card=썸네일, detail=히어로). CSS는 `SpeciesPhoto.css`.
- **1차에서 cc 분기를 미리 포함**하되 맵이 비어 자연히 이모지로 폴백 → 2차는 데이터만 채우면 동작.

### B. ① 보유종 내 사진 — 빌드 1차

#### 데이터 `src/data/codexPhotos.ts` (신규, [photos.ts](../../../src/data/photos.ts) 얇은 래퍼)
- `codexOwnerId(speciesId): string` → `` `species:${speciesId}` ``.
- `getSpeciesPhoto(speciesId): Promise<JournalPhoto | undefined>` — `listPhotosByOwner(ownerId)`의 첫 항목(단일 커버).
- `setSpeciesPhoto(speciesId, blob, now?): Promise<JournalPhoto>` — **기존 커버를 먼저 `softDeletePhoto`** 후
  `putPhoto({ ownerId, blob })`. 단일 커버 보장(교체 = 이전 tombstone + 새 1장).
- `removeSpeciesPhoto(speciesId, now?): Promise<void>` — 해당 owner의 live 사진을 `softDeletePhoto`. 멱등.
- `softDeletePhoto`·`putPhoto`·`listPhotosByOwner`는 photos.ts 재사용(신규 테이블 없음).

#### 상태 `src/codex/photoStore.ts` (신규, [gardenStore](../../../src/garden/store.ts) 미러)
- `useSyncExternalStore` + 모듈 싱글톤 패턴(②날씨·③정원·⑤케어와 동일).
- `CodexPhotoState { byId: Map<string, JournalPhoto>; loaded: boolean }` (key=speciesId).
- `reload()` — `db.journalPhotos.where('ownerId').startsWith('species:')`(ownerId 인덱스됨)로 한 번에 로드,
  `!deleted && blob`만, key는 `"species:"` 접두 제거. → `set()` → 구독자 통지.
- 액션 `setSpeciesPhoto(speciesId, blob)` / `removeSpeciesPhoto(speciesId)` — repo 호출 후 `reload()`.
  → **상세에서 올리고 뒤로 가면 리스트도 즉시 반영**(N개 개별 쿼리 회피).
- `useCodexPhoto()` 훅(싱글톤 + ensureStarted 1회 자동 로드) + 셀렉터 `useSpeciesCoverPhotoId(speciesId)`.

#### UI
- **[SpeciesCard](../../../src/codex/SpeciesCard.tsx)**: `scard__emoji` 자리를 `<SpeciesPhoto variant="card" .../>`로 교체.
  내부에서 이모지로 폴백하므로 사진 없는 종은 무회귀.
- **[SpeciesDetail](../../../src/codex/SpeciesDetail.tsx)**: 헤더 상단에 `<SpeciesPhoto variant="detail" .../>` 히어로 추가 +
  **내 사진 편집 컨트롤**(인라인):
  - `<input type="file" accept="image/*">`로 선택 → File을 Blob으로 `setSpeciesPhoto`. ([AddPlantSheet] 사진 패턴 재사용.)
  - 내 사진 있을 때 "교체"·"삭제"(→ `removeSpeciesPhoto`) 노출.
  - 다운스케일은 업로드 시점이 아니라 **동기화 경로**에서(기존 2048px, photos-sync). 로컬은 원본 blob.

#### 동기화 — 변경 없음(핵심 속성)
- `journalPhotos` 행이므로 [photos-sync.ts](../../../src/sync/photos-sync.ts)(`db.journalPhotos.toArray()` 전수)와
  [snapshot.ts](../../../src/sync/snapshot.ts)(전 사진 메타 직렬화)가 **이미 커버**. snapshot/photos-sync 수정 불필요.
- `setSpeciesPhoto`/`removeSpeciesPhoto`가 `updatedAt` 갱신 → 레코드별 LWW로 다른 기기 전파.

### C. ② CC 매핑 — 빌드 2차 (설계·점진 큐레이션)

#### 데이터 `src/codex/ccPhotos.ts` (신규)
```ts
export interface CcPhoto {
  file: string         // 데이터 repo 내 파일명 (예: "hydrangea-macrophylla.jpg")
  author: string       // 저작자 표시
  license: string      // 예: "CC BY 4.0" | "CC BY-SA 4.0" | "CC0" | "Public Domain"
  licenseUrl: string   // 라이선스 전문 링크
  sourceUrl: string    // 원본 출처(예: 위키미디어 파일 페이지)
  title?: string
}
export const CC_BASE = 'https://rakonteto.github.io/ordinary-garden-data/codex/'
export const ccPhotos: Record<string, CcPhoto> = { /* speciesId → CcPhoto, 점진 누적 */ }
export function getCcPhoto(speciesId: string): CcPhoto | undefined
```

- **이미지 바이너리**는 공개 repo `ordinary-garden-data`의 `codex/`에 커밋 → Pages URL로 서빙(weather.json 패턴).
  CC/공개 이미지라 공개 무해(PII 아님).
- **SW 캐시**: `vite.config`의 workbox runtimeCaching에 `CC_BASE` 패턴 추가(StaleWhileRevalidate, weather와 동일) →
  첫 조회 후 오프라인 가능.
- **표시**: SpeciesPhoto의 detail variant에서 CC면 캡션 `사진 © {author} · {license}`(텍스트는 licenseUrl,
  이미지/캡션은 sourceUrl 링크) → CC BY/BY-SA 저작자표시 요건 충족.
- **큐레이션 cadence**: 아내 보유종(~16종) 우선 → 흔한 종 → 점진. 한 배치 = 이미지 commit(데이터 repo) +
  맵 줄 추가(앱) + 재배포. 도감이 종을 늘릴 때와 같은 흐름.

## 동작 흐름 (① 기준)

1. 도감 로드 → `codexPhotoStore.reload()`로 보유종 커버를 `byId` 맵에 적재(`species:` 접두 한 쿼리).
2. 종 카드·상세의 `SpeciesPhoto`가 mine → cc → emoji 순으로 해석해 렌더.
3. 상세에서 파일 선택 → `setSpeciesPhoto(speciesId, blob)` → 기존 커버 tombstone + 새 사진 + `reload()` →
   카드·상세 즉시 갱신.
4. 다음 동기화에서 photos-sync가 새 사진을 다운스케일·업로드(드라이브 appDataFolder), tombstone은 드라이브 정리.
   다른 기기는 메타 LWW + blob 다운로드로 동일 사진 수신.
5. "삭제" → `removeSpeciesPhoto` → tombstone(blob 비움) → 폴백(cc 또는 이모지)로 복귀, 동기화 전파.

## 테스트 계획 (TDD)

- **`codexPhotos.test.ts`**(node env — jsdom은 IDB blob 라운드트립서 Blob 미보존, photos.test 선례):
  `setSpeciesPhoto` 두 번 호출 시 이전 tombstone + live 1장만, `getSpeciesPhoto`, `removeSpeciesPhoto`(blob 비움·멱등),
  ownerId가 `species:` 접두.
- **`photoStore.test.ts`**(codex): `reload`가 `species:` 접두 행만 `byId`에 채움(식물·일지 사진 제외),
  `setSpeciesPhoto`/`removeSpeciesPhoto` 액션이 repo + `reload` 호출, 통지(반응성).
- **`SpeciesPhoto.test.tsx`**: 우선순위 분기(mine>cc>emoji), card/detail variant, CC 출처 캡션 렌더.
- **`ccPhotos.test.ts`**(2차): 맵 무결성 — 모든 키가 실제 종 id와 매칭(`findSpecies`로 검증, [search.ts](../../../src/codex/search.ts)
  종 id 유일성 테스트와 같은 결), 필수 필드(file·author·license·licenseUrl·sourceUrl) 존재.
- **`SpeciesCard.test.tsx`·`SpeciesDetail.test.tsx`**: 사진 통합(mine 있으면 이미지, 없으면 이모지 무회귀),
  편집 컨트롤(추가/교체/삭제가 액션 호출).
- **브라우저 실검증**: 추가 → 카드·상세 반영 → F5 후 IndexedDB blob 복원 → (가능 시) 동기화 전파. 콘솔 0.

## 빌드 순서 (마일스톤)

- **1차(①)** = A 표시 모델 + B 내 사진 + 동기화 무변경 검증. SpeciesPhoto는 cc 분기를 포함하되
  맵이 비어 mine·emoji만 동작.
- **2차(②)** = ccPhotos 맵·CC_BASE·SW 캐시·출처 캡션 + 큐레이션 시작. SpeciesPhoto가 이미 cc 자리를
  마련해, ②는 **거의 순수 데이터 작업**(+SW 한 줄·캡션 CSS).

## 범위 밖 (YAGNI)

- 갤러리(종당 다중 사진) — 데이터층은 열려 있으나 UI는 단일 커버.
- 내 정원 ↔ 도감 자동 연동(식물에 speciesId 링크).
- 보유종 별도 플래그·보유종 전용 필터.
- CC 메타 외부 JSON화(타입 TS 맵 유지).
- CC 이미지 자동 수집·대량 큐레이션(점진 수작업).
- 앱 내 크롭/보정 도구(올리기·교체·삭제만).
