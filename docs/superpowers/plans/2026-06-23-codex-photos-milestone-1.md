# 도감 사진 ① 보유종 내 사진 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 도감 종 카드·상세에 사진을 표시하고(우선순위 내 사진 > CC > 이모지), 종 상세에서 아내가 종당 단일 대표사진을 올리고·교체·삭제할 수 있게 한다(비공개·드라이브 동기화 자동).

**Architecture:** 기존 `journalPhotos` 테이블을 `ownerId="species:<id>"`로 재사용한다(동기화·다운스케일·tombstone이 ownerId 무관이라 추가 배선 0). 얇은 데이터 래퍼(`codexPhotos.ts`) 위에 ②날씨·③정원·⑤케어와 동일한 `useSyncExternalStore`+모듈 싱글톤 스토어(`photoStore.ts`)를 얹어, 종 상세에서 올린 사진이 목록에도 즉시 반영되게 한다. 표시는 단일 컴포넌트 `SpeciesPhoto`가 우선순위를 해석한다. CC 분기는 이번에 골격(빈 맵)만 만들고 ②에서 데이터를 채운다.

**Tech Stack:** React 19, TypeScript, Dexie(IndexedDB), Vitest + @testing-library/react, vite-plugin-pwa. 신규 의존성 0.

## Global Constraints

- 작업 폴더: `/Users/rakonteto/claude-workspace/ordinary-garden-web`. **셸 cwd가 매 명령 워크스페이스 루트로 리셋되니** 모든 명령을 `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && …` 형태로 자족하게 쓴다.
- 브랜치: `feature/codex-photos`(이미 생성·스펙 커밋됨).
- 비용 $0·신규 의존성 0. 기존 패턴 미러(gardenStore/useGarden, photos.ts 재사용).
- 값은 한국어, 키는 영문 camelCase. 커밋은 한글 conventional + 끝줄 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- CSS는 하드코딩 색 금지 — 토큰 사용(`--space-1..4`, `--color-text`, `--color-text-weak`, `--color-primary`, `--color-primary-weak`, `--color-accent`, `--color-surface`, `--color-surface-border`, `--radius-card`=18px, `--radius-chip`=999px).
- IndexedDB blob 라운드트립을 검증하는 데이터 테스트는 **`// @vitest-environment node`**(jsdom은 Blob 미보존, `photos.test.ts` 선례). 컴포넌트 테스트는 jsdom + `URL.createObjectURL = vi.fn(() => 'blob:mock-url')`.
- 동기화는 **건드리지 않는다**(journalPhotos 재사용으로 자동). `snapshot.ts`·`photos-sync.ts` 수정 금지.
- 이번 계획은 **마일스톤 ①만**. ②(CC 데이터·이미지 호스팅·SW 캐시)는 후속 계획.

---

## File Structure

**신규**
- `src/data/codexPhotos.ts` — journalPhotos 위 얇은 래퍼(종당 단일 커버 의미·`species:` 네임스페이스). 책임: 종 사진의 저장/조회/삭제/전체조회.
- `src/data/codexPhotos.test.ts` — 위 래퍼 단위 테스트(node env).
- `src/codex/photoStore.ts` — 보유종 커버 스토어(gardenStore 미러) + `useCodexPhotos`/`useSpeciesCoverPhotoId` 훅. 책임: 종→사진 반응형 상태.
- `src/codex/photoStore.test.ts` — 스토어 로직 테스트(fake repo, jsdom).
- `src/codex/ccPhotos.ts` — CC 사진 타입·빈 맵·`getCcPhoto`·`CC_BASE`(②에서 채움). 책임: CC 메타 단일 출처.
- `src/codex/SpeciesPhoto.tsx` — 우선순위(mine>cc>emoji) 해석 렌더 컴포넌트. 책임: 종 사진 1곳에서 표시.
- `src/codex/SpeciesPhoto.css` — card/detail variant 치수·이모지/로딩 폴백·CC 캡션.
- `src/codex/SpeciesPhoto.test.tsx` — 우선순위·variant·캡션 테스트(jsdom, 모듈 모킹).
- `src/codex/SpeciesCard.test.tsx` — 카드 통합 회귀 테스트(신규).

**수정**
- `src/codex/SpeciesCard.tsx` — 이모지 자리를 `SpeciesPhoto`로 교체.
- `src/codex/SpeciesDetail.tsx` — 헤더 위 히어로 `SpeciesPhoto` + 내 사진 편집 컨트롤.
- `src/codex/SpeciesDetail.css` — 편집 컨트롤 스타일.
- `src/codex/SpeciesDetail.test.tsx` — photoStore 모킹 + 편집 컨트롤 테스트 추가.

App.tsx·라우트 변경 없음(도감 라우트 기존). 스토어는 `useCodexPhotos`가 1회 자동 로드(ensureStarted)하므로 별도 배선 불필요.

---

## Task 1: codexPhotos 데이터 래퍼

**Files:**
- Create: `src/data/codexPhotos.ts`
- Test: `src/data/codexPhotos.test.ts`

