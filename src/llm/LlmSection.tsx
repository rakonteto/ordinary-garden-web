import { useState } from 'react'
import { loadLlmSettings, saveProvider, saveBridgeToken, savePuterModel, PUTER_MODELS } from './settings'
import type { ProviderId } from './types'
import './LlmSection.css'

const OPTIONS: readonly { id: ProviderId; label: string; note: string }[] = [
  {
    id: 'handoff',
    label: '질문 복사해서 쓰는 AI 앱에 붙여넣기',
    note: '어느 기기에서나 됩니다. 이미 결제 중인 구독을 그대로 쓰는 길은 이것뿐입니다.',
  },
  {
    id: 'puter',
    label: 'Puter로 앱 안에서 바로 묻기',
    note: 'Puter 계정의 무료 월 할당량을 씁니다. 정원 기록이 Puter를 거쳐 갑니다.',
  },
  {
    id: 'bridge',
    label: '맥에서 쓰는 로컬 브리지',
    note: '맥에서 브리지를 띄웠을 때만 됩니다. 아이폰·아이패드에서는 닿지 않습니다.',
  },
]

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

  function pickModel(model: string) {
    savePuterModel(model)
    setSettings(loadLlmSettings())
  }

  return (
    <section className="llm-card">
      <h2 className="llm-title">돌봄 상담</h2>
      <p className="llm-muted">식물 상세에서 물어볼 때 어디로 물을지 고릅니다.</p>

      <fieldset className="llm-options">
        <legend className="llm-legend">묻는 곳</legend>
        {OPTIONS.map((option) => (
          <label key={option.id} className="llm-option">
            <input
              type="radio"
              name="llm-provider"
              value={option.id}
              checked={settings.provider === option.id}
              onChange={() => pickProvider(option.id)}
            />
            <span className="llm-option__body">
              <span className="llm-option__label">{option.label}</span>
              <span className="llm-muted">{option.note}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {settings.provider === 'puter' && (
        <div className="llm-field">
          <label className="llm-muted" htmlFor="llm-model">모델</label>
          <select
            id="llm-model"
            className="llm-input"
            value={settings.puterModel}
            onChange={(e) => pickModel(e.target.value)}
          >
            {PUTER_MODELS.map((model) => (
              <option key={model.id} value={model.id}>{model.label}</option>
            ))}
          </select>
        </div>
      )}

      {settings.provider === 'bridge' && (
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
