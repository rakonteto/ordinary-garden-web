import type { ReactNode } from 'react'
import type { CareType } from '../data/types'

interface IconProps {
  size?: number
  className?: string
}

function Svg({ size = 24, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const GLYPHS: Record<CareType, ReactNode> = {
  water: <path d="M12 2.7S5.5 9.5 5.5 14.2a6.5 6.5 0 0 0 13 0C18.5 9.5 12 2.7 12 2.7z" />,
  fertilize: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8a8 8 0 0 1-9 10" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </>
  ),
  repot: (
    <>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v4h-4" />
    </>
  ),
}

export function CareTypeIcon({ type, size, className }: IconProps & { type: CareType }) {
  return <Svg size={size} className={className}>{GLYPHS[type]}</Svg>
}

export function RainIcon({ size, className }: IconProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M7 16a4 4 0 0 1-.5-7.96 5.5 5.5 0 0 1 10.6-1.04A3.5 3.5 0 0 1 17 14" />
      <path d="M8 18v2M12 18v3M16 18v2" />
    </Svg>
  )
}
