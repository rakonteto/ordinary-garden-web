import { describe, it, expect, vi } from 'vitest'
import { createDriveClient } from './drive'
import type { TokenProvider } from './auth'

const tokens: TokenProvider = {
  getToken: async () => 'TKN', signIn: async () => {}, signOut: () => {}, isSignedIn: () => true,
}
const ok = (body: unknown) => ({ ok: true, status: 200, json: async () => body, blob: async () => new Blob([JSON.stringify(body)]) }) as unknown as Response

describe('DriveClient', () => {
  it('findFileId는 appDataFolder spaces로 조회하고 첫 매칭 id를 반환', async () => {
    const fetchFn = vi.fn(async () => ok({ files: [{ id: 'F1', name: 'garden.json' }] }))
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    const id = await drive.findFileId('garden.json')
    expect(id).toBe('F1')
    const url = (fetchFn.mock.calls[0] as unknown as [string, RequestInit])[0]
    expect(url).toContain('spaces=appDataFolder')
    expect((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].headers).toMatchObject({ Authorization: 'Bearer TKN' })
  })

  it('findFileId는 매칭 없으면 null', async () => {
    const fetchFn = vi.fn(async () => ok({ files: [] }))
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    expect(await drive.findFileId('x')).toBeNull()
  })

  it('uploadJson(신규)은 multipart POST, appDataFolder parents 포함, fileId 반환', async () => {
    const fetchFn = vi.fn(async () => ok({ id: 'NEW' }))
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    const id = await drive.uploadJson('garden.json', { a: 1 })
    expect(id).toBe('NEW')
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('uploadType=multipart')
    expect(init.method).toBe('POST')
    expect(String(init.body)).toContain('appDataFolder')
  })

  it('uploadJson(기존 id)은 PATCH(메타 parents 없이 미디어 갱신)', async () => {
    const fetchFn = vi.fn(async () => ok({ id: 'F1' }))
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    await drive.uploadJson('garden.json', { a: 2 }, 'F1')
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('/files/F1')
    expect(init.method).toBe('PATCH')
  })

  it('401이면 토큰 갱신 후 1회 재시도', async () => {
    const calls: number[] = []
    const fetchFn = vi.fn(async () => {
      calls.push(1)
      return calls.length === 1
        ? ({ ok: false, status: 401, json: async () => ({}) } as unknown as Response)
        : ok({ files: [] })
    })
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    await drive.findFileId('x')
    expect(fetchFn).toHaveBeenCalledTimes(2)
  })

  it('downloadJson은 GET /files/{id}?alt=media를 호출하고 파싱된 JSON을 반환', async () => {
    const payload = { plant: 'tomato', count: 3 }
    const fetchFn = vi.fn(async () => ok(payload))
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    const result = await drive.downloadJson<typeof payload>('F1')
    expect(result).toEqual(payload)
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('/files/F1')
    expect(url).toContain('alt=media')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer TKN')
  })

  it('downloadBlob은 GET /files/{id}?alt=media를 호출하고 Blob을 반환', async () => {
    const fetchFn = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({}), blob: async () => new Blob(['img-data'], { type: 'image/jpeg' }) }) as unknown as Response)
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    const result = await drive.downloadBlob('F1')
    expect(result).toBeInstanceOf(Blob)
    const [url] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('/files/F1')
    expect(url).toContain('alt=media')
  })

  it('uploadBlob(신규)은 multipart POST, Blob body, Authorization 헤더 포함', async () => {
    const fetchFn = vi.fn(async () => ok({ id: 'IMG1' }))
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    const blob = new Blob(['img'], { type: 'image/jpeg' })
    const id = await drive.uploadBlob('photo.jpg', blob)
    expect(id).toBe('IMG1')
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('uploadType=multipart')
    expect(init.method).toBe('POST')
    expect(init.body).toBeInstanceOf(Blob)
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer TKN')
  })

  it('deleteFile은 DELETE /files/{id}를 호출', async () => {
    const fetchFn = vi.fn(async () => ({ ok: true, status: 204, json: async () => ({}), blob: async () => new Blob() }) as unknown as Response)
    const drive = createDriveClient(tokens, fetchFn as unknown as typeof fetch)
    await drive.deleteFile('RD1')
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toContain('/files/RD1')
    expect(init.method).toBe('DELETE')
  })
})
