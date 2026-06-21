# ⑥ 구글 드라이브 동기화 — 설계 (2026-06-22)

보통의 정원 웹앱의 마지막 단계. 기기 간(아내 아이폰 ↔ 아이패드, 본인 랩탑) 데이터 동기화를
**구글 드라이브 `appDataFolder`** 로 구현한다. 백엔드 0, 비용 $0.

선행: ①기반 ~ ⑤케어 완료(main `c644100`, 214 테스트). 이 단계가 v1의 마지막 기능.

## 1. 목적 / 배경

- 주 사용자 = 아내. **아이폰을 주로 쓰되 아이패드로 수정하는 일이 많다 → 기기 간 동기화 필수.** 본인은 랩탑에서 보조.
- 현재 모든 데이터는 브라우저 로컬(IndexedDB/Dexie)에만 있어 기기 간 공유 불가.
- 동기화 백엔드를 두지 않고(서버리스), 아내 개인 드라이브의 앱 전용 숨김 폴더에 저장해 **비공개 + $0** 를 동시에 만족한다.

## 2. 제약 / 원칙 (절대)

- **$0** — 유료 호스팅·API·스토리지 일절 금지. 구글 드라이브 API·GitHub Pages·정적 PWA만으로 구현.
- **서버 없음** — OAuth·드라이브 호출 전부 브라우저(클라이언트)에서. 백엔드/서버리스 함수 도입하지 않는다.
- **비공개** — 개인 데이터는 아내 드라이브 `appDataFolder`(앱 전용 숨김 폴더)에만. 코드/번들/공개 repo에 PII·키 0.
- **오프라인 우선** — 미로그인·오프라인 상태에서 앱은 지금과 똑같이 로컬만으로 완전히 동작. 동기화는 부가 레이어이며 절대 앱의 전제 조건이 아니다.
- **비파괴** — 동기화가 로컬 데이터를 임의로 잃지 않는다. 충돌은 조용히 자동 해결하되(LWW), 삭제는 tombstone으로만.

## 3. 범위

**포함:** GIS 인증 · `appDataFolder` 저장 · clock 주입 통일(plants/areas/journal/photos) · 순수 merge 코어(레코드별 LWW) · 사진 다운스케일 업/다운로드 · 자동(포그라운드)+수동 트리거 · 설정 화면 로그인/동기화 UI.

**제외(YAGNI):** 실시간 동기화 · 다중 사용자 협업 · 충돌 수동 해결 UI · iOS 백그라운드 동기화 · 드라이브 외 저장소(iCloud 등) · 사진 외 대용량 바이너리.

## 4. 아키텍처 개요

```
┌─────────────── 설정 화면 (SettingsRoute) ───────────────┐
│  로그인 / 마지막 동기화 시각 / [지금 동기화] / 로그아웃   │
└───────────────────────┬─────────────────────────────────┘
                        │ useSync (싱글톤 store, useSyncExternalStore)
         ┌──────────────┴──────────────┐
         │   sync/orchestrator          │  pull→merge→push, 뮤텍스, 트리거
         └───┬──────────┬──────────┬────┘
   ┌─────────┘          │          └──────────┐
   │ auth (GIS)   merge (순수)        drive (REST 클라이언트)
   │ 토큰 발급/갱신  LWW·tombstone      files.list/get/create/update/delete
   └─────────────────────┬──────────────────── appDataFolder
                         │
                local repos (Dexie) — clock 주입 통일
                gardenStore / careStore.load() 로 화면 갱신
```

핵심: **순수 코어(merge)** 와 **부수효과 경계(auth/drive/repo)** 를 분리한다. 머지 로직은 네트워크·시계·DB 없이
순수 함수로 테스트하고, I/O는 인터페이스로 추상화해 목 주입한다(기존 weather/garden store 패턴과 동일 철학).

## 5. 인증 — Google Identity Services (토큰 모델)