**Interfaces:**
- Consumes: `putPhoto`, `softDeletePhoto`, `listPhotosByOwner`(from `src/data/photos.ts`), `db`(from `src/data/db.ts`), `JournalPhoto`(from `src/data/types.ts`).
- Produces:
  - `codexOwnerId(speciesId: string): string` → `"species:<id>"`
  - `getSpeciesPhoto(speciesId: string): Promise<JournalPhoto | undefined>`
  - `setSpeciesPhoto(speciesId: string, blob: Blob, now?: number): Promise<JournalPhoto>`
  - `removeSpeciesPhoto(speciesId: string, now?: number): Promise<void>`
  - `listSpeciesCovers(): Promise<Array<{ speciesId: string; photo: JournalPhoto }>>`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/data/codexPhotos.test.ts`

```tsx
// @vitest-environment node
// jsdom+fake-indexeddb는 IDB 라운드트립에서 Blob을 보존하지 못한다(node 보존). photos.test.ts 선례.
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'
import {
  codexOwnerId, getSpeciesPhoto, setSpeciesPhoto, removeSpeciesPhoto, listSpeciesCovers,
} from './codexPhotos'
import { putPhoto } from './photos'

beforeEach(async () => {
  await db.journalPhotos.clear()
})

function blob() {
  return new Blob(['x'], { type: 'image/png' })
}

