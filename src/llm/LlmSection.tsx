import { useState } from 'react'
import { loadLlmSettings, saveProvider, saveBridgeToken, saveBridgeUrl, BRIDGE_PROVIDERS } from './settings'
import type { ProviderId, BridgeProviderId } from './types'
import './LlmSection.css'

const BRIDGE_LABEL: Record<BridgeProviderId, string> = {
  claude: 'Claude 구독',
  codex: 'ChatGPT 구독',
  gemini: 'Gemini 구독',
  grok: 'Grok 구독',
}

/** 각 구독을 실제로 부르는 공식 CLI. 무엇이 도는지 밝혀 둔다. */
const CLI_LABEL: Record<BridgeProviderId, string> = {
  claude: 'claude',
  codex: 'codex',
  gemini: 'agy',
  grok: 'grok',
}

export default function LlmSection() {
  const [settings, setSettings] = useState(loadLlmSettings)
  // 주소는 친 그대로 화면에 두고 저장만 다듬는다. 글자마다 https를 붙이면 커서가 튄다.
  const [urlDraft, setUrlDraft] = useState(() => settings.bridgeUrl)

  function pickProvider(provider: ProviderId) {
    saveProvider(provider)
    setSettings(loadLlmSettings())
  }

  function pickToken(token: string) {
    saveBridgeToken(token)
    setSettings(loadLlmSettings())
  }

  function pickUrl(url: string) {
    setUrlDraft(url)
    saveBridgeUrl(url)
  }

  const usesBridge = settings.provider !== 'handoff'

  return (
    <section className="llm-card">
      <h2 className="llm-title">돌봄 상담</h2>
      <p className="llm-muted">식물 상세에서 물어볼 때 어디로 물을지 고릅니다.</p>

      <fieldset className="llm-options">
        <legend className="llm-legend">묻는 곳</legend>

        <label className="llm-option">
          <input
            type="radio"
            name="llm-provider"
            value="handoff"
            checked={settings.provider === 'handoff'}
            onChange={() => pickProvider('handoff')}
          />
          <span className="llm-option__body">
            <span className="llm-option__label">질문 복사해서 쓰는 AI 앱에 붙여넣기</span>
            <span className="llm-muted">
              어느 기기에서나 됩니다. 이미 결제 중인 구독을 그대로 쓰는 길은 이것뿐입니다.
            </span>
          </span>
        </label>

        <p className="llm-group-note">
          아래 넷은 <b>맥에서 브리지가 떠 있어야</b> 합니다. 맥이 아닌 기기나 배포된 주소에서
          부르려면 아래 브리지 주소에 테일넷 주소를 넣어야 하고, 그때도 맥이 켜져 있어야 합니다.
        </p>

        {BRIDGE_PROVIDERS.map((id) => (
          <label key={id} className="llm-option">
            <input
              type="radio"
              name="llm-provider"
              value={id}
              checked={settings.provider === id}
              onChange={() => pickProvider(id)}
            />
            <span className="llm-option__body">
              <span className="llm-option__label">{BRIDGE_LABEL[id]}</span>
              <span className="llm-muted">공식 CLI {CLI_LABEL[id]}를 부릅니다.</span>
            </span>
          </label>
        ))}
      </fieldset>

      {usesBridge && (
        <div className="llm-field">
          <label className="llm-muted" htmlFor="llm-token">브리지 토큰</label>
          <input
            id="llm-token"
            className="llm-input"
            type="password"
            value={settings.bridgeToken}
            onChange={(e) => pickToken(e.target.value)}
            placeholder="~/.claude-cli-bridge/token 파일의 내용"
          />
          <label className="llm-muted llm-subfield" htmlFor="llm-bridge-url">브리지 주소</label>
          <input
            id="llm-bridge-url"
            className="llm-input"
            type="text"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            value={urlDraft}
            onChange={(e) => pickUrl(e.target.value)}
            placeholder="http://127.0.0.1:8787"
          />
          <span className="llm-muted">이 맥에서 쓸 때는 비워 둡니다.</span>
        </div>
      )}
    </section>
  )
}