- **스크립트:** `https://accounts.google.com/gsi/client` 동적 로드(설정 화면 진입 시 1회).
- **클라이언트:** `google.accounts.oauth2.initTokenClient({ client_id, scope: 'https://www.googleapis.com/auth/drive.appdata', callback })`.
  - 스코프는 **`drive.appdata` 단 하나** — 앱 전용 폴더만 접근, 아내의 다른 드라이브 파일은 절대 못 본다(최소 권한).
- **로그인:** "구글로 로그인" 클릭 → `requestAccessToken()` 팝업 → 액세스 토큰(약 1시간) 메모리 보관.
- **무프롬프트 갱신:** 만료/필요 시 `requestAccessToken({ prompt: '' })` — 세션 살아 있으면 팝업 없이 재발급. 실패하면 재로그인 안내.
- **client_id 주입:** 빌드 시 환경변수 `VITE_GOOGLE_CLIENT_ID`(코드 하드코딩 금지). client_id는 비밀이 아니지만(공개 가능, 보호는 승인된 origin 제한) `.env`/CI 변수로 관리. 미설정 시 동기화 UI는 "구성되지 않음"으로 비활성, 앱은 로컬로 정상 동작.
- **세션 지속:** 리프레시 토큰은 토큰 모델에 없음(그건 code 모델+백엔드 영역, 제외). 앱 재시작 시 무프롬프트 갱신을 시도하고, 막히면 사용자가 다시 "로그인"을 누른다.

## 6. 드라이브 레이아웃 (`appDataFolder`)

데이터 양이 작아(식물 수십·일지 수백) 메타데이터는 **단일 스냅샷 파일**로 충분하다. 사진만 개별 파일.

- **`garden.json`** — 메타데이터 전체 스냅샷:
  ```jsonc
  {
    "schemaVersion": 1,
    "areas":          [ { id, updatedAt, deleted, name, sortOrder } ],
    "plants":         [ { id, updatedAt, deleted, areaId, name, lightRequirement?, photoId?, datePlanted?, note?, isArchived, sortOrder } ],
    "journalEntries": [ { id, updatedAt, deleted, plantId, date, note, tags, weatherSnapshot? } ],
    "careRules":      [ { id, updatedAt, deleted, plantId, careType, intervalDays, lastCompletedAt?, nextDueAt, weatherAware, createdAt } ],
    "photos":         [ { id, updatedAt, deleted, ownerId, driveFileId?, sortOrder? } ]   // blob 제외(별도 파일)
  }
  ```
  - 모든 레코드는 `BaseRecord`(`id·updatedAt·deleted`)를 그대로 직렬화. 로컬 Dexie 레코드와 1:1 형태(사진 blob만 제외).
- **`photo-<id>.jpg`** — 사진 1장 = 드라이브 파일 1개(다운스케일 JPEG). 로컬 `JournalPhoto.driveFileId`(이미 존재)로 드라이브 파일과 연결.
- 모든 파일은 `parents: ['appDataFolder']`, 조회는 `spaces: 'appDataFolder'`.

## 7. 동기화 엔진

### 7-1. clock 주입 통일 (전제 작업)

현재 `care.ts`만 `now = Date.now()` 파라미터를 받고, 나머지 repo는 `Date.now()`를 인라인 호출한다.
머지의 결정성·테스트 가능성을 위해 **모든 쓰기 경로에 주입된 시계**를 쓰도록 통일한다.

- 대상: `plants.ts`(createPlant·updatePlant·softDeletePlant·archivePlant), `areas.ts`(createArea·renameArea·softDeleteArea), `journal.ts`(createEntry·updateEntry·softDeleteEntry), `photos.ts`(putPhoto·softDeletePhoto).
- 방식: `care.ts`와 동일하게 마지막 인자에 `now = Date.now()` 추가. 기존 호출부는 무인자라 동작 불변(기본값) — **회귀 없음**.
- `softDeletePlantDeep`(cascade)도 단일 `now`를 받아 하위 호출에 전파해 한 트랜잭션의 tombstone updatedAt을 일치시킨다.

