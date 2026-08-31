import { useState } from 'react'
import { loadLlmSettings, saveProvider, saveBridgeToken, BRIDGE_PROVIDERS } from './settings'
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

  function pickProvider(provider: ProviderId) {
    saveProvider(provider)
    setSettings(loadLlmSettings())
  }

  function pickToken(token: string) {
    saveBridgeToken(token)
    setSettings(loadLlmSettings())
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
          아래 넷은 <b>맥에서 브리지를 띄웠을 때만</b> 됩니다. 아이폰·아이패드에서는 닿지 않습니다.
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
        </div>
      )}
    </section>
  )
}
