import { useState } from 'react'
import Sheet from '../garden/Sheet'
import { runConsult, canProviderAnswer } from './consult'
import { buildConsultPrompt } from './consultPrompt'
import { buildHandoffText } from './handoff'
import { loadLlmSettings } from './settings'
import type { Plant, JournalEntry, CareRule, WeatherSnapshot } from '../data/types'
import type { EntryInput } from '../journal/usePlantJournal'
import './ConsultSheet.css'

interface Props {
  plant: Plant
  areaName?: string
  entries: JournalEntry[]
  rules: CareRule[]
  weather?: WeatherSnapshot
  onClose: () => void
  onSaveEntry: (input: EntryInput) => Promise<void>
  asOfMs?: number
}

interface Failure {
  message: string
  hint?: string
}

export default function ConsultSheet({
  plant, areaName, entries, rules, weather, onClose, onSaveEntry, asOfMs,
}: Props) {
  // 설정은 시트를 여는 순간의 값으로 고정한다. 상담 도중에 경로가 바뀌면 혼란스럽다.
  const [settings] = useState(loadLlmSettings)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [running, setRunning] = useState(false)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [copied, setCopied] = useState(false)

  const now = asOfMs ?? Date.now()
  const direct = canProviderAnswer(settings.provider)
  const context = { plant, areaName, entries, rules, weather, question, asOfMs: now }

  async function ask() {
    setRunning(true)
    setFailure(null)
    setAnswer('')
    try {
      setAnswer(await runConsult(context, settings))
    } catch (error) {
      const e = error as Error & { hint?: string }
      setFailure({ message: e.message, hint: e.hint })
    } finally {
      setRunning(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildHandoffText(buildConsultPrompt(context)))
      setCopied(true)
    } catch {
      setFailure({
        message: '클립보드에 복사하지 못했습니다.',
        hint: '아래 질문을 길게 눌러 직접 복사해 주세요.',
      })
    }
  }

  async function save() {
    await onSaveEntry({
      date: now,
      note: `Q. ${question}\n\n${answer.trim()}`,
      tags: ['observe'],
      weatherSnapshot: weather,
    })
    onClose()
  }

  return (
    <Sheet
      title="돌봄 상담"
      onClose={onClose}
      onSave={() => void save()}
      canSave={answer.trim().length > 0 && question.trim().length > 0}
      saveLabel="일지로 저장"
    >
      <div className="consult__field">
        <label className="consult__label" htmlFor="consult-question">묻고 싶은 것</label>
        <textarea
          id="consult-question"
          className="consult__input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="예) 아래쪽 잎만 누렇게 떨어져요."
        />
      </div>

      <div className="consult__actions">
        {direct ? (
          <button
            type="button"
            className="consult__run"
            onClick={() => void ask()}
            disabled={running || question.trim().length === 0}
          >
            {running ? '묻는 중…' : '물어보기'}
          </button>
        ) : (
          <button
            type="button"
            className="consult__run"
            onClick={() => void copy()}
            disabled={question.trim().length === 0}
          >
            질문 복사
          </button>
        )}
        {!direct && copied && (
          <span className="consult__note">복사했습니다. 쓰시는 AI 앱에 붙여넣어 물어보세요.</span>
        )}
      </div>

      {failure && (
        <div className="consult__error" role="alert">
          <div>{failure.message}</div>
          {failure.hint && <div className="consult__error-hint">{failure.hint}</div>}
        </div>
      )}

      {direct
        ? answer && <div className="consult__answer">{answer}</div>
        : (
          <div className="consult__field">
            <label className="consult__label" htmlFor="consult-answer">받은 답 붙여넣기</label>
            <textarea
              id="consult-answer"
              className="consult__input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="AI 앱에서 받은 답을 여기에 붙여넣으면 일지로 남길 수 있습니다."
            />
          </div>
        )}
    </Sheet>
  )
}