### 7-2. merge — 순수 함수 (핵심)

```ts
mergeRecords<T extends BaseRecord>(local: T[], remote: T[]): T[]
```
- id로 매칭, **`updatedAt`이 큰 쪽 승리(LWW)**. `deleted` tombstone도 동일 규칙(삭제도 하나의 상태).
- `updatedAt` 동률이면 로컬 유지(결정적 tiebreak).
- 한쪽에만 있는 레코드는 그대로 채택.
- 부수효과 0 — 네트워크/DB/시계 의존 없음. 테이블 5종에 동일 적용.

### 7-3. 사진 동기화

- **다운스케일:** `downscaleImage(blob, maxEdge=2048, quality≈0.8) → Blob(JPEG)`. canvas 기반 순수 유틸(I/O는 createImageBitmap/canvas만).
- **Pull:** 머지 결과 photos 중 `driveFileId` 있고 로컬 blob 없는(또는 원격이 이긴) 사진 → `files.get(alt=media)`로 내려받아 로컬 blob 채움.
- **Push:** 로컬에 blob 있고 아직 안 올린(또는 변경된) 사진 → 다운스케일 → `files.create` 업로드 → 받은 fileId를 `driveFileId`에 저장. tombstone(`deleted`)된 사진 중 `driveFileId` 있으면 `files.delete`로 드라이브에서도 제거.

### 7-4. drive 클라이언트 (REST, fetch)

`gapi` 미사용 — 순수 `fetch`로 충분하고 의존성 0. 인터페이스로 추상화(목 주입).
- `listAppDataFiles()` → `files.list?spaces=appDataFolder`
- `downloadFile(fileId)` → `files/{id}?alt=media`
- `uploadFile(name, blob/json)` → multipart `files?uploadType=multipart`
- `updateFile(fileId, blob/json)` / `deleteFile(fileId)`
- 모든 호출에 `Authorization: Bearer <token>`. 401이면 무프롬프트 갱신 후 1회 재시도.

## 8. 트리거 / 오케스트레이션

- **한 번에 하나의 동기화만**(뮤텍스 플래그). 단일 사용자라 단순 가드로 충분.
- **Pull 시점:** 앱 시작(로그인 상태일 때) + 탭 포커스 복귀(`visibilitychange`/`focus`). iOS PWA는 백그라운드 동기화가 막혀 있어 **포그라운드 진입을 자동 트리거로 사용**(사용자가 답한 "자동"의 현실적 형태).
- **Push 시점:** 로컬 변경(mutation) 후 **debounce ≈ 3초** → 자동 업로드. 연속 변경은 합쳐서 1회.
- **수동:** 설정 '지금 동기화' = 즉시 full pull+merge+push.
- **완료 후:** `gardenStore.load()` + `careStore.load()` 호출 → 구독 컴포넌트 재렌더(기존 store 패턴 재사용).
- **상태:** `idle | syncing | error` + `lastSyncedAt`. 설정 화면에 노출.

## 9. UI — 설정 화면 (`SettingsRoute`)

현재 빈 껍데기(`<h1>설정</h1>`). 동기화 섹션을 추가한다.
- **미로그인:** "구글로 로그인" 버튼 + 한 줄 설명("아내 구글 계정으로 로그인하면 아이폰·아이패드·랩탑이 동기화됩니다").
- **로그인됨:** 계정 이메일 · **마지막 동기화 시각**(상대표기) · "지금 동기화" 버튼 · "로그아웃".
- **동기화 중:** 스피너/문구. **오류:** 조용한 안내(예: "동기화 실패 — 잠시 후 다시 시도"). 로컬 데이터는 항상 안전함을 전제로 비차단 표시.
- client_id 미구성 시: 섹션을 "동기화 미설정"으로 안내(앱은 정상).

## 10. 모듈 구조 (신규 `src/sync/`)

