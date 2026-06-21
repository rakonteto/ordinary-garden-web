// 카테고리 표시용 이모지(LLM 발췌 도감이라 사진이 없어 아이콘으로 구분한다).
import type { CodexCategory } from './types'

export const CATEGORY_EMOJI: Record<CodexCategory, string> = {
  화훼: '🌸',
  관상수: '🌳',
  과수: '🍎',
  채소: '🥬',
  허브: '🌿',
  관엽: '🪴',
  다육: '🌵',
  기타: '🍃',
}
