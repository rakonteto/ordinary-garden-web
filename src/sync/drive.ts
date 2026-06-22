import type { TokenProvider } from './auth'

const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3'

export interface DriveClient {
  findFileId(name: string): Promise<string | null>
  downloadJson<T>(fileId: string): Promise<T>
  downloadBlob(fileId: string): Promise<Blob>
  uploadJson(name: string, data: unknown, existingId?: string): Promise<string>
  uploadBlob(name: string, blob: Blob, existingId?: string): Promise<string>
  deleteFile(fileId: string): Promise<void>
}

export function createDriveClient(tokens: TokenProvider, fetchFn: typeof fetch = fetch): DriveClient {
  /** 인증 헤더 부착 + 401 시 토큰 갱신 후 1회 재시도. */
  async function authed(url: string, init: RequestInit = {}, retry = true): Promise<Response> {
    const token = await tokens.getToken()
    const headers = { ...(init.headers as Record<string, string>), Authorization: `Bearer ${token}` }
    const res = await fetchFn(url, { ...init, headers })
    if (res.status === 401 && retry) {
      tokens.signOut() // 캐시 무효화 → getToken이 재발급
      return authed(url, init, false)
    }
    if (!res.ok) throw new Error(`Drive ${init.method ?? 'GET'} ${url} → ${res.status}`)
    return res
  }

  function multipart(metadata: object, body: string | Blob, contentType: string): { body: string | Blob; boundary: string } {
    const boundary = 'og_boundary_x'
    const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`
    const tail = `\r\n--${boundary}--`
    if (typeof body === 'string') {
      return { body: head + body + tail, boundary }
    }
    return { body: new Blob([head, body, tail]), boundary }
  }

  async function upload(name: string, body: string | Blob, contentType: string, existingId?: string): Promise<string> {
    if (existingId) {
      // 기존 파일: 미디어만 PATCH(메타데이터 parents 변경 없음)
      const res = await authed(`${UPLOAD}/files/${existingId}?uploadType=media`, {
        method: 'PATCH', headers: { 'Content-Type': contentType }, body,
      })
      return ((await res.json()) as { id: string }).id
    }
    const metadata = { name, parents: ['appDataFolder'] }
    const { body: mpBody, boundary } = multipart(metadata, body, contentType)
    const res = await authed(`${UPLOAD}/files?uploadType=multipart&fields=id`, {
      method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: mpBody,
    })
    return ((await res.json()) as { id: string }).id
  }

  return {
    async findFileId(name) {
      const q = encodeURIComponent(`name='${name.replace(/'/g, "\\'")}'`)
      const res = await authed(`${API}/files?spaces=appDataFolder&q=${q}&fields=files(id,name)`)
      const { files } = (await res.json()) as { files: { id: string; name: string }[] }
      return files[0]?.id ?? null
    },
    async downloadJson<T>(fileId: string) {
      const res = await authed(`${API}/files/${fileId}?alt=media`)
      return (await res.json()) as T
    },
    async downloadBlob(fileId: string) {
      const res = await authed(`${API}/files/${fileId}?alt=media`)
      return await res.blob()
    },
    uploadJson(name, data, existingId) {
      return upload(name, JSON.stringify(data), 'application/json', existingId)
    },
    uploadBlob(name, blob, existingId) {
      return upload(name, blob, blob.type || 'image/jpeg', existingId)
    },
    async deleteFile(fileId: string) {
      await authed(`${API}/files/${fileId}`, { method: 'DELETE' })
    },
  }
}