- `auth.ts` — GIS 토큰 클라이언트 로드·로그인·무프롬프트 갱신·로그아웃. 인터페이스 `TokenProvider`.
- `drive.ts` — appDataFolder REST 클라이언트. 인터페이스 `DriveClient`(목 주입).
- `merge.ts` — `mergeRecords`(순수). **네트워크/DB 의존 0.**
- `snapshot.ts` — Dexie 5테이블 ↔ `garden.json` 직렬화/역직렬화(blob 제외).
- `image.ts` — `downscaleImage`(canvas).
- `orchestrator.ts` — pull→merge→push, 뮤텍스, 트리거 등록, store 갱신. 인터페이스 주입(auth/drive/repos/clock).
- `store.ts` + `useSync.ts` — 동기화 상태 싱글톤(useSyncExternalStore, 기존 패턴).
- UI: `src/routes/SettingsRoute.tsx` 확장 + `src/sync/SyncSection.tsx`.

## 11. 테스트 전략

- **순수 우선:** `merge`(LWW·tombstone·한쪽 전용·동률), `snapshot`(직렬화 왕복), `image`(다운스케일 경계) → 결정적 단위테스트.
- **clock 주입:** repo 통일 후 `now` 고정으로 tombstone updatedAt 검증 + 기존 무인자 호출 회귀 0 확인.
- **orchestrator:** `DriveClient`·`TokenProvider` 목 + `fake-indexeddb`로 pull→merge→push 시나리오(양방향 변경, 삭제 전파, 사진 업/다운). 시계 주입.
- **실 OAuth 검증:** 실제 구글 로그인은 사용자님 계정이 필요 → **그 단계는 사용자와 함께**(두 브라우저 프로필로 양방향 머지 확인). 단위/통합은 목으로 전부 커버.
- 절차: 태스크별 spec+품질 리뷰 + opus 최종 종합 리뷰 + 브라우저 실검증(①~⑤ 동일).

## 12. 준비물 — OAuth 클라이언트 ID (사용자 액션, 무료)

구현 직전 화면 단위로 안내. 요지:
1. Google Cloud Console에서 프로젝트 1개 생성.
2. OAuth 클라이언트 ID(웹) 발급 — **승인된 JS 출처**에 `https://rakonteto.github.io`, `http://localhost:5173` 등록.
3. OAuth 동의 화면 = **테스트 모드**, 테스트 사용자에 아내·본인 이메일 추가(2명 → 구글 앱 심사 불필요).
4. 발급된 client_id를 로컬 `.env`(`VITE_GOOGLE_CLIENT_ID=`)와 GitHub Pages 빌드 변수에 설정. (client_id는 공개돼도 무방, origin 제한이 보안.)

## 13. 결정 사항 (확정)

- 트리거 = **자동(포그라운드 pull + debounce push) + 수동 버튼**. (사용자 확정)
- 사진 = **다운스케일(긴 변 2048px JPEG) 동기화**. (사용자 확정)
- 충돌 = **레코드별 LWW**, 사용자 개입 없음.
- 레이아웃 = 메타 **단일 `garden.json`** + 사진 개별 파일.
- 계정 = 아내 구글 계정 단독(모든 기기 동일 계정 로그인).
- 라이브러리 = GIS 스크립트만, 드라이브는 fetch REST(신규 npm 의존성 0 목표).

## 14. 미해결 / 후속

- debounce·visibilitychange 정확한 시간/이벤트 조합은 구현 중 브라우저 실측으로 미세조정.
- 사진 다운스케일 품질(0.8)·maxEdge(2048)는 실제 사진으로 눈검증 후 조정 가능.
- 토큰 만료 중 진행되던 동기화의 재시도(401→갱신→1회 재시도)는 drive 클라이언트에서 처리.
- (후속) 큰 일지/사진 누적 시 `garden.json` 단일 파일의 크기 — v1 규모(2인 가정용)에선 문제없고, 필요 시 테이블별 분할은 차기 과제.
