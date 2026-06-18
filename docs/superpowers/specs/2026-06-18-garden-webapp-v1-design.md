# 보통의 정원 웹앱 v1 — 설계 (2026-06-18)

## 배경
- 아내(주 사용자, 아이폰 주 사용 + 아이패드 수정 다수)를 위한 한국 노지·텃밭 정원 + 기상청 날씨 앱.
- 기존 SwiftUI 네이티브 앱(`ordinary-garden`, 계획 1~7a 완료)은 **동결 보존**. 이 웹앱은 별도 신규 프로젝트(`ordinary-garden-web`).
- 전환 이유: 네이티브 개인 배포에 Apple Developer $99/년 필요(2인 개인용엔 과함). 웹앱(PWA)으로 $0 달성. App Store 불필요.

## 절대 제약
- **비용 $0.** 유료 호스팅·API·스토리지·개발자 계정 일절 없음. 무료 또는 무료 티어 안에서만.

## 목표 (v1 범위)
1. **날씨** — `weather.json` 실황·시간별·주간·미세먼지·특보 + "○분 전" 신선도·새로고침·캐시
2. **내 정원** — 영역별 식물 카드·필터·추가(사진)
3. **식물 상세 + 재배일지** — 사진 다중·작업태그·그날 날씨 박제·타임라인
4. **케어 + "오늘 할 일"** — 물주기/시비/분갈이 주기, 날씨 연동 제안, 완료·스누즈
5. **기기 간 동기화** — 구글 드라이브 appDataFolder(텍스트 + 사진)

## 비목표 (v1 제외)
- **도감** — 노지·텃밭 데이터 재설계 중(농사로 `cropEbook` 3060743 승인 대기). 데이터 확정 후 별도 추가.
- **위치 동적화** — 집 좌표 고정(기존 weather.json 그대로 사용). v2.
- **푸시 알림** — iOS PWA 제약. 인앱 표시·기록 위주.
- AI 식물 식별·건강진단, 광량 측정 — v2.

## 확정된 기술 결정
| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | React + Vite + TypeScript | 유지보수 안정성(주 유지보수자=Claude), 자료·라이브러리 풍부 |
| 로컬 저장 | IndexedDB (Dexie) | 정원·일지·케어 데이터의 단일 진실, 오프라인 |
| PWA | vite-plugin-pwa (workbox) | '홈 화면 추가'·오프라인 캐시 자동 |
| 동기화 | 구글 드라이브 appDataFolder | 무료·비공개(아내 드라이브)·기기 간 |
| 인증 | Google Identity Services 토큰 클라이언트 | SPA용, 클라이언트 시크릿 불필요 |
| 라우팅 | HashRouter | GitHub Pages 하위경로 호환 |
| 호스팅 | GitHub Pages(공개 repo) + GitHub Actions | $0, 기존 데이터 repo와 동일 패턴 |
| 테스트 | Vitest | 순수 로직 단위테스트 |

## 아키텍처
- **순수 정적 SPA.** 서버·서버리스 함수 없음.
- 데이터 출처 3:
  - **날씨**: `https://rakonteto.github.io/ordinary-garden-data/weather.json` fetch(CORS 허용 확인됨). 읽기 전용.
  - **개인 데이터**: IndexedDB = 단일 진실(single source of truth).
  - **동기화**: 구글 드라이브 appDataFolder. 로그인 시에만 활성, **미로그인 시 로컬만으로 완전 동작**.
- 계층(각각 독립 테스트 가능하게 분리):
  - **data**: Dexie 리포지토리 — CRUD. 모든 화면이 여기만 의존.
  - **sync**: 드라이브 ↔ Dexie 양방향 머지(순수 로직 분리).
  - **domain**: 케어 스케줄러·날씨 어드바이저(순수 함수, SwiftUI 포팅).
  - **ui**: React 컴포넌트·라우트.

## 데이터 모델 (Dexie)
공통 필드(모든 레코드): `id`(uuid 문자열), `updatedAt`(epoch ms), `deleted`(boolean, tombstone)

- `areas`: name, sortOrder
- `plants`: areaId, name, lightRequirement(`high`|`medium`|`low`), photoId?, datePlanted?, note?, isArchived, sortOrder
- `journalEntries`: plantId, date, note, tags(WorkType[]), weatherSnapshot?(그날 날씨 일부 박제 JSON)
- `journalPhotos`: ownerId(entry 또는 plant 대표사진), blob(Blob), driveFileId?(동기화 매핑)
- `careRules`: plantId, careType(`water`|`fertilize`|`repot`), intervalDays, lastCompletedAt?, nextDueAt, weatherAware

> enum 세부(WorkType 세트, LightRequirement, CareType)는 SwiftUI 원본(`ordinary-garden`)의 동일 정의를 그대로 포팅. 구현 착수 시 SwiftUI 코드에서 정확히 확정.

## 날씨 계약 (weather.json)
SwiftUI `WeatherBundle`과 1:1. 라이브 확인된 구조:
- `current`: tempC, humidity, precip1h, precipType, windDeg, windSpeed, sky
- `hourly[]`: time(ISO8601 +09:00), tempC, pop, precipType, precipMm, sky
- `daily[]`: 주간(필드는 구현 시 라이브 전체 + SwiftUI 모델로 확정)
- `dust`: pm10, pm25(미세먼지)
- `alerts[]`: {category, severity, title}(특보, 현재 빈 배열 — 배너 조건부)
- 신선도: 최상위 갱신 시각 → "○분 전" 계산
- 시각 문자열은 보관 후 변환(밀리초 ISO 파싱 주의 — SwiftUI 교훈).

