import type { ReactNode } from 'react'
import type { Verdict } from '../api/types'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface-1 ${className}`}>{children}</div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

export function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="font-medium text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-muted">{hint}</p>}
    </div>
  )
}

const DIFFICULTY_STYLES: Record<string, string> = {
  EASY: 'text-good bg-good-soft',
  MEDIUM: 'text-warn bg-warn-soft',
  HARD: 'text-bad bg-bad-soft',
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${DIFFICULTY_STYLES[difficulty] ?? ''}`}
    >
      {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
    </span>
  )
}

export const VERDICT_LABELS: Record<Verdict, string> = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong answer',
  COMPILE_ERROR: 'Compile error',
  RUNTIME_ERROR: 'Runtime error',
  TIME_LIMIT: 'Time limit',
  JUDGE_ERROR: 'Judge error',
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const style =
    verdict === 'ACCEPTED'
      ? 'text-good bg-good-soft'
      : verdict === 'TIME_LIMIT'
        ? 'text-warn bg-warn-soft'
        : 'text-bad bg-bad-soft'
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {VERDICT_LABELS[verdict]}
    </span>
  )
}

export function ProgressRing({
  done,
  total,
  accent,
  size = 44,
}: {
  done: number
  total: number
  accent?: string
  size?: number
}) {
  const ratio = total > 0 ? done / total : 0
  const stroke = 4
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--line)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={accent ?? 'var(--brand)'}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - ratio)}
        className="transition-[stroke-dashoffset] duration-700"
      />
    </svg>
  )
}

export function XpPill({ xp }: { xp: number }) {
  return (
    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
      +{xp} XP
    </span>
  )
}
