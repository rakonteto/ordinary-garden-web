// 식물 도감 레지스트리.
// 식물군(속)을 하나씩 추가해 누적한다. 표시·검색 로직은 도감 화면 단계에서 붙인다.

import type { CodexGenus } from './types'
import { hydrangea } from './plants/hydrangea'
import { peony } from './plants/peony'
import { rose } from './plants/rose'
import { vegetableLeaf } from './plants/vegetableLeaf'
import { vegetableFruit } from './plants/vegetableFruit'
import { fruitBerry } from './plants/fruitBerry'
import { fruitTree } from './plants/fruitTree'
import { herb } from './plants/herb'
import { foliage } from './plants/foliage'
import { flowerBulb } from './plants/flowerBulb'
import { flowerPerennial } from './plants/flowerPerennial'
import { flowerAnnual } from './plants/flowerAnnual'
import { flowerWoody } from './plants/flowerWoody'
import { succulent } from './plants/succulent'
import { ornamentalWoody } from './plants/ornamentalWoody'

export type { CodexCategory, CodexGenus, CodexSpecies, CodexVariety } from './types'

export const codex: CodexGenus[] = [
  hydrangea,
  peony,
  rose,
  ...vegetableLeaf,
  ...vegetableFruit,
  ...fruitBerry,
  ...fruitTree,
  ...herb,
  ...foliage,
  ...flowerBulb,
  ...flowerPerennial,
  ...flowerAnnual,
  ...flowerWoody,
  ...succulent,
  ...ornamentalWoody,
]