## 동기화 설계
- **저장 위치**: 구글 드라이브 appDataFolder(앱 전용 숨김 폴더, 아내 드라이브에만, 비공개).
  - `garden.json` — areas/plants/journalEntries/careRules 전체(텍스트). 사진 blob 제외, photoId·driveFileId만 보관.
  - `photo-<id>` — 사진 개별 파일.
- **머지 규칙**: 항목 단위 last-write-wins by `updatedAt` + tombstone.
  - *pull*: 드라이브 garden.json 받아 로컬과 항목별 비교 → updatedAt 큰 쪽 채택. `deleted=true`는 삭제 전파.
  - *push*: 로컬 변경분 반영해 garden.json 업로드. 새 사진 업로드(→driveFileId), 삭제된 사진은 드라이브에서 제거.
  - *사진 다운로드*: 로컬 blob 없고 driveFileId 있으면 지연(on-demand) 다운로드.
- **트리거**: 앱 시작 1회 + 변경 후 디바운스 + 설정의 수동 동기화.
- **실패**: 로컬 유지, 다음 트리거에 재시도. 마지막 동기화 시각·상태 표시.
- **인증**: Google Identity Services 토큰 클라이언트, scope `drive.appdata`. 클라이언트 ID는 공개값(빌드 포함). 시크릿 없음. 토큰은 메모리 보관·필요 시 갱신.

## 화면 / 라우팅
- 하단 탭: **오늘 / 내 정원 / 설정** (+도감 자리 — v1 비활성/숨김)
- 라우트(HashRouter):
  - `/today` — 날씨 요약 카드 + 오늘 할 일(케어). 날씨 상세(시간별·주간·미세먼지·특보)로 이동.
  - `/garden` — 영역별 식물 카드·필터칩·추가 → `/plant/:id`(상세: 정보·일지 타임라인·케어) → 일지 작성 시트.
  - `/settings` — 구글 로그인/동기화 상태·테마 토글.

## 디자인 시스템
- 색: 세이지 배경 / 포레스트 그린 / 글래스(반투명 카드 + backdrop blur). CSS 변수로 라이트·다크 + 시스템 연동 + 수동 토글.
- 타이포: regular 기본, 제목 semibold.
- iOS Safari PWA 대응: `100dvh`, `env(safe-area-inset-*)`, apple-touch-icon, `display: standalone`, theme-color.

## PWA / 오프라인
- vite-plugin-pwa: 앱 셸 precache, `weather.json` runtime StaleWhileRevalidate.
- manifest: 이름·아이콘(maskable 포함)·theme/background color·standalone·start_url.
- 개인 데이터는 IndexedDB라 기본 오프라인. 드라이브 동기화는 온라인 시.

## 에러 처리
- 날씨 fetch 실패 → 마지막 캐시 + "○분 전" 유지, 재시도.
- 동기화 실패 → 로컬 유지, 상태 배지 알림, 재시도.
- 사진 로드/다운로드 실패 → placeholder, 재시도.
- 구글 토큰 만료 → 재인증 유도.

## 테스트 전략
- Vitest 단위테스트 우선(순수 로직):
  - 케어 스케줄러(nextDue·D-day)
  - 날씨 어드바이저(물주기 보류 `pop≥60` 또는 24h `precipMm` 합 `≥5`, 폭염 `maxC≥33`)
  - 동기화 머지(항목 LWW·tombstone)
  - weather 디코딩
- SwiftUI에서 검증된 임계값·동작을 동일 케이스로 재현.
- 컴포넌트/통합 테스트는 핵심 플로우 위주. 실제 2기기 동기화는 수동 검증.

## 구현 분할
- v1은 범위가 넓으므로 **여러 단계 계획으로 분할**(SwiftUI도 7개 계획으로 진행). 예상 순서: ① 기반(Vite·PWA·디자인 토큰·라우팅·Dexie 스키마) → ② 날씨 → ③ 내 정원 + 식물 모델 → ④ 식물 상세 + 재배일지 → ⑤ 케어 + 오늘 할 일 → ⑥ 구글 드라이브 동기화. 각 계획은 별도 spec→plan→구현 사이클을 따른다. (분할 확정은 writing-plans 단계에서.)

## 디렉토리 / 배포
- 로컬: `/Users/rakonteto/claude-workspace/ordinary-garden-web` (공개 repo 예정).
- 데이터 repo(`ordinary-garden-data`)는 그대로 — 웹앱은 weather.json만 fetch.
- GitHub Actions: Vite 빌드 → Pages 배포. base 경로 = `/ordinary-garden-web/`(프로젝트 페이지).
- **코드·커밋·번들에 개인정보·키 없음**(집 좌표는 weather.json이 이미 분리, OAuth 클라이언트 ID는 공개값).

## 미해결 / 추후
- 도감(노지·텃밭 데이터 확정 후), 위치 동적화(v2), 푸시 알림.
- WorkType/enum 정확한 세트 → 구현 착수 시 SwiftUI 코드에서 확정.
- weather.json `daily`·갱신시각 정확 필드 → 구현 시 라이브 전체 확인.