describe('codexPhotos', () => {
  it('ownerId에 species: 접두를 붙인다', () => {
    expect(codexOwnerId('hydrangea-macrophylla')).toBe('species:hydrangea-macrophylla')
  })

  it('setSpeciesPhoto로 저장하고 getSpeciesPhoto로 읽는다', async () => {
    await setSpeciesPhoto('rose-main', blob())
    const got = await getSpeciesPhoto('rose-main')
    expect(got?.ownerId).toBe('species:rose-main')
    expect(got?.blob).toBeInstanceOf(Blob)
  })

  it('교체 시 단일 커버 유지 — 이전은 tombstone, live는 새 1장', async () => {
    const first = await setSpeciesPhoto('rose-main', blob())
    const second = await setSpeciesPhoto('rose-main', blob())
    expect(second.id).not.toBe(first.id)
    expect((await getSpeciesPhoto('rose-main'))?.id).toBe(second.id)
    const firstRaw = await db.journalPhotos.get(first.id)
    expect(firstRaw?.deleted).toBe(true)
    expect(firstRaw?.blob).toBeUndefined()
  })

  it('removeSpeciesPhoto는 tombstone 처리하고 멱등하다', async () => {
    await setSpeciesPhoto('rose-main', blob())
    await removeSpeciesPhoto('rose-main')
    expect(await getSpeciesPhoto('rose-main')).toBeUndefined()
    await removeSpeciesPhoto('rose-main') // 멱등 — 던지지 않음
    expect(await getSpeciesPhoto('rose-main')).toBeUndefined()
  })

  it('listSpeciesCovers는 species: 사진만 speciesId로 돌려준다(식물·일지 사진 제외)', async () => {
    await setSpeciesPhoto('rose-main', blob())
    await putPhoto({ ownerId: crypto.randomUUID(), blob: blob() }) // 식물 사진 — 제외돼야 함
    const covers = await listSpeciesCovers()
    expect(covers).toHaveLength(1)
    expect(covers[0].speciesId).toBe('rose-main')
    expect(covers[0].photo.ownerId).toBe('species:rose-main')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/data/codexPhotos.test.ts`
Expected: FAIL — `Failed to resolve import "./codexPhotos"` (파일 없음).

- [ ] **Step 3: 최소 구현** — `src/data/codexPhotos.ts`

```ts
import { db } from './db'
import { putPhoto, softDeletePhoto, listPhotosByOwner } from './photos'
import type { JournalPhoto } from './types'

const PREFIX = 'species:'

/** 도감 종 사진의 ownerId 네임스페이스. id는 crypto.randomUUID라 식물·일지 사진과 안 겹친다. */
export function codexOwnerId(speciesId: string): string {
  return PREFIX + speciesId
}

/** 종의 대표사진(단일 커버). 없으면 undefined. */
export async function getSpeciesPhoto(speciesId: string): Promise<JournalPhoto | undefined> {
  const list = await listPhotosByOwner(codexOwnerId(speciesId))
  return list[0]
}

/** 종 대표사진을 설정한다. 기존 커버는 먼저 tombstone(단일 커버 보장). */
export async function setSpeciesPhoto(speciesId: string, blob: Blob, now = Date.now()): Promise<JournalPhoto> {
  const ownerId = codexOwnerId(speciesId)
  const existing = await listPhotosByOwner(ownerId)
  for (const p of existing) await softDeletePhoto(p.id, now)
  return putPhoto({ ownerId, blob }, now)
}

/** 종 대표사진을 제거한다(tombstone). 멱등. */
export async function removeSpeciesPhoto(speciesId: string, now = Date.now()): Promise<void> {
  const existing = await listPhotosByOwner(codexOwnerId(speciesId))
  for (const p of existing) await softDeletePhoto(p.id, now)
}

/** 모든 보유종 커버를 (speciesId, photo)로. 식물·일지 사진은 제외(species: 접두만). */
export async function listSpeciesCovers(): Promise<Array<{ speciesId: string; photo: JournalPhoto }>> {
  const rows = await db.journalPhotos.where('ownerId').startsWith(PREFIX).toArray()
  return rows
    .filter((p) => !p.deleted && p.blob)
    .map((photo) => ({ speciesId: photo.ownerId.slice(PREFIX.length), photo }))
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/data/codexPhotos.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: 커밋**

```bash
cd /Users/rakonteto/claude-workspace/ordinary-garden-web && \
git add src/data/codexPhotos.ts src/data/codexPhotos.test.ts && \
git commit -m "feat(codex): 종 사진 데이터 래퍼(journalPhotos 재사용·단일 커버)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: codexPhotoStore + 훅

**Files:**
- Create: `src/codex/photoStore.ts`
- Test: `src/codex/photoStore.test.ts`

**Interfaces:**
- Consumes: `listSpeciesCovers`, `setSpeciesPhoto`, `removeSpeciesPhoto`(Task 1), `JournalPhoto`(types).
- Produces:
  - `interface CodexPhotoState { byId: Map<string, JournalPhoto>; loaded: boolean }`
  - `interface CodexPhotoRepo { listSpeciesCovers(): Promise<Array<{ speciesId: string; photo: JournalPhoto }>>; setSpeciesPhoto(speciesId: string, blob: Blob): Promise<unknown>; removeSpeciesPhoto(speciesId: string): Promise<unknown> }`
  - `createCodexPhotoStore(repo: CodexPhotoRepo): CodexPhotoStore`(getSnapshot/subscribe/load/setSpeciesPhoto/removeSpeciesPhoto)
  - `codexPhotoStore`(싱글톤)
  - `useCodexPhotos(): CodexPhotoState & { setSpeciesPhoto; removeSpeciesPhoto }`
  - `useSpeciesCoverPhotoId(speciesId: string): string | undefined`

- [ ] **Step 1: 실패하는 테스트 작성** — `src/codex/photoStore.test.ts`

```tsx
import { describe, it, expect } from 'vitest'
import { createCodexPhotoStore, type CodexPhotoRepo } from './photoStore'
import type { JournalPhoto } from '../data/types'

/** 인메모리 fake repo(speciesId → photo). IDB·blob 라운드트립 회피(gardenStore 테스트 패턴). */
function fakeRepo(): CodexPhotoRepo {
  const rows = new Map<string, JournalPhoto>()
  let seq = 0
  return {
    listSpeciesCovers: async () =>
      [...rows.entries()].map(([speciesId, photo]) => ({ speciesId, photo })),
    setSpeciesPhoto: async (speciesId, blob) => {
      rows.set(speciesId, {
        id: `ph${++seq}`, ownerId: `species:${speciesId}`, blob, updatedAt: 0, deleted: false,
      })
    },
    removeSpeciesPhoto: async (speciesId) => {
      rows.delete(speciesId)
    },
  }
}

describe('codexPhotoStore', () => {
  it('load 전엔 loaded=false, 빈 맵', () => {
    const store = createCodexPhotoStore(fakeRepo())
    expect(store.getSnapshot().loaded).toBe(false)
    expect(store.getSnapshot().byId.size).toBe(0)
  })

  it('getSnapshot은 변화 없으면 동일 참조, load 후 새 참조', async () => {
    const store = createCodexPhotoStore(fakeRepo())
    const initial = store.getSnapshot()
    expect(store.getSnapshot()).toBe(initial)
    await store.load()
    expect(store.getSnapshot()).not.toBe(initial)
  })

  it('setSpeciesPhoto 후 byId에 종이 보이고 구독자에 통지', async () => {
    const store = createCodexPhotoStore(fakeRepo())
    let notified = 0
    store.subscribe(() => { notified += 1 })
    await store.setSpeciesPhoto('rose-main', new Blob(['x']))
    expect(store.getSnapshot().byId.has('rose-main')).toBe(true)
    expect(notified).toBeGreaterThan(0)
  })

  it('removeSpeciesPhoto 후 byId에서 사라진다', async () => {
    const store = createCodexPhotoStore(fakeRepo())
    await store.setSpeciesPhoto('rose-main', new Blob(['x']))
    await store.removeSpeciesPhoto('rose-main')
    expect(store.getSnapshot().byId.has('rose-main')).toBe(false)
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/codex/photoStore.test.ts`
Expected: FAIL — `Failed to resolve import "./photoStore"`.

- [ ] **Step 3: 최소 구현** — `src/codex/photoStore.ts`

```ts
import { useEffect, useSyncExternalStore } from 'react'
import { listSpeciesCovers, setSpeciesPhoto, removeSpeciesPhoto } from '../data/codexPhotos'
import type { JournalPhoto } from '../data/types'

export interface CodexPhotoState {
  byId: Map<string, JournalPhoto> // speciesId → 대표사진
  loaded: boolean
}

export interface CodexPhotoRepo {
  listSpeciesCovers(): Promise<Array<{ speciesId: string; photo: JournalPhoto }>>
  setSpeciesPhoto(speciesId: string, blob: Blob): Promise<unknown>
  removeSpeciesPhoto(speciesId: string): Promise<unknown>
}

export interface CodexPhotoStore {
  getSnapshot(): CodexPhotoState
  subscribe(listener: () => void): () => void
  load(): Promise<void>
  setSpeciesPhoto(speciesId: string, blob: Blob): Promise<void>
  removeSpeciesPhoto(speciesId: string): Promise<void>
}

const EMPTY: CodexPhotoState = { byId: new Map(), loaded: false }

export function createCodexPhotoStore(repo: CodexPhotoRepo): CodexPhotoStore {
  let state: CodexPhotoState = EMPTY
  const listeners = new Set<() => void>()

  function set(next: CodexPhotoState) {
    state = next
    listeners.forEach((l) => l())
  }

  async function reload() {
    const covers = await repo.listSpeciesCovers()
    const byId = new Map(covers.map((c) => [c.speciesId, c.photo]))
    set({ byId, loaded: true })
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    load: reload,
    async setSpeciesPhoto(speciesId, blob) {
      await repo.setSpeciesPhoto(speciesId, blob)
      await reload()
    },
    async removeSpeciesPhoto(speciesId) {
      await repo.removeSpeciesPhoto(speciesId)
      await reload()
    },
  }
}

export const codexPhotoStore = createCodexPhotoStore({
  listSpeciesCovers,
  setSpeciesPhoto,
  removeSpeciesPhoto,
})

let started = false
function ensureStarted() {
  if (started) return
  started = true
  void codexPhotoStore.load()
}

export function useCodexPhotos(): CodexPhotoState & {
  setSpeciesPhoto: (speciesId: string, blob: Blob) => Promise<void>
  removeSpeciesPhoto: (speciesId: string) => Promise<void>
} {
  const state = useSyncExternalStore(codexPhotoStore.subscribe, codexPhotoStore.getSnapshot)
  useEffect(() => {
    ensureStarted()
  }, [])
  return {
    ...state,
    setSpeciesPhoto: codexPhotoStore.setSpeciesPhoto,
    removeSpeciesPhoto: codexPhotoStore.removeSpeciesPhoto,
  }
}

/** 종의 내 사진 id(없으면 undefined). SpeciesPhoto·SpeciesDetail에서 사용. */
export function useSpeciesCoverPhotoId(speciesId: string): string | undefined {
  const { byId } = useCodexPhotos()
  return byId.get(speciesId)?.id
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/codex/photoStore.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: 커밋**

```bash
cd /Users/rakonteto/claude-workspace/ordinary-garden-web && \
git add src/codex/photoStore.ts src/codex/photoStore.test.ts && \
git commit -m "feat(codex): 보유종 커버 스토어(gardenStore 미러·반응형)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: SpeciesPhoto 컴포넌트 + ccPhotos 골격

**Files:**
- Create: `src/codex/ccPhotos.ts`, `src/codex/SpeciesPhoto.tsx`, `src/codex/SpeciesPhoto.css`
- Test: `src/codex/SpeciesPhoto.test.tsx`

**Interfaces:**
- Consumes: `useSpeciesCoverPhotoId`(Task 2), `getPhoto`(from `src/data/photos.ts`), `CATEGORY_EMOJI`(from `src/codex/categories.ts`), `CodexCategory`(types).
- Produces:
  - `interface CcPhoto { file: string; author: string; license: string; licenseUrl: string; sourceUrl: string; title?: string }`
  - `CC_BASE: string`, `ccPhotos: Record<string, CcPhoto>`, `getCcPhoto(speciesId: string): CcPhoto | undefined`
  - `SpeciesPhoto`(default export, props `{ speciesId: string; category: CodexCategory; variant: 'card' | 'detail'; alt: string }`)

- [ ] **Step 1: ccPhotos 골격 작성** — `src/codex/ccPhotos.ts`

```ts
// CC(크리에이티브 커먼즈) 사진 매핑의 단일 출처. ②에서 점진적으로 채운다.
// 이미지 바이너리는 공개 데이터 repo(ordinary-garden-data/codex/)에 두고 CC_BASE로 참조한다.

export interface CcPhoto {
  file: string // 데이터 repo 내 파일명 (예: "hydrangea-macrophylla.jpg")
  author: string // 저작자 표시
  license: string // 예: "CC BY 4.0" | "CC BY-SA 4.0" | "CC0" | "Public Domain"
  licenseUrl: string // 라이선스 전문 링크
  sourceUrl: string // 원본 출처(예: 위키미디어 파일 페이지)
  title?: string
}

export const CC_BASE = 'https://rakonteto.github.io/ordinary-garden-data/codex/'

/** 종 id → CC 사진. ②에서 채운다(지금은 비어 있어 자연히 이모지로 폴백). */
export const ccPhotos: Record<string, CcPhoto> = {}

export function getCcPhoto(speciesId: string): CcPhoto | undefined {
  return ccPhotos[speciesId]
}
```

- [ ] **Step 2: 실패하는 테스트 작성** — `src/codex/SpeciesPhoto.test.tsx`

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SpeciesPhoto from './SpeciesPhoto'
import { useSpeciesCoverPhotoId } from './photoStore'
import { getCcPhoto } from './ccPhotos'
import { getPhoto } from '../data/photos'
import type { JournalPhoto } from '../data/types'

vi.mock('./photoStore', () => ({ useSpeciesCoverPhotoId: vi.fn() }))
vi.mock('../data/photos', () => ({ getPhoto: vi.fn() }))
vi.mock('./ccPhotos', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./ccPhotos')>()
  return { ...actual, getCcPhoto: vi.fn() } // CC_BASE는 실제 값 유지
})

beforeEach(() => {
  vi.mocked(useSpeciesCoverPhotoId).mockReturnValue(undefined)
  vi.mocked(getCcPhoto).mockReturnValue(undefined)
  vi.mocked(getPhoto).mockResolvedValue(undefined)
  URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  URL.revokeObjectURL = vi.fn()
})

describe('SpeciesPhoto', () => {
  it('내 사진·CC 모두 없으면 카테고리 이모지로 폴백', () => {
    render(<SpeciesPhoto speciesId="x" category="화훼" variant="card" alt="장미" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('🌸')).toBeInTheDocument()
  })

  it('CC만 있으면 CC 이미지를 보여주고 상세에선 출처 캡션을 단다', () => {
    vi.mocked(getCcPhoto).mockReturnValue({
      file: 'rose.jpg', author: '홍길동', license: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      sourceUrl: 'https://commons.wikimedia.org/x',
    })
    render(<SpeciesPhoto speciesId="rose-main" category="화훼" variant="detail" alt="장미" />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('rose.jpg')
    expect(screen.getByText(/홍길동/)).toBeInTheDocument()
    expect(screen.getByText('CC BY 4.0')).toBeInTheDocument()
  })

  it('내 사진이 있으면 CC보다 우선해 blob 이미지를 보여준다', async () => {
    vi.mocked(useSpeciesCoverPhotoId).mockReturnValue('ph1')
    vi.mocked(getCcPhoto).mockReturnValue({
      file: 'rose.jpg', author: 'x', license: 'CC BY 4.0', licenseUrl: 'u', sourceUrl: 'u',
    })
    vi.mocked(getPhoto).mockResolvedValue({
      id: 'ph1', ownerId: 'species:rose-main', blob: new Blob(['x'], { type: 'image/png' }),
      updatedAt: 0, deleted: false,
    } as JournalPhoto)
    render(<SpeciesPhoto speciesId="rose-main" category="화훼" variant="card" alt="장미" />)
    const img = (await screen.findByRole('img')) as HTMLImageElement
    expect(img.src).toBe('blob:mock-url') // CC의 rose.jpg가 아님
  })
})
```

- [ ] **Step 3: 실패 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/codex/SpeciesPhoto.test.tsx`
Expected: FAIL — `Failed to resolve import "./SpeciesPhoto"`.

- [ ] **Step 4: 컴포넌트 구현** — `src/codex/SpeciesPhoto.tsx`

```tsx
import { useEffect, useState } from 'react'
import type { CodexCategory } from './types'
import { CATEGORY_EMOJI } from './categories'
import { getPhoto } from '../data/photos'
import { useSpeciesCoverPhotoId } from './photoStore'
import { getCcPhoto, CC_BASE } from './ccPhotos'
import './SpeciesPhoto.css'

interface Props {
  speciesId: string
  category: CodexCategory
  variant: 'card' | 'detail'
  alt: string
}

/** 종 사진을 우선순위(내 사진 > CC > 이모지)대로 해석해 렌더한다. */
export default function SpeciesPhoto({ speciesId, category, variant, alt }: Props) {
  const minePhotoId = useSpeciesCoverPhotoId(speciesId)
  const [mineUrl, setMineUrl] = useState<string | null>(null)

  // 내 사진 blob → object URL (PlantPhoto 패턴).
  useEffect(() => {
    setMineUrl(null)
    if (!minePhotoId) return
    let revoked = false
    let objectUrl: string | null = null
    void getPhoto(minePhotoId).then((photo) => {
      if (revoked || !photo?.blob) return
      objectUrl = URL.createObjectURL(photo.blob)
      setMineUrl(objectUrl)
    })
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [minePhotoId])

  const cls = `sphoto sphoto--${variant}`

  // 1) 내 사진 — 있으면 무조건 우선. 로딩 중엔 폴백 대신 빈 자리(깜빡임 방지).
  if (minePhotoId) {
    return mineUrl ? (
      <img className={cls} src={mineUrl} alt={alt} />
    ) : (
      <span className={`${cls} sphoto--loading`} aria-hidden />
    )
  }

  // 2) CC 사진
  const cc = getCcPhoto(speciesId)
  if (cc) {
    const img = <img className={cls} src={CC_BASE + cc.file} alt={alt} loading="lazy" />
    if (variant === 'detail') {
      return (
        <figure className="sphoto__fig">
          {img}
          <figcaption className="sphoto__cc">
            사진 © {cc.author} ·{' '}
            <a href={cc.licenseUrl} target="_blank" rel="noreferrer noopener">
              {cc.license}
            </a>
            {' · '}
            <a href={cc.sourceUrl} target="_blank" rel="noreferrer noopener">
              출처
            </a>
          </figcaption>
        </figure>
      )
    }
    return img
  }

  // 3) 폴백 — 카테고리 이모지
  return (
    <span className={`${cls} sphoto--emoji`} aria-hidden>
      {CATEGORY_EMOJI[category]}
    </span>
  )
}
```

- [ ] **Step 5: CSS 작성** — `src/codex/SpeciesPhoto.css`

```css
/* 카드 썸네일 — 기존 .scard__emoji(1.7rem) 자리를 고정 박스로 대체(카드 높이 일관). */
.sphoto--card {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-card);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.sphoto--card.sphoto--emoji {
  font-size: 1.7rem;
  line-height: 1;
  background: var(--color-accent);
}
.sphoto--card.sphoto--loading {
  background: var(--color-surface);
}

/* 상세 히어로 */
.sphoto--detail {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-card);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.sphoto--detail.sphoto--emoji {
  font-size: 3.4rem;
  background: var(--color-accent);
}
.sphoto--detail.sphoto--loading {
  background: var(--color-surface);
}

/* CC 출처 캡션(상세) */
.sphoto__fig {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.sphoto__cc {
  font-size: 0.72rem;
  color: var(--color-text-weak);
}
.sphoto__cc a {
  color: var(--color-primary-weak);
}
```

- [ ] **Step 6: 통과 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/codex/SpeciesPhoto.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 7: 커밋**

```bash
cd /Users/rakonteto/claude-workspace/ordinary-garden-web && \
git add src/codex/ccPhotos.ts src/codex/SpeciesPhoto.tsx src/codex/SpeciesPhoto.css src/codex/SpeciesPhoto.test.tsx && \
git commit -m "feat(codex): SpeciesPhoto 우선순위 렌더(내사진>CC>이모지) + CC 골격

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: SpeciesCard 통합

**Files:**
- Modify: `src/codex/SpeciesCard.tsx`
- Test: `src/codex/SpeciesCard.test.tsx` (신규)

**Interfaces:**
- Consumes: `SpeciesPhoto`(Task 3), `CodexSpecies`(types).
- Produces: 변경 없음(SpeciesCard 시그니처 동일).

- [ ] **Step 1: 실패하는 회귀 테스트 작성** — `src/codex/SpeciesCard.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { db } from '../data/db'
import SpeciesCard from './SpeciesCard'
import type { CodexSpecies } from './types'

const species: CodexSpecies = {
  id: 'rose-main', genus: '장미', name: '장미', scientificName: 'Rosa',
  category: '화훼', form: '관목', hardiness: 'x', soil: 'x', water: 'x',
  light: 'x', care: 'x', pest: 'x', season: 'x', tip: 'x',
}

beforeEach(async () => {
  await db.journalPhotos.clear()
})

describe('SpeciesCard', () => {
  it('사진이 없으면 SpeciesPhoto가 카테고리 이모지로 폴백하고 상세로 링크한다', () => {
    const { container } = render(
      <MemoryRouter>
        <SpeciesCard species={species} />
      </MemoryRouter>,
    )
    expect(screen.getByText('🌸')).toBeInTheDocument()
    // SpeciesPhoto 적용 후에만 존재(기존 .scard__emoji가 아님) → 통합 전엔 실패(red).
    expect(container.querySelector('.sphoto--emoji')).toBeTruthy()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/codex/rose-main')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/codex/SpeciesCard.test.tsx`
Expected: FAIL — 현재 SpeciesCard는 `.scard__emoji`를 쓰므로 `.sphoto--emoji`가 없어 실패(red).

- [ ] **Step 3: SpeciesCard 교체** — `src/codex/SpeciesCard.tsx` 전체를 아래로

```tsx
import { Link } from 'react-router-dom'
import type { CodexSpecies } from './types'
import SpeciesPhoto from './SpeciesPhoto'
import './SpeciesCard.css'

/** 목록의 종 카드. 누르면 상세(/codex/:id)로 이동한다. */
export default function SpeciesCard({ species }: { species: CodexSpecies }) {
  return (
    <Link to={`/codex/${species.id}`} className="scard glass">
      <SpeciesPhoto speciesId={species.id} category={species.category} variant="card" alt={species.name} />
      <span className="scard__body">
        <span className="scard__name">{species.name}</span>
        {species.genus !== species.name && <span className="scard__genus">{species.genus}</span>}
        <span className="scard__sci">{species.scientificName}</span>
      </span>
    </Link>
  )
}
```

`SpeciesCard.css`의 `.scard__emoji` 규칙은 더는 쓰지 않지만 남겨둬도 무해하다(다른 곳 미사용). 정리하려면 삭제 가능 — 선택.

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/codex/SpeciesCard.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: 커밋**

```bash
cd /Users/rakonteto/claude-workspace/ordinary-garden-web && \
git add src/codex/SpeciesCard.tsx src/codex/SpeciesCard.test.tsx && \
git commit -m "feat(codex): 종 카드에 SpeciesPhoto 적용(이모지 폴백 무회귀)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: SpeciesDetail 통합 — 히어로 + 편집 컨트롤

**Files:**
- Modify: `src/codex/SpeciesDetail.tsx`, `src/codex/SpeciesDetail.css`, `src/codex/SpeciesDetail.test.tsx`

**Interfaces:**
- Consumes: `SpeciesPhoto`(Task 3), `useCodexPhotos`(Task 2), `findSpecies`·`CATEGORY_EMOJI`(기존).
- Produces: 변경 없음(라우트 동일).

- [ ] **Step 1: 테스트 보강(실패)** — `src/codex/SpeciesDetail.test.tsx` 전체를 아래로

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SpeciesDetail from './SpeciesDetail'
import { useCodexPhotos, useSpeciesCoverPhotoId } from './photoStore'
import type { JournalPhoto } from '../data/types'

vi.mock('./photoStore', () => ({
  useCodexPhotos: vi.fn(),
  useSpeciesCoverPhotoId: vi.fn(),
}))

beforeEach(() => {
  vi.mocked(useCodexPhotos).mockReturnValue({
    byId: new Map(), loaded: true, setSpeciesPhoto: vi.fn(), removeSpeciesPhoto: vi.fn(),
  })
  vi.mocked(useSpeciesCoverPhotoId).mockReturnValue(undefined)
})

function renderDetail(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/codex/${id}`]}>
      <Routes>
        <Route path="/codex/:speciesId" element={<SpeciesDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SpeciesDetail', () => {
  it('종 이름과 재배 필드를 보여준다 (율마)', () => {
    renderDetail('yulma-main')
    expect(screen.getByText('율마')).toBeTruthy()
    expect(screen.getByText(/내한성·월동/)).toBeTruthy()
  })

  it('품종(종 정보 상속)을 보여준다 — 페페로미아의 아몬드페페', () => {
    renderDetail('peperomia-main')
    expect(screen.getByText('품종')).toBeTruthy()
    expect(screen.getByText('아몬드페페')).toBeTruthy()
  })

  it('없는 id는 안내 문구를 보여준다', () => {
    renderDetail('존재하지않는id')
    expect(screen.getByText('찾는 식물이 없어요.')).toBeTruthy()
  })

  it('내 사진이 없으면 "내 사진 추가" 버튼만 보여준다', () => {
    renderDetail('yulma-main')
    expect(screen.getByText('내 사진 추가')).toBeInTheDocument()
    expect(screen.queryByText('삭제')).not.toBeInTheDocument()
  })

  it('파일을 고르면 setSpeciesPhoto(speciesId, file)를 호출한다', () => {
    const setSpy = vi.fn()
    vi.mocked(useCodexPhotos).mockReturnValue({
      byId: new Map(), loaded: true, setSpeciesPhoto: setSpy, removeSpeciesPhoto: vi.fn(),
    })
    const { container } = renderDetail('yulma-main')
    const input = container.querySelector('input[type=file]') as HTMLInputElement
    const file = new File(['x'], 'rose.png', { type: 'image/png' })
    fireEvent.change(input, { target: { files: [file] } })
    expect(setSpy).toHaveBeenCalledWith('yulma-main', file)
  })

  it('내 사진이 있으면 "삭제"가 removeSpeciesPhoto(speciesId)를 호출한다', () => {
    const removeSpy = vi.fn()
    const photo = { id: 'ph1' } as unknown as JournalPhoto
    vi.mocked(useCodexPhotos).mockReturnValue({
      byId: new Map([['yulma-main', photo]]),
      loaded: true, setSpeciesPhoto: vi.fn(), removeSpeciesPhoto: removeSpy,
    })
    renderDetail('yulma-main')
    fireEvent.click(screen.getByText('삭제'))
    expect(removeSpy).toHaveBeenCalledWith('yulma-main')
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/codex/SpeciesDetail.test.tsx`
Expected: FAIL — "내 사진 추가" 버튼·파일 input이 아직 없어 새 3개 테스트 실패.

- [ ] **Step 3: SpeciesDetail 구현** — `src/codex/SpeciesDetail.tsx`의 import·본문 상단·반환부를 수정

import 블록에 추가:

```tsx
import SpeciesPhoto from './SpeciesPhoto'
import { useCodexPhotos } from './photoStore'
```

함수 본문에서, `const ref = …` 다음 줄에 훅 호출 추가(조기 반환 위, 훅 규칙 준수):

```tsx
  const { byId, setSpeciesPhoto, removeSpeciesPhoto } = useCodexPhotos()
```

`const { species } = ref` 다음에 핸들러·파생값 추가:

```tsx
  const minePhotoId = byId.get(species.id)?.id

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await setSpeciesPhoto(species.id, file)
    e.target.value = '' // 같은 파일 재선택 허용
  }
```

반환 JSX에서 `← 도감` Link 바로 다음에 히어로 + 편집 컨트롤 삽입(헤더 위):

```tsx
      <SpeciesPhoto speciesId={species.id} category={species.category} variant="detail" alt={species.name} />

      <div className="sdetail__photo-edit">
        <label className="sdetail__photo-btn">
          {minePhotoId ? '내 사진 교체' : '내 사진 추가'}
          <input type="file" accept="image/*" onChange={onPick} hidden />
        </label>
        {minePhotoId && (
          <button
            type="button"
            className="sdetail__photo-remove"
            onClick={() => removeSpeciesPhoto(species.id)}
          >
            삭제
          </button>
        )}
      </div>
```

(나머지 `<header>`·필드·팁·품종 블록은 그대로 둔다.)

- [ ] **Step 4: CSS 추가** — `src/codex/SpeciesDetail.css` 끝에 추가

```css
.sdetail__photo-edit {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}
.sdetail__photo-btn {
  font-size: 0.85rem;
  color: var(--color-primary);
  background: var(--color-accent);
  border-radius: var(--radius-chip);
  padding: 6px 14px;
  cursor: pointer;
}
.sdetail__photo-remove {
  font-size: 0.85rem;
  color: var(--color-text-weak);
  background: var(--color-surface);
  border: 1px solid var(--color-surface-border);
  border-radius: var(--radius-chip);
  padding: 6px 14px;
  cursor: pointer;
}
```

- [ ] **Step 5: 통과 확인**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npx vitest run src/codex/SpeciesDetail.test.tsx`
Expected: PASS (6 tests).

- [ ] **Step 6: 커밋**

```bash
cd /Users/rakonteto/claude-workspace/ordinary-garden-web && \
git add src/codex/SpeciesDetail.tsx src/codex/SpeciesDetail.css src/codex/SpeciesDetail.test.tsx && \
git commit -m "feat(codex): 종 상세 히어로 사진 + 내 사진 추가/교체/삭제

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: 전체 검증 — 스위트·빌드·브라우저 실검증

**Files:** 없음(검증). 브라우저에서 CSS 미세 조정이 필요하면 해당 파일 수정 후 추가 커밋.

- [ ] **Step 1: 전체 테스트**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npm test`
Expected: 전부 PASS, 무회귀(기존 293 + 신규 약 13 = 약 306). 실패 시 해당 테스트로 디버그.

- [ ] **Step 2: 빌드(tsc 타입 강제 + vite)**

Run: `cd /Users/rakonteto/claude-workspace/ordinary-garden-web && npm run build`
Expected: tsc 에러 0, vite 빌드 성공(PWA SW 생성). 타입 에러 시 수정.

- [ ] **Step 3: preview 기동 + 도감 진입**

`preview_start`(워크스페이스 루트 `.claude/launch.json`의 `garden-web`, 포트 5173) → `preview_eval`로 `location.hash = '#/codex'`. `preview_console_logs`로 콘솔 에러 0 확인.

- [ ] **Step 4: 내 사진 추가·반영·영속 실검증**

1. 종 하나(예: 율마) 상세 진입(`#/codex/yulma-main`).
2. "내 사진 추가" → 파일 선택(작은 이미지). 히어로가 사진으로, 상단 버튼이 "내 사진 교체"+"삭제"로 바뀌는지.
3. "← 도감"으로 목록 복귀 → **해당 종 카드 썸네일이 사진으로** 바뀌었는지(스토어 반응성).
4. 브라우저 새로고침(F5) → IndexedDB에서 사진 복원(카드·상세 유지).
5. "내 사진 교체" → 다른 사진으로 바뀌는지. "삭제" → 이모지로 복귀(카드도).
6. 라이트/다크 모두 확인(`preview_resize`/테마 토글). `preview_screenshot`로 증거 남김. 콘솔 에러 0.

- [ ] **Step 5: (선택) 동기화 spot-check**

설정에서 로그인돼 있으면 "지금 동기화" 후, 다른 프로필/기기에서 같은 종 카드에 사진이 도달하는지 가볍게 확인(동기화는 journalPhotos 재사용이라 코드 변경 없음 — 자동). 미로그인이면 생략.

- [ ] **Step 6: 필요 시 CSS 조정 커밋**

브라우저에서 카드 썸네일 크기·히어로 비율·캡션이 어색하면 `SpeciesPhoto.css`/`SpeciesDetail.css` 조정 후:

```bash
cd /Users/rakonteto/claude-workspace/ordinary-garden-web && \
git add src/codex/SpeciesPhoto.css src/codex/SpeciesDetail.css && \
git commit -m "style(codex): 사진 카드·히어로 치수 브라우저 검증 반영

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## 마일스톤 ① 완료 기준

- 종 카드·상세에 사진 표시(내 사진 > 이모지; CC는 빈 맵이라 이번엔 이모지 폴백만 동작).
- 종 상세에서 단일 대표사진 추가·교체·삭제, 목록 즉시 반영·F5 영속.
- 전체 스위트·빌드 클린, 브라우저 실검증·콘솔 0, 동기화 무변경.
- 다음(②): `ccPhotos` 맵 채우기 + 데이터 repo 이미지 + SW 캐시(별도 계획).

## 범위 밖 (YAGNI)

- 갤러리(종당 다중 사진), 내 정원 ↔ 도감 자동 연동, 보유종 별도 플래그·필터.
- CC 데이터/이미지/SW 캐시(②). 앱 내 크롭·보정. 동기화 코드 변경.
